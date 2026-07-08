import type { MarketLive } from "@verdict/shared";

/**
 * Real 2026 World Cup fixtures from the TxODDS API, used as the demo seed (the indexer's live
 * feed replaces these when running). Mexico v England is a real finished match (2–3) whose
 * market we settled on-chain via CPI into TxODDS validate_stat. Portugal v Spain has an open
 * on-chain market for real betting.
 */
export const DEMO_MARKETS: MarketLive[] = [
  {
    fixtureId: 18192996,
    home: "Mexico",
    away: "England",
    homeFlag: "🇲🇽",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    status: "final",
    liveScore: [2, 3],
    matchMinute: 90,
    closeTs: Date.now() - 60_000,
    poolUsdc: 30,
    bettors: 2,
    momentumHome: 0.35,
    winningOutcome: 2,
    settlementTx: "2j5y3Fah5ErQhdrFFRd2ocFbNCnkMzHZPE6DJeZU3LM11xm5gdZTkmhRxvvWT1xgF3JE9ospnxGRwMq3UxsjkJWy",
    outcomes: [
      { label: "Home", odds: 2.4 },
      { label: "Draw", odds: 3.1 },
      { label: "Away", odds: 2.7 },
    ],
  },
  {
    fixtureId: 18198205,
    home: "Portugal",
    away: "Spain",
    homeFlag: "🇵🇹",
    awayFlag: "🇪🇸",
    status: "upcoming",
    liveScore: [0, 0],
    matchMinute: 0,
    closeTs: Date.now() + 3 * 24 * 60 * 60 * 1000,
    poolUsdc: 0,
    bettors: 0,
    momentumHome: 0.5,
    outcomes: [
      { label: "Home", odds: 2.15 },
      { label: "Draw", odds: 3.0 },
      { label: "Away", odds: 3.2 },
    ],
  },
];
