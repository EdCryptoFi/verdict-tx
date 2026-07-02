/** Live market snapshot broadcast by the indexer to the frontend (over WebSocket). */
export interface MarketLive {
  fixtureId: number;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  /** "upcoming" | "live" | "final" */
  status: "upcoming" | "live" | "final";
  liveScore: [number, number];
  matchMinute: number;
  /** unix ms when betting closes */
  closeTs: number;
  poolUsdc: number;
  bettors: number;
  /** home win probability 0..1 (drives the Momentum Meter) */
  momentumHome: number;
  outcomes: { label: string; odds: number }[];
  /** set once settled on-chain */
  winningOutcome?: number;
  settlementTx?: string;
}

export type IndexerMessage =
  | { type: "snapshot"; markets: MarketLive[] }
  | { type: "update"; market: MarketLive };
