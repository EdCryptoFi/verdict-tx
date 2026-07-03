"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketLive, IndexerMessage } from "@verdict/shared";

const WS_URL = process.env.NEXT_PUBLIC_INDEXER_WS ?? "ws://localhost:8787";

/**
 * Subscribe to the indexer's live market feed. Seeds with `fallback` (demo data) so the UI
 * renders immediately and still works if the indexer isn't running.
 */
export function useLiveMarkets(fallback: MarketLive[]) {
  const [markets, setMarkets] = useState<MarketLive[]>(fallback);
  const [live, setLive] = useState(false);
  const byId = useRef<Map<number, MarketLive>>(new Map(fallback.map((m) => [m.fixtureId, m])));

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        return;
      }
      ws.onopen = () => setLive(true);
      ws.onmessage = (ev) => {
        const msg: IndexerMessage = JSON.parse(ev.data);
        if (msg.type === "snapshot") {
          byId.current = new Map(msg.markets.map((m) => [m.fixtureId, m]));
        } else {
          byId.current.set(msg.market.fixtureId, msg.market);
        }
        setMarkets([...byId.current.values()]);
      };
      ws.onclose = () => {
        setLive(false);
        retry = setTimeout(connect, 2000);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return { markets, live };
}
