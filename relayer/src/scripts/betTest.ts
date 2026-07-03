/** Smoke test: place a bet on the live devnet market from the admin wallet. */
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { MarketKind, marketPda, vaultPda, positionPda } from "@verdict/shared";
import { adminKeypair, config } from "../config.js";
import { getProgram } from "../program.js";

const fixtureId = Number(process.argv[2] ?? 900001);
const outcome = Number(process.argv[3] ?? 0); // Home
const amountUi = Number(process.argv[4] ?? 10);

const admin = adminKeypair();
const program = getProgram(admin);
const mint = new PublicKey(config.usdcMint);
const [market] = marketPda(BigInt(fixtureId), MarketKind.FullTime1X2);
const [vault] = vaultPda(market);
const [position] = positionPda(market, admin.publicKey);
const ata = getAssociatedTokenAddressSync(mint, admin.publicKey);

const sig = await program.methods
  .placeBet(outcome, new BN(amountUi * 1e6))
  .accountsPartial({
    bettor: admin.publicKey,
    market,
    position,
    vault,
    bettorTokenAccount: ata,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
console.log(`✅ bet ${amountUi} USDC on outcome ${outcome} · ${sig}`);

const m = await program.account.market.fetch(market);
console.log(`market total_pool = ${m.totalPool.toNumber() / 1e6} USDC`);
console.log(`pool_per_outcome = ${(m.poolPerOutcome as BN[]).map((x) => x.toNumber() / 1e6).join(", ")}`);
const p = await program.account.position.fetch(position);
console.log(`my stake = ${(p.stakePerOutcome as BN[]).map((x) => x.toNumber() / 1e6).join(", ")}`);
