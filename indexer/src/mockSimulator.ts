import type { MarketLive } from "@pitchmarket/shared";
import type { MarketStore } from "./store.js";

/**
 * Simulates two live World Cup matches: minutes tick, goals happen, the pool grows, bettors
 * join, odds drift and momentum shifts. Lets the frontend's live counters move convincingly
 * without TxODDS credentials. Replace with the real SSE + on-chain readers when creds arrive.
 */
const seed = (): MarketLive[] => [
  {
    fixtureId: 900001,
    home: "Brazil",
    away: "Argentina",
    homeFlag: "🇧🇷",
    awayFlag: "🇦🇷",
    status: "live",
    liveScore: [2, 1],
    matchMinute: 67,
    closeTs: Date.now() + 4 * 60 * 1000 + 11 * 1000,
    poolUsdc: 12480,
    bettors: 237,
    momentumHome: 0.68,
    outcomes: [
      { label: "Home", odds: 1.85 },
      { label: "Draw", odds: 3.2 },
      { label: "Away", odds: 4.1 },
    ],
  },
  {
    fixtureId: 900002,
    home: "France",
    away: "England",
    homeFlag: "🇫🇷",
    awayFlag: "🏴",
    status: "live",
    liveScore: [0, 0],
    matchMinute: 12,
    closeTs: Date.now() + 18 * 60 * 1000,
    poolUsdc: 5310,
    bettors: 96,
    momentumHome: 0.52,
    outcomes: [
      { label: "Home", odds: 2.1 },
      { label: "Draw", odds: 2.9 },
      { label: "Away", odds: 3.4 },
    ],
  },
];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const drift = (n: number, by: number) => n + (Math.random() - 0.5) * by;

export function startMockSimulator(store: MarketStore) {
  for (const m of seed()) store.upsert(m);

  setInterval(() => {
    for (const m of store.all()) {
      if (m.status !== "live") continue;

      // Pool + bettors grow.
      const newBets = Math.random() < 0.6 ? 1 + Math.floor(Math.random() * 3) : 0;
      const poolDelta = newBets * (20 + Math.floor(Math.random() * 180));

      // Match clock.
      const minute = clamp(m.matchMinute + (Math.random() < 0.5 ? 1 : 0), 0, 90);

      // Occasional goal → score + momentum swing.
      let [h, a] = m.liveScore;
      let momentum = clamp(drift(m.momentumHome, 0.04), 0.05, 0.95);
      if (Math.random() < 0.04) {
        if (Math.random() < momentum) {
          h += 1;
          momentum = clamp(momentum + 0.12, 0.05, 0.95);
        } else {
          a += 1;
          momentum = clamp(momentum - 0.12, 0.05, 0.95);
        }
      }

      // Odds drift with momentum.
      const outcomes = [
        { label: "Home", odds: +clamp(drift(m.outcomes[0].odds, 0.05), 1.1, 9).toFixed(2) },
        { label: "Draw", odds: +clamp(drift(m.outcomes[1].odds, 0.05), 1.5, 9).toFixed(2) },
        { label: "Away", odds: +clamp(drift(m.outcomes[2].odds, 0.05), 1.1, 9).toFixed(2) },
      ];

      store.patch(m.fixtureId, {
        matchMinute: minute,
        liveScore: [h, a],
        poolUsdc: m.poolUsdc + poolDelta,
        bettors: m.bettors + newBets,
        momentumHome: momentum,
        outcomes,
        status: minute >= 90 ? "final" : "live",
      });
    }
  }, 2000);
}
