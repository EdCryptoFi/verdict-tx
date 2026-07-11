/**
 * Resolve a 1X2 market against the REAL TxODDS data (the proven path used by e2eReal/goldenTest):
 * fetch the score Merkle proof, decide the winner, and submit `resolve`, which CPIs into the real
 * TxODDS `validate_stat`. The `ts` arg + daily_scores_roots PDA both use summary.minTimestamp.
 */
import { Keypair, ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Outcome1X2, dailyScoresRootsPda, marketPda, vaultPda, MarketKind, TXODDS_PROGRAM_ID } from "@verdict/shared";
import { getProgram } from "./program.js";
import { txodds } from "./txoddsData.js";

const HOME_KEY = 1, AWAY_KEY = 2;

const pn = (a: any[]) => a.map((n) => ({ hash: n.hash, isRightSibling: n.isRightSibling }));
const st = (root: any) => (s: any, proof: any[]) => ({
  statToProve: { key: s.key, value: s.value, period: s.period },
  eventStatRoot: root,
  statProof: pn(proof),
});

/** Resolve fixtureId's market using the score at sequence `seq`. Throws if the proof isn't final yet. */
export async function resolveMarketReal(
  cranker: Keypair,
  fixtureId: number,
  seq: number,
  kind: number = MarketKind.FullTime1X2
): Promise<string> {
  const program = getProgram(cranker);
  const [market] = marketPda(BigInt(fixtureId), kind);
  const [vault] = vaultPda(market);

  // The protocol fee is raked at settlement into the authority's ATA. `resolve` only *checks* that
  // account (the Merkle proofs leave no room to create it inline), so make sure it exists first —
  // a separate, cheap transaction that costs the resolve tx nothing in size.
  const onchain = await program.account.market.fetch(market);
  const mint = onchain.mint as PublicKey;
  const authority = onchain.authority as PublicKey;
  const feeDestination = (
    await getOrCreateAssociatedTokenAccount(program.provider.connection, cranker, mint, authority, true)
  ).address;

  const v: any = await txodds.statValidation({ fixtureId, seq, statKey: HOME_KEY, statKey2: AWAY_KEY });
  const home = v.statToProve.value;
  const away = v.statToProve2?.value ?? 0;
  const winning = home > away ? Outcome1X2.Home : home === away ? Outcome1X2.Draw : Outcome1X2.Away;

  const targetTs = Number(v.summary.updateStats.minTimestamp);
  const [dailyScoresRoots] = dailyScoresRootsPda(targetTs);
  const mk = st(v.eventStatRoot);
  const fixtureSummary = {
    fixtureId: new BN(v.summary.fixtureId),
    updateStats: {
      updateCount: v.summary.updateStats.updateCount,
      minTimestamp: new BN(v.summary.updateStats.minTimestamp),
      maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
    },
    eventsSubTreeRoot: v.summary.eventStatsSubTreeRoot,
  };

  return program.methods
    .resolve(winning, new BN(targetTs), fixtureSummary, pn(v.subTreeProof), pn(v.mainTreeProof), mk(v.statToProve, v.statProof), mk(v.statToProve2, v.statProof2 ?? v.statProof))
    .accountsPartial({
      cranker: cranker.publicKey,
      market,
      vault,
      feeDestination,
      txoddsProgram: TXODDS_PROGRAM_ID,
      dailyScoresMerkleRoots: dailyScoresRoots,
    })
    .preInstructions([ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 })])
    .rpc();
}

/** Latest score-event sequence number for a fixture (for resolution), or null if none. */
export async function latestSeq(fixtureId: number): Promise<number | null> {
  try {
    const s: any = await txodds.scoresSnapshot(fixtureId);
    const snap = Array.isArray(s) ? s[s.length - 1] : s;
    return typeof snap?.Seq === "number" ? snap.Seq : null;
  } catch {
    return null;
  }
}
