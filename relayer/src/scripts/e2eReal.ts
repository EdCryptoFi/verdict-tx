/**
 * Full end-to-end on devnet with REAL TxODDS data:
 *   create market (real fixture, period=4 predicates) → bet → resolve via OUR program's CPI
 *   into the REAL TxODDS validate_stat → claim.
 *
 * Usage: SOLANA_RPC_URL=devnet USDC_MINT=<mint> e2eReal.ts <fixtureId> <seq>
 */
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, ComputeBudgetProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, getAccount } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  build1X2Predicates,
  marketPda,
  vaultPda,
  positionPda,
  dailyScoresRootsPda,
  MarketKind,
  Outcome1X2,
  TXODDS_PROGRAM_ID,
} from "@verdict/shared";
import { adminKeypair, connection, config } from "../config.js";
import { getProgram } from "../program.js";
import { resolveMarketReal } from "../resolveReal.js";
import { txodds } from "../txoddsData.js";

const HOME_KEY = 1, AWAY_KEY = 2, PERIOD_FT = 4;
const fixtureId = Number(process.argv[2] ?? 18192996);
const seq = Number(process.argv[3] ?? 770);
const UNIT = 1e6;

const admin = adminKeypair();
const program = getProgram(admin);
const conn = connection();
const mint = new PublicKey(config.usdcMint);
// MARKET_KIND lets us open a fresh market PDA for a fixture that already has one (kind is part of
// the seed), so the full flow can be re-proven against a real, already-finished match.
const kind = Number(process.env.MARKET_KIND ?? MarketKind.FullTime1X2);
const [market] = marketPda(BigInt(fixtureId), kind);
const [vault] = vaultPda(market);
const adminAta = (await getOrCreateAssociatedTokenAccount(conn, admin, mint, admin.publicKey)).address;

const clusterNow = async () => (await conn.getBlockTime(await conn.getSlot())) ?? Math.floor(Date.now() / 1000);

// 1) Create market (idempotent-ish: skip if exists)
const exists = await program.account.market.fetchNullable(market);
if (!exists) {
  const closeTs = (await clusterNow()) + 25;
  const predicates = build1X2Predicates(HOME_KEY, AWAY_KEY, PERIOD_FT);
  await program.methods
    .createMarket(new BN(fixtureId), kind, 3, new BN(closeTs), predicates)
    .accountsPartial({
      authority: admin.publicKey, market, mint, vault,
      tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId, rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();
  console.log(`① market created ${market.toBase58()} (closes in 25s)`);

  // 2) Bet: Away (winner) 20, Home (loser) 10
  for (const [outcome, amt] of [[Outcome1X2.Away, 20], [Outcome1X2.Home, 10]] as const) {
    await program.methods.placeBet(outcome, new BN(amt * UNIT))
      .accountsPartial({
        bettor: admin.publicKey, market, position: positionPda(market, admin.publicKey)[0],
        vault, bettorTokenAccount: adminAta, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      }).rpc();
    console.log(`② bet ${amt} USDC on outcome ${outcome}`);
  }
} else {
  console.log(`① market already exists (status=${Object.keys(exists.status)[0]})`);
}

// 3) Wait until betting closed
const m0 = await program.account.market.fetch(market);
while ((await clusterNow()) < m0.bettingCloseTs.toNumber() + 1) {
  console.log("   …waiting for betting to close");
  await new Promise((r) => setTimeout(r, 3000));
}

// 4) Resolve via our program → CPI into REAL TxODDS validate_stat
const v: any = await txodds.statValidation({ fixtureId, seq, statKey: HOME_KEY, statKey2: AWAY_KEY });
const home = v.statToProve.value, away = v.statToProve2.value;
const winning = home > away ? Outcome1X2.Home : home === away ? Outcome1X2.Draw : Outcome1X2.Away;
const targetTs = Number(v.summary.updateStats.minTimestamp);
const [dailyScoresRoots] = dailyScoresRootsPda(targetTs);
console.log(`③ resolving: ${home}-${away} → outcome ${winning}; ts=${targetTs}`);

const pn = (a: any[]) => a.map((n) => ({ hash: n.hash, isRightSibling: n.isRightSibling }));
const st = (s: any, p: any[]) => ({ statToProve: { key: s.key, value: s.value, period: s.period }, eventStatRoot: v.eventStatRoot, statProof: pn(p) });
const fixtureSummary = {
  fixtureId: new BN(v.summary.fixtureId),
  updateStats: {
    updateCount: v.summary.updateStats.updateCount,
    minTimestamp: new BN(v.summary.updateStats.minTimestamp),
    maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
  },
  eventsSubTreeRoot: v.summary.eventStatsSubTreeRoot,
};

const status = Object.keys((await program.account.market.fetch(market)).status)[0];
const poolBefore = Number((await program.account.market.fetch(market)).totalPool.toString());
const feeAcctBefore = Number((await getAccount(conn, adminAta)).amount);

if (status === "open") {
  // Same code path the daily sync uses — no duplicated resolve builder to drift out of sync.
  await resolveMarketReal(admin, fixtureId, seq, kind);
}
const mr = await program.account.market.fetch(market);
const poolAfter = Number(mr.totalPool.toString());
console.log(`   ✅ market status=${Object.keys(mr.status)[0]} winningOutcome=${mr.winningOutcome}`);

if (status === "open" && Object.keys(mr.status)[0] === "resolved") {
  // The 1% protocol fee is raked off the top at settlement, straight into the authority's ATA.
  const feeAcctAfter = Number((await getAccount(conn, adminAta)).amount);
  console.log(
    `   💰 fee raked: pool ${poolBefore / UNIT} → ${poolAfter / UNIT} USDC; ` +
      `authority received ${(feeAcctAfter - feeAcctBefore) / UNIT} USDC`
  );
}

// 5) Claim
if (Object.keys(mr.status)[0] === "resolved") {
  const before = Number((await getAccount(conn, adminAta)).amount);
  await program.methods.claim()
    .accountsPartial({ bettor: admin.publicKey, market, position: positionPda(market, admin.publicKey)[0], vault, bettorTokenAccount: adminAta, tokenProgram: TOKEN_PROGRAM_ID })
    .rpc();
  const after = Number((await getAccount(conn, adminAta)).amount);
  console.log(`④ claimed → +${(after - before) / UNIT} USDC`);
}
console.log("\n🏆 END-TO-END with REAL TxODDS data complete.");
