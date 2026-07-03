import { Keypair, ComputeBudgetProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  Outcome1X2,
  dailyScoresRootsPda,
  marketPda,
  mapProof,
  mapStatTerm,
  MarketKind,
  TXODDS_PROGRAM_ID,
} from "@verdict/shared";
import { getProgram } from "./program.js";
import { getStatValidation } from "./txodds.js";
import { STAT } from "./mock.js";

/**
 * Resolve a 1X2 market: fetch the TxODDS Merkle proofs for home & away goals, decide the
 * winning outcome, and submit `resolve`, which CPIs into TxODDS `validate_stat` to verify it.
 */
export async function resolveMarket1X2(opts: {
  cranker: Keypair;
  fixtureId: number;
  seq: number; // scores event sequence number
}): Promise<void> {
  const program = getProgram(opts.cranker);
  const kind = MarketKind.FullTime1X2;
  const [market] = marketPda(BigInt(opts.fixtureId), kind);

  // Pull a single proof carrying both stats (statKey + statKey2) → home & away goals.
  const v = await getStatValidation({
    fixtureId: opts.fixtureId,
    seq: opts.seq,
    statKey: STAT.HOME_GOALS,
    statKey2: STAT.AWAY_GOALS,
  });

  const home = v.statToProve.value;
  const away = v.statToProve2?.value ?? 0;
  const winning =
    home > away ? Outcome1X2.Home : home === away ? Outcome1X2.Draw : Outcome1X2.Away;

  const fixtureSummary = {
    fixtureId: new BN(v.summary.fixtureId),
    updateStats: {
      updateCount: v.summary.updateStats.updateCount,
      minTimestamp: new BN(v.summary.updateStats.minTimestamp),
      maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
    },
    eventsSubTreeRoot: Array.from(Buffer.from(v.summary.eventStatsSubTreeRoot, "base64")),
  };

  const statA = mapStatTerm({
    statToProve: { key: STAT.HOME_GOALS, value: home, period: STAT.FULL_TIME },
    eventStatRoot: v.eventStatRoot,
    statProof: v.statProof,
  });
  const statB = mapStatTerm({
    statToProve: { key: STAT.AWAY_GOALS, value: away, period: STAT.FULL_TIME },
    eventStatRoot: v.eventStatRoot,
    statProof: v.statProof2 ?? v.statProof,
  });

  const [dailyScoresRoots] = dailyScoresRootsPda(v.ts);

  await program.methods
    .resolve(
      winning,
      new BN(v.ts),
      fixtureSummary,
      mapProof(v.subTreeProof),
      mapProof(v.mainTreeProof),
      statA,
      statB
    )
    .accountsPartial({
      cranker: opts.cranker.publicKey,
      market,
      txoddsProgram: TXODDS_PROGRAM_ID,
      dailyScoresMerkleRoots: dailyScoresRoots,
    })
    .preInstructions([ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })])
    .rpc();

  console.log(
    `✅ resolved fixture=${opts.fixtureId} → outcome=${winning} (${home}-${away}), TxODDS-verified`
  );
}
