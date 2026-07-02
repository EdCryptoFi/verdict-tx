import type { MarketLive } from "@pitchmarket/shared";
import { EventEmitter } from "node:events";

/**
 * In-memory store of live market snapshots. Emits "update" whenever a market changes so the
 * WebSocket server can broadcast deltas. Fed either by the mock simulator or the real
 * TxODDS SSE + on-chain readers.
 */
export class MarketStore extends EventEmitter {
  private markets = new Map<number, MarketLive>();

  upsert(m: MarketLive) {
    this.markets.set(m.fixtureId, m);
    this.emit("update", m);
  }

  patch(fixtureId: number, patch: Partial<MarketLive>) {
    const cur = this.markets.get(fixtureId);
    if (!cur) return;
    const next = { ...cur, ...patch };
    this.markets.set(fixtureId, next);
    this.emit("update", next);
  }

  get(fixtureId: number) {
    return this.markets.get(fixtureId);
  }

  all(): MarketLive[] {
    return [...this.markets.values()];
  }
}
