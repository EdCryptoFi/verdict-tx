/**
 * Recorded mock data so the pipeline runs without live TxODDS credentials.
 *
 * NOTE: mock Merkle proofs are structurally valid but will NOT pass the real TxODDS
 * `validate_stat` CPI (no matching on-chain root). Use mock mode to exercise the relayer
 * plumbing and the program's pre-CPI binding checks; for a true end-to-end resolve, run
 * against the TxODDS devnet program with a real fixture proof (or a local stub program).
 */
import type { Fixture, ScoresStatValidation } from "./txodds.js";

// Placeholder stat keys/period — confirm real World Cup goal keys with TxODDS.
// Real TxODDS score stat keys: 1 = home (Participant1) goals, 2 = away goals; period 4 = full-time.
export const STAT = { HOME_GOALS: 1, AWAY_GOALS: 2, FULL_TIME: 4 };

export function mockFixtures(): Fixture[] {
  return [
    {
      fixtureId: 900001,
      startTime: Date.now() + 60 * 60 * 1000,
      league: "FIFA World Cup",
      home: "Brazil",
      away: "Argentina",
    },
    {
      fixtureId: 900002,
      startTime: Date.now() + 3 * 60 * 60 * 1000,
      league: "FIFA World Cup",
      home: "France",
      away: "England",
    },
  ];
}

const zeroHash = Buffer.alloc(32).toString("base64");

/** A recorded "Brazil 2 x 1 Argentina" final, full-time. */
export function mockScoreValidation(params: {
  fixtureId: number;
  seq: number;
  statKey: number;
  statKey2?: number;
}): ScoresStatValidation {
  const value = params.statKey === STAT.HOME_GOALS ? 2 : 1;
  return {
    ts: Date.now(),
    statToProve: { key: params.statKey, value, period: STAT.FULL_TIME },
    eventStatRoot: zeroHash,
    summary: {
      fixtureId: params.fixtureId,
      updateStats: { updateCount: 1, minTimestamp: Date.now(), maxTimestamp: Date.now() },
      eventStatsSubTreeRoot: zeroHash,
    },
    statProof: [{ hash: zeroHash, isRightSibling: false }],
    subTreeProof: [{ hash: zeroHash, isRightSibling: false }],
    mainTreeProof: [{ hash: zeroHash, isRightSibling: false }],
  };
}
