import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { Pitchmarket } from "../target/types/pitchmarket";

const TXODDS = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const KIND_1X2 = 0;
const HOME_KEY = 1;
const AWAY_KEY = 2;
const PERIOD_FT = 0;
const DEC = 6;
const UNIT = 10 ** DEC;

const predicate = (comparison: number) => ({
  statAKey: HOME_KEY,
  statBKey: AWAY_KEY,
  period: PERIOD_FT,
  useStatB: true,
  op: 1, // Subtract
  threshold: 0,
  comparison, // 0 GT (Home), 2 EQ (Draw), 1 LT (Away)
});
const predicates1X2 = [predicate(0), predicate(2), predicate(1)]; // Home, Draw, Away
const OUT = { Home: 0, Draw: 1, Away: 2 };

const ZERO32 = Array(32).fill(0);
const dummyProof = [{ hash: ZERO32, isRightSibling: false }];
const statTerm = (key: number, value: number) => ({
  statToProve: { key, value, period: PERIOD_FT },
  eventStatRoot: ZERO32,
  statProof: dummyProof,
});
const fixtureSummary = (fixtureId: number) => ({
  fixtureId: new BN(fixtureId),
  updateStats: { updateCount: 1, minTimestamp: new BN(0), maxTimestamp: new BN(0) },
  eventsSubTreeRoot: ZERO32,
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("pitchmarket", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Pitchmarket as Program<Pitchmarket>;
  const conn = provider.connection;
  const admin = (provider.wallet as anchor.Wallet).payer;

  let mint: PublicKey;
  const A = Keypair.generate(); // bets Home
  const B = Keypair.generate(); // bets Away / Draw
  const C = Keypair.generate(); // bets Home

  const marketPda = (fixtureId: number) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("market"), new BN(fixtureId).toArrayLike(Buffer, "le", 8), Buffer.from([KIND_1X2])],
      program.programId
    )[0];
  const vaultPda = (market: PublicKey) =>
    PublicKey.findProgramAddressSync([Buffer.from("vault"), market.toBuffer()], program.programId)[0];
  const positionPda = (market: PublicKey, bettor: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("position"), market.toBuffer(), bettor.toBuffer()],
      program.programId
    )[0];

  // On-chain (validator) unix time — the resolve guard compares against this, not wall-clock.
  async function clusterTime(): Promise<number> {
    const slot = await conn.getSlot();
    return (await conn.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
  }
  async function waitClusterTime(tsSecs: number) {
    for (let i = 0; i < 60; i++) {
      if ((await clusterTime()) >= tsSecs) return;
      await sleep(500);
    }
  }

  async function ata(owner: PublicKey) {
    return (await getOrCreateAssociatedTokenAccount(conn, admin, mint, owner)).address;
  }
  async function balance(owner: PublicKey) {
    return Number((await getAccount(conn, await ata(owner))).amount);
  }

  async function makeRootsAccount(): Promise<PublicKey> {
    const roots = Keypair.generate();
    const lamports = await conn.getMinimumBalanceForRentExemption(8);
    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: admin.publicKey,
        newAccountPubkey: roots.publicKey,
        lamports,
        space: 8,
        programId: TXODDS,
      })
    );
    await provider.sendAndConfirm(tx, [roots]);
    return roots.publicKey;
  }

  async function createMarket(fixtureId: number, closeInSecs: number) {
    const market = marketPda(fixtureId);
    const closeTs = (await clusterTime()) + closeInSecs;
    await program.methods
      .createMarket(new BN(fixtureId), KIND_1X2, 3, new BN(closeTs), predicates1X2)
      .accountsPartial({
        authority: admin.publicKey,
        market,
        mint,
        vault: vaultPda(market),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    return { market, closeTs };
  }

  async function bet(fixtureId: number, bettor: Keypair, outcome: number, amount: number) {
    const market = marketPda(fixtureId);
    await program.methods
      .placeBet(outcome, new BN(amount))
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        position: positionPda(market, bettor.publicKey),
        vault: vaultPda(market),
        bettorTokenAccount: await ata(bettor.publicKey),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor])
      .rpc();
  }

  async function resolve(fixtureId: number, outcome: number, home: number, away: number, closeTs: number) {
    // Betting must be closed first (resolve guard, compared against cluster time).
    await waitClusterTime(closeTs + 1);
    const market = marketPda(fixtureId);
    const roots = await makeRootsAccount();
    await program.methods
      .resolve(
        outcome,
        new BN(Date.now()),
        fixtureSummary(fixtureId),
        dummyProof,
        dummyProof,
        statTerm(HOME_KEY, home),
        statTerm(AWAY_KEY, away)
      )
      .accountsPartial({
        cranker: admin.publicKey,
        market,
        txoddsProgram: TXODDS,
        dailyScoresMerkleRoots: roots,
      })
      .preInstructions([anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })])
      .rpc();
  }

  async function claim(fixtureId: number, bettor: Keypair) {
    const market = marketPda(fixtureId);
    await program.methods
      .claim()
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        position: positionPda(market, bettor.publicKey),
        vault: vaultPda(market),
        bettorTokenAccount: await ata(bettor.publicKey),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([bettor])
      .rpc();
  }

  async function claimRefund(fixtureId: number, bettor: Keypair) {
    const market = marketPda(fixtureId);
    await program.methods
      .claimRefund()
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        position: positionPda(market, bettor.publicKey),
        vault: vaultPda(market),
        bettorTokenAccount: await ata(bettor.publicKey),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([bettor])
      .rpc();
  }

  before(async () => {
    mint = await createMint(conn, admin, admin.publicKey, null, DEC);
    for (const b of [A, B, C]) {
      await conn.confirmTransaction(await conn.requestAirdrop(b.publicKey, 2 * LAMPORTS_PER_SOL));
      await mintTo(conn, admin, mint, await ata(b.publicKey), admin, 1000 * UNIT);
    }
  });

  it("full flow: two winners split the pool pro-rata; losers & double-claims rejected", async () => {
    const f = 900001;
    const { market, closeTs } = await createMarket(f, 4);
    await bet(f, A, OUT.Home, 100 * UNIT);
    await bet(f, C, OUT.Home, 100 * UNIT);
    await bet(f, B, OUT.Away, 100 * UNIT);

    let m = await program.account.market.fetch(market);
    assert.equal(m.totalPool.toNumber(), 300 * UNIT);

    await resolve(f, OUT.Home, 2, 1, closeTs); // Home 2-1

    m = await program.account.market.fetch(market);
    assert.equal(Object.keys(m.status)[0], "resolved");
    assert.equal(m.winningOutcome, OUT.Home);

    // Each Home winner: gross = 100*300/200 = 150, fee 1% → net 148.5.
    const a0 = await balance(A.publicKey);
    await claim(f, A);
    assert.equal((await balance(A.publicKey)) - a0, 148.5 * UNIT);
    const c0 = await balance(C.publicKey);
    await claim(f, C);
    assert.equal((await balance(C.publicKey)) - c0, 148.5 * UNIT);

    // Loser cannot claim.
    let threw = false;
    try {
      await claim(f, B);
    } catch (e: any) {
      threw = true;
      assert.match(e.toString(), /NothingToClaim/);
    }
    assert.isTrue(threw, "loser claim should fail");

    // Double claim rejected.
    threw = false;
    try {
      await claim(f, A);
    } catch (e: any) {
      threw = true;
      assert.match(e.toString(), /AlreadyClaimed/);
    }
    assert.isTrue(threw, "double claim should fail");
  });

  it("resolves a Draw", async () => {
    const f = 900002;
    const { market, closeTs } = await createMarket(f, 4);
    await bet(f, A, OUT.Home, 40 * UNIT);
    await bet(f, B, OUT.Draw, 60 * UNIT);
    await resolve(f, OUT.Draw, 1, 1, closeTs); // 1-1 → Draw

    const m = await program.account.market.fetch(market);
    assert.equal(Object.keys(m.status)[0], "resolved");
    assert.equal(m.winningOutcome, OUT.Draw);

    const b0 = await balance(B.publicKey);
    await claim(f, B); // sole Draw staker → whole pool minus fee
    assert.equal((await balance(B.publicKey)) - b0, 99 * UNIT); // 100 - 1%
  });

  it("rejects a false outcome (predicate does not hold)", async () => {
    const f = 900003;
    const { market, closeTs } = await createMarket(f, 4);
    await bet(f, A, OUT.Home, 10 * UNIT);
    await bet(f, B, OUT.Away, 10 * UNIT);

    // True score 2-1 (Home), but crank Away → stub returns false.
    await waitClusterTime(closeTs + 1);
    const roots = await makeRootsAccount();
    let threw = false;
    try {
      await program.methods
        .resolve(OUT.Away, new BN(Date.now()), fixtureSummary(f), dummyProof, dummyProof, statTerm(HOME_KEY, 2), statTerm(AWAY_KEY, 1))
        .accountsPartial({ cranker: admin.publicKey, market, txoddsProgram: TXODDS, dailyScoresMerkleRoots: roots })
        .preInstructions([anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })])
        .rpc();
    } catch (e: any) {
      threw = true;
      assert.match(e.toString(), /OracleValidationFailed/);
    }
    assert.isTrue(threw, "false outcome should be rejected");
    assert.equal(Object.keys((await program.account.market.fetch(market)).status)[0], "open");
  });

  it("cancel → refund returns every stake", async () => {
    const f = 900004;
    const { market } = await createMarket(f, 3600); // long window; authority cancels while open
    await bet(f, A, OUT.Home, 30 * UNIT);
    await bet(f, B, OUT.Away, 20 * UNIT);

    await program.methods
      .cancelMarket()
      .accountsPartial({ signer: admin.publicKey, market })
      .rpc();
    assert.equal(Object.keys((await program.account.market.fetch(market)).status)[0], "refunded");

    const a0 = await balance(A.publicKey);
    await claimRefund(f, A);
    assert.equal((await balance(A.publicKey)) - a0, 30 * UNIT);
    const b0 = await balance(B.publicKey);
    await claimRefund(f, B);
    assert.equal((await balance(B.publicKey)) - b0, 20 * UNIT);
  });

  it("resolve with no stake on the winning outcome → refund", async () => {
    const f = 900005;
    const { market, closeTs } = await createMarket(f, 4);
    await bet(f, A, OUT.Home, 25 * UNIT);
    await bet(f, B, OUT.Draw, 25 * UNIT);
    // True score 0-1 → Away wins, but nobody staked Away.
    await resolve(f, OUT.Away, 0, 1, closeTs);

    const m = await program.account.market.fetch(market);
    assert.equal(Object.keys(m.status)[0], "refunded");

    const a0 = await balance(A.publicKey);
    await claimRefund(f, A);
    assert.equal((await balance(A.publicKey)) - a0, 25 * UNIT);
  });
});
