import { config } from "./config.js";
import { MarketStore } from "./store.js";
import { startServer } from "./server.js";
import { startMockSimulator } from "./mockSimulator.js";
import { startLiveFeed } from "./liveFeed.js";

const store = new MarketStore();
startServer(store, config.port);

if (config.txodds.mock) {
  console.log("indexer mode: MOCK (simulating live matches)");
  startMockSimulator(store);
} else {
  console.log("indexer mode: LIVE (TxODDS SSE)");
  startLiveFeed(store);
}
