/**
 * One-shot market sync: pull the live TxODDS World Cup fixtures, create a 1X2 market for any
 * fixture without one (betting closes at kickoff), and resolve any open market whose match has
 * finished (real validate_stat CPI). Safe to call from a loop (sync.ts) or a serverless cron
 * (/api/sync.ts) — it performs no long-lived work and returns a summary of what it did.
 */
import { PublicKey } from "@solana/web3.js";
import { marketPda, MarketKind } from "@verdict/shared";
import { adminKeypair, config } from "./config.js";
import { getProgram } from "./program.js";
import { createMarket1X2 } from "./createMarket.js";
import { resolveMarketReal, latestSeq } from "./resolveReal.js";
import { txodds } from "./txoddsData.js";

const FINISHED_AFTER_MS = 100 * 60 * 1000; // final ~100' after kickoff

interface Fx {
  fixtureId: number;
  home: string;
  away: string;
  startMs: number;
}

export interface SyncResult {
  fixtures: number;
  created: number[];
  resolved: number[];
  errors: string[];
}

async function worldCupFixtures(): Promise<Fx[]> {
  const raw: any = await txodds.fixturesSnapshot();
  const list: any[] = Array.isArray(raw) ? raw : raw.fixtures ?? [];
  return list
    .filter((f) => f.Competition === "World Cup" || f.CompetitionId === 72)
    .map((f) => ({ fixtureId: f.FixtureId, home: f.Participant1, away: f.Participant2, startMs: f.StartTime }));
}

/** Run a single sync pass. Never throws — collects per-fixture errors into the result. */
export async function runSyncOnce(): Promise<SyncResult> {
  const result: SyncResult = { fixtures: 0, created: [], resolved: [], errors: [] };
  const admin = adminKeypair();
  const program = getProgram(admin);
  const mint = new PublicKey(config.usdcMint);
  const now = Date.now();

  let fixtures: Fx[];
  try {
    fixtures = await worldCupFixtures();
  } catch (e: any) {
    result.errors.push(`fixtures: ${e.message}`);
    return result;
  }
  result.fixtures = fixtures.length;

  for (const f of fixtures) {
    const [pda] = marketPda(BigInt(f.fixtureId), MarketKind.FullTime1X2);
    const existing = await program.account.market.fetchNullable(pda);

    if (!existing) {
      try {
        await createMarket1X2({ admin, fixtureId: f.fixtureId, mint, bettingCloseTs: Math.floor(f.startMs / 1000) });
        result.created.push(f.fixtureId);
      } catch (e: any) {
        result.errors.push(`create ${f.fixtureId}: ${e.message?.split("\n")[0]}`);
      }
      continue;
    }

    const finished = now > f.startMs + FINISHED_AFTER_MS;
    if (finished && Object.keys(existing.status)[0] === "open") {
      const seq = await latestSeq(f.fixtureId);
      if (seq == null) continue;
      try {
        await resolveMarketReal(admin, f.fixtureId, seq);
        result.resolved.push(f.fixtureId);
      } catch (e: any) {
        result.errors.push(`resolve ${f.fixtureId}: ${e.message?.split("\n")[0]}`);
      }
    }
  }

  return result;
}
