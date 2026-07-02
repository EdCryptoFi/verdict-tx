import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import type { IndexerMessage } from "@pitchmarket/shared";
import type { MarketStore } from "./store.js";

/** HTTP `/markets` snapshot + WebSocket live feed of market updates. */
export function startServer(store: MarketStore, port: number) {
  const http = createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.url === "/markets") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(store.all()));
      return;
    }
    if (req.url === "/health") {
      res.end("ok");
      return;
    }
    res.statusCode = 404;
    res.end("not found");
  });

  const wss = new WebSocketServer({ server: http });

  wss.on("connection", (ws) => {
    const snapshot: IndexerMessage = { type: "snapshot", markets: store.all() };
    ws.send(JSON.stringify(snapshot));
  });

  const broadcast = (msg: IndexerMessage) => {
    const data = JSON.stringify(msg);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    }
  };
  store.on("update", (market) => broadcast({ type: "update", market }));

  http.listen(port, () => {
    console.log(`indexer · http://localhost:${port}/markets · ws://localhost:${port}`);
  });
}
