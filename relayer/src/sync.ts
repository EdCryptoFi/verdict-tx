/**
 * Market-sync routine: keep on-chain markets in sync with the live TxODDS World Cup fixtures.
 *
 * Each tick it: pulls current World Cup fixtures, creates a 1X2 market for any fixture without one
 * (betting closes at kickoff), and resolves any open market whose match has finished (real
 * validate_stat CPI). Uses the same devnet config + TxODDS creds as the other scripts.
 */
import { PublicKey } from "@solana/web3.js";
import { marketPda, MarketKind } from "@verdict/shared";
import { adminKeypair, config } from "./config.js";
import { getProgram } from "./program.js";
import { createMarket1X2 } from "./createMarket.js";
import { resolveMarketReal, latestSeq } from "./resolveReal.js";
import { txodds } from "./txoddsData.js";

const TICK_MS = Number(process.env.SYNC_TICK_MS ?? 60_000);
const FINISHED_AFTER_MS = 100 * 60 * 1000; // final ~100' after kickoff

interface Fx {
  fixtureId: number;
  home: string;
  away: string;
  startMs: number;
}

async function worldCupFixtures(): Promise<Fx[]> {
  const raw: any = await txodds.fixturesSnapshot();
  const list: any[] = Array.isArray(raw) ? raw : raw.fixtures ?? [];
  return list
    .filter((f) => f.Competition === "World Cup" || f.CompetitionId === 72)
    .map((f) => ({ fixtureId: f.FixtureId, home: f.Participant1, away: f.Participant2, startMs: f.StartTime }));
}

async function tick() {
  const admin = adminKeypair();
  const program = getProgram(admin);
  const mint = new PublicKey(config.usdcMint);
  const now = Date.now();

  let fixtures: Fx[];
  try {
    fixtures = await worldCupFixtures();
  } catch (e: any) {
    console.error(`[sync] fixtures error: ${e.message}`);
    return;
  }
  console.log(`[sync] ${fixtures.length} World Cup fixtures`);

  for (const f of fixtures) {
    const [pda] = marketPda(BigInt(f.fixtureId), MarketKind.FullTime1X2);
    const existing = await program.account.market.fetchNullable(pda);

    if (!existing) {
      try {
        await createMarket1X2({ admin, fixtureId: f.fixtureId, mint, bettingCloseTs: Math.floor(f.startMs / 1000) });
        console.log(`[sync] + market ${f.fixtureId} ${f.home} v ${f.away}`);
      } catch (e: any) {
        console.error(`[sync] create ${f.fixtureId} failed: ${e.message?.split("\n")[0]}`);
      }
      continue;
    }

    const finished = now > f.startMs + FINISHED_AFTER_MS;
    if (finished && Object.keys(existing.status)[0] === "open") {
      const seq = await latestSeq(f.fixtureId);
      if (seq == null) continue;
      try {
        const sig = await resolveMarketReal(admin, f.fixtureId, seq);
        console.log(`[sync] ✓ resolved ${f.fixtureId} · ${sig.slice(0, 8)}…`);
      } catch (e: any) {
        console.error(`[sync] resolve ${f.fixtureId} pending: ${e.message?.split("\n")[0]}`);
      }
    }
  }
}

console.log(`Verdict market-sync · every ${TICK_MS / 1000}s · cluster=${config.cluster}`);
await tick();
setInterval(() => tick().catch((e) => console.error(e)), TICK_MS);
