import type { MarketLive } from "@verdict/shared";

/**
 * Seed markets for the hosted demo — every one of these has a real market account on devnet, so
 * `useOnchainMarkets` overlays the true pool, predictor count and pari-mutuel odds on top. The
 * fixture ids and kickoff times are real TxODDS World Cup fixtures.
 *
 * The values here only render for the moment before the chain read lands; the chain is the source
 * of truth. Keep this list in sync with what `sync:daily` created — the TxODDS feed rolls forward,
 * so a fixture whose market no longer exists on-chain would show as a market nobody can bet on.
 */
export const DEMO_MARKETS: MarketLive[] = [
  {
    // Live betting demo: kickoff 2026-07-18, so this market is open and takes real bets.
    fixtureId: 18257865,
    home: "France",
    away: "England",
    homeFlag: "🇫🇷",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    status: "upcoming",
    liveScore: [0, 0],
    matchMinute: 0,
    closeTs: Date.parse("2026-07-18T21:00:00Z"),
    poolUsdc: 100,
    bettors: 1,
    momentumHome: 0.6,
    outcomes: [
      { label: "Home", odds: 1.67 },
      { label: "Draw", odds: 0 },
      { label: "Away", odds: 2.5 },
    ],
  },
  {
    fixtureId: 18257739,
    home: "Spain",
    away: "Argentina",
    homeFlag: "🇪🇸",
    awayFlag: "🇦🇷",
    status: "upcoming",
    liveScore: [0, 0],
    matchMinute: 0,
    closeTs: Date.parse("2026-07-19T19:00:00Z"),
    poolUsdc: 50,
    bettors: 1,
    momentumHome: 0.7,
    outcomes: [
      { label: "Home", odds: 1.43 },
      { label: "Draw", odds: 3.33 },
      { label: "Away", odds: 0 },
    ],
  },
  {
    // The settlement showcase: a real finished match (2-3) whose market we settled on-chain via
    // CPI into TxODDS validate_stat. The Settlement Theater plays the proof for this one.
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
    bettors: 1,
    momentumHome: 0.35,
    winningOutcome: 2,
    // Devnet prunes transaction history after ~5 days, so this link goes stale and must be
    // re-pointed at a fresh settlement before a demo: `pnpm --filter @verdict/relayer e2e-real`
    // prints a new one (MARKET_KIND=<n> opens a new market for the same fixture).
    settlementTx: "2R9jwnqHoYzmPdpYggfBePKgVdUPE4zgq86yDniDCfh12Tg3ASxSFYoJQrWvxpUE162hvmR4g8oQmFaJsWxXp5om",
    outcomes: [
      { label: "Home", odds: 3.0 },
      { label: "Draw", odds: 0 },
      { label: "Away", odds: 1.5 },
    ],
  },
];
