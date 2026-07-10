"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketLive, IndexerMessage } from "@verdict/shared";

const CONFIGURED_WS = process.env.NEXT_PUBLIC_INDEXER_WS;
const MAX_RETRIES = 5;

/**
 * Only dial the indexer when one is actually reachable: a remote URL always, a localhost URL
 * only while the page itself is served from localhost. (The build bakes NEXT_PUBLIC_INDEXER_WS,
 * so a dev value must not cause endless failed reconnects on the hosted demo.)
 */
function resolveWsUrl(): string | null {
  if (typeof window === "undefined") return null;
  const onLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const url = CONFIGURED_WS ?? (onLocalhost ? "ws://localhost:8787" : null);
  if (!url) return null;
  const pointsToLocalhost = /\/\/(localhost|127\.0\.0\.1)\b/.test(url);
  return pointsToLocalhost && !onLocalhost ? null : url;
}

/**
 * Subscribe to the indexer's live market feed. Seeds with `fallback` (demo data) so the UI
 * renders immediately and still works when no indexer is reachable (e.g. the hosted demo).
 */
export function useLiveMarkets(fallback: MarketLive[]) {
  const [markets, setMarkets] = useState<MarketLive[]>(fallback);
  const [live, setLive] = useState(false);
  const byId = useRef<Map<number, MarketLive>>(new Map(fallback.map((m) => [m.fixtureId, m])));

  useEffect(() => {
    const url = resolveWsUrl();
    if (!url) return; // hosted demo: stay on the seeded data, no endless reconnects

    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout>;
    let attempts = 0;
    let cancelled = false;

    const connect = () => {
      if (cancelled || attempts >= MAX_RETRIES) return;
      attempts += 1;
      try {
        ws = new WebSocket(url);
      } catch {
        return;
      }
      ws.onopen = () => {
        attempts = 0;
        setLive(true);
      };
      ws.onmessage = (ev) => {
        try {
          const msg: IndexerMessage = JSON.parse(ev.data);
          if (msg.type === "snapshot") {
            byId.current = new Map(msg.markets.map((m) => [m.fixtureId, m]));
          } else {
            byId.current.set(msg.market.fixtureId, msg.market);
          }
          setMarkets([...byId.current.values()]);
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        setLive(false);
        if (!cancelled) retry = setTimeout(connect, 2000);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      cancelled = true;
      clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return { markets, live };
}
