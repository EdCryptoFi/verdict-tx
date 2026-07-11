import type { MarketLive } from "@verdict/shared";
import type { MarketStore } from "./store.js";
import { txodds, hasCreds, type TxFixture } from "./txoddsData.js";
import { flag } from "./flags.js";

const POLL_FIXTURES_MS = 60_000; // refresh the fixture list every minute
const POLL_SCORES_MS = 15_000; // refresh live scores every 15s
const BETTING_WINDOW_MS = 90 * 60 * 1000; // markets close ~kickoff + 90'

function toMarket(f: TxFixture): MarketLive {
  const now = Date.now();
  const started = f.StartTime <= now;
  const done = now > f.StartTime + BETTING_WINDOW_MS;
  return {
    fixtureId: f.FixtureId,
    home: f.Participant1,
    away: f.Participant2,
    homeFlag: flag(f.Participant1),
    awayFlag: flag(f.Participant2),
    status: done ? "final" : started ? "live" : "upcoming",
    liveScore: [0, 0],
    matchMinute: 0,
    closeTs: f.StartTime,
    poolUsdc: 0,
    bettors: 0,
    momentumHome: 0.5,
    outcomes: [
      { label: "Home", odds: 2.1 },
      { label: "Draw", odds: 3.1 },
      { label: "Away", odds: 3.2 },
    ],
  };
}

function applyScore(m: MarketLive, s: any): Partial<MarketLive> {
  // Score snapshot may be an array of updates or a single object.
  const snap = Array.isArray(s) ? s[s.length - 1] : s;
  const g1 = snap?.Score?.Participant1?.Total?.Goals ?? m.liveScore[0];
  const g2 = snap?.Score?.Participant2?.Total?.Goals ?? m.liveScore[1];
  const minute = snap?.Clock?.Seconds ? Math.min(90, Math.floor(snap.Clock.Seconds / 60)) : m.matchMinute;
  const diff = g1 - g2;
  const momentumHome = Math.max(0.1, Math.min(0.9, 0.5 + diff * 0.12));
  return { liveScore: [g1, g2], matchMinute: minute, momentumHome };
}

/**
 * Real TxODDS feed: keep the World Cup fixture list fresh and stream live scores into the store,
 * which broadcasts to the frontend over WebSocket. Falls back to the caller's mock when no creds.
 */
export function startRealFeed(store: MarketStore): boolean {
  if (!hasCreds) return false;

  let liveIds: number[] = [];

  const refreshFixtures = async () => {
    try {
      const raw = await txodds.fixtures();
      const list: TxFixture[] = Array.isArray(raw) ? raw : raw.fixtures ?? [];
      const wc = list.filter((f) => f.Competition === "World Cup" || f.CompetitionId === 72);
      const chosen = (wc.length ? wc : list).slice(0, 6);
      for (const f of chosen) {
        if (!store.get(f.FixtureId)) store.upsert(toMarket(f));
      }
      liveIds = chosen.filter((f) => f.StartTime <= Date.now()).map((f) => f.FixtureId);
      console.log(`[realFeed] fixtures: ${chosen.length} (${liveIds.length} started)`);
    } catch (e: any) {
      console.error("[realFeed] fixtures error:", e.message);
    }
  };

  const refreshScores = async () => {
    for (const id of liveIds) {
      try {
        const s = await txodds.scores(id);
        const cur = store.get(id);
        if (cur) store.patch(id, applyScore(cur, s));
      } catch {
        /* fixture may not have live scores yet */
      }
    }
  };

  refreshFixtures().then(refreshScores);
  setInterval(refreshFixtures, POLL_FIXTURES_MS);
  setInterval(refreshScores, POLL_SCORES_MS);
  return true;
}
