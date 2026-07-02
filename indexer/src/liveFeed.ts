import EventSource from "eventsource";
import { config } from "./config.js";
import type { MarketStore } from "./store.js";

/**
 * Real TxODDS live feed (SSE) → store. Wired but inert until credentials + the World Cup
 * score/odds message schema are confirmed (TxODDS Telegram). Until then the mock simulator
 * drives the store. See docs/ARCHITECTURE.md.
 */
export function startLiveFeed(_store: MarketStore) {
  const headers: Record<string, string> = {};
  if (config.txodds.jwt) headers["Authorization"] = `Bearer ${config.txodds.jwt}`;
  if (config.txodds.apiKey) headers["X-Api-Token"] = config.txodds.apiKey;

  // Scores stream (real-time play-by-play).
  const scores = new EventSource(`${config.txodds.base}/api/scores/stream`, { headers });
  scores.onmessage = (_ev: MessageEvent) => {
    // TODO: parse TxODDS score event → store.patch(fixtureId, { liveScore, matchMinute, ... }).
  };
  scores.onerror = () => {
    /* reconnect handled by EventSource */
  };

  // Odds stream (drives Momentum Meter + live odds).
  const odds = new EventSource(`${config.txodds.base}/api/odds/stream`, { headers });
  odds.onmessage = (_ev: MessageEvent) => {
    // TODO: parse odds event → store.patch(fixtureId, { outcomes, momentumHome }).
  };
  odds.onerror = () => {};

  console.log("live feed (SSE) connected — parsing pending TxODDS schema confirmation");
}
