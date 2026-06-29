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

// PredicateSpec helpers (mirror shared/build1X2Predicates).
const predicate = (comparison: number) => ({
  statAKey: HOME_KEY,
  statBKey: AWAY_KEY,
  period: PERIOD_FT,
  useStatB: true,
  op: 1, // Subtract
  threshold: 0,
  comparison, // 0 GT (Home), 1 LT (Away), 2 EQ (Draw)
});
const predicates1X2 = [predicate(0), predicate(2), predicate(1)]; // Home, Draw, Away

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

describe("pitchmarket", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Pitchmarket as Program<Pitchmarket>;
  const conn = provider.connection;
  const admin = (provider.wallet as anchor.Wallet).payer;

  let mint: PublicKey;
  const bettorHome = Keypair.generate();
  const bettorAway = Keypair.generate();

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

  async function makeRootsAccount(): Promise<PublicKey> {
    const roots = Keypair.generate();
    const lamports = await conn.getMinimumBalanceForRentExemption(8);
    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: admin.publicKey,
        newAccountPubkey: roots.publicKey,
        lamports,
        space: 8,
        programId: TXODDS, // account owned by the TxODDS (stub) program
      })
    );
    await provider.sendAndConfirm(tx, [roots]);
    return roots.publicKey;
  }

  before(async () => {
    mint = await createMint(conn, admin, admin.publicKey, null, DEC);
    for (const b of [bettorHome, bettorAway]) {
      await conn.confirmTransaction(await conn.requestAirdrop(b.publicKey, 2 * LAMPORTS_PER_SOL));
      const ata = await getOrCreateAssociatedTokenAccount(conn, admin, mint, b.publicKey);
      await mintTo(conn, admin, mint, ata.address, admin, 1000 * UNIT);
    }
  });

  async function bet(fixtureId: number, bettor: Keypair, outcome: number, amount: number) {
    const market = marketPda(fixtureId);
    const ata = await getOrCreateAssociatedTokenAccount(conn, admin, mint, bettor.publicKey);
    await program.methods
      .placeBet(outcome, new BN(amount))
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        position: positionPda(market, bettor.publicKey),
        vault: vaultPda(market),
        bettorTokenAccount: ata.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor])
      .rpc();
  }

  async function createMarket(fixtureId: number) {
    const market = marketPda(fixtureId);
    await program.methods
      .createMarket(new BN(fixtureId), KIND_1X2, 3, new BN(Math.floor(Date.now() / 1000) + 3600), predicates1X2)
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
    return market;
  }

  it("runs the full flow: create → bet → resolve (CPI) → claim", async () => {
    const fixtureId = 900001;
    const market = await createMarket(fixtureId);
    await bet(fixtureId, bettorHome, 0, 100 * UNIT); // Home
    await bet(fixtureId, bettorAway, 2, 50 * UNIT); // Away

    let m = await program.account.market.fetch(market);
    assert.equal(m.totalPool.toNumber(), 150 * UNIT);

    // Final score: Home 2 - 1 Away → Home wins (outcome 0).
    const roots = await makeRootsAccount();
    await program.methods
      .resolve(
        0,
        new BN(Date.now()),
        fixtureSummary(fixtureId),
        dummyProof,
        dummyProof,
        statTerm(HOME_KEY, 2),
        statTerm(AWAY_KEY, 1)
      )
      .accountsPartial({
        cranker: admin.publicKey,
        market,
        txoddsProgram: TXODDS,
        dailyScoresMerkleRoots: roots,
      })
      .preInstructions([anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })])
      .rpc();

    m = await program.account.market.fetch(market);
    assert.equal(Object.keys(m.status)[0], "resolved");
    assert.equal(m.winningOutcome, 0);

    // Winner (Home) claims ~ entire pool minus 1% fee.
    const winnerAta = (await getOrCreateAssociatedTokenAccount(conn, admin, mint, bettorHome.publicKey)).address;
    const before = Number((await getAccount(conn, winnerAta)).amount);
    await program.methods
      .claim()
      .accountsPartial({
        bettor: bettorHome.publicKey,
        market,
        position: positionPda(market, bettorHome.publicKey),
        vault: vaultPda(market),
        bettorTokenAccount: winnerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([bettorHome])
      .rpc();
    const after = Number((await getAccount(conn, winnerAta)).amount);
    const payout = after - before;
    // gross = 150, fee 1% = 1.5, net = 148.5
    assert.equal(payout, 148.5 * UNIT);
  });

  it("rejects a false outcome (predicate does not hold)", async () => {
    const fixtureId = 900002;
    const market = await createMarket(fixtureId);
    await bet(fixtureId, bettorHome, 0, 10 * UNIT);
    await bet(fixtureId, bettorAway, 2, 10 * UNIT);

    // True score Home 2 - 1 Away, but we crank winning_outcome = Away (2). Stub returns false.
    const roots = await makeRootsAccount();
    let threw = false;
    try {
      await program.methods
        .resolve(
          2,
          new BN(Date.now()),
          fixtureSummary(fixtureId),
          dummyProof,
          dummyProof,
          statTerm(HOME_KEY, 2),
          statTerm(AWAY_KEY, 1)
        )
        .accountsPartial({
          cranker: admin.publicKey,
          market,
          txoddsProgram: TXODDS,
          dailyScoresMerkleRoots: roots,
        })
        .preInstructions([anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })])
        .rpc();
    } catch (e: any) {
      threw = true;
      assert.match(e.toString(), /OracleValidationFailed/);
    }
    assert.isTrue(threw, "resolve should have failed for a false outcome");

    const m = await program.account.market.fetch(market);
    assert.equal(Object.keys(m.status)[0], "open");
  });
});
