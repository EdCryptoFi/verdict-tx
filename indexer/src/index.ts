/**
 * Indexer entrypoint. Keeps the frontend's markets in sync:
 *   - LIVE mode (TxODDS creds present): polls real World Cup fixtures + scores from TxODDS.
 *   - MOCK mode (no creds): simulates matches so the demo still moves.
 */
import { config } from "./config.js";
import { MarketStore } from "./store.js";
import { startServer } from "./server.js";
import { startMockSimulator } from "./mockSimulator.js";
import { startRealFeed } from "./realFeed.js";

const store = new MarketStore();
startServer(store, config.port);

const live = startRealFeed(store);
if (live) {
  console.log("indexer mode: LIVE (real TxODDS fixtures + scores)");
} else {
  console.log("indexer mode: MOCK (no TxODDS creds — simulating matches)");
  startMockSimulator(store);
}
