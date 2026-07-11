"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import type { MarketLive } from "@verdict/shared";
import { readonlyProgram, USDC_DECIMALS } from "./program";

const POLL_MS = 12_000;

export interface ChainMarket {
  fixtureId: number;
  /** Staked totals in human units (USDC), not base units. */
  totalPool: number;
  poolPerOutcome: number[];
  bettors: number;
  status: "open" | "resolved" | "refunded";
  winningOutcome: number;
  /** unix ms */
  bettingCloseTs: number;
}

const toUsdc = (raw: { toString(): string }) => Number(raw.toString()) / 10 ** USDC_DECIMALS;

/**
 * Read every market the program owns, straight from the devnet RPC in the browser — no indexer and
 * no backend. Also counts Position accounts per market to get the real number of predictors.
 */
export function useOnchainMarkets() {
  const { connection } = useConnection();
  const program = useMemo(() => readonlyProgram(connection), [connection]);
  const [chain, setChain] = useState<Map<number, ChainMarket>>(new Map());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [markets, positions] = await Promise.all([
        program.account.market.all(),
        program.account.position.all(),
      ]);

      const bettorsByMarket = new Map<string, number>();
      for (const p of positions) {
        const key = p.account.market.toBase58();
        bettorsByMarket.set(key, (bettorsByMarket.get(key) ?? 0) + 1);
      }

      const next = new Map<number, ChainMarket>();
      for (const { publicKey, account } of markets) {
        const n = account.numOutcomes;
        next.set(Number(account.matchId.toString()), {
          fixtureId: Number(account.matchId.toString()),
          totalPool: toUsdc(account.totalPool),
          poolPerOutcome: account.poolPerOutcome.slice(0, n).map(toUsdc),
          bettors: bettorsByMarket.get(publicKey.toBase58()) ?? 0,
          status: Object.keys(account.status)[0] as ChainMarket["status"],
          winningOutcome: account.winningOutcome,
          bettingCloseTs: Number(account.bettingCloseTs.toString()) * 1000,
        });
      }
      setChain(next);
    } catch {
      /* RPC hiccup — keep the last good snapshot */
    } finally {
      setLoaded(true);
    }
  }, [program]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { chain, loaded, refresh };
}

/**
 * Overlay the real on-chain state onto the fixture feed. Pools, predictor counts and odds come from
 * the chain; the match metadata (teams, score, clock) stays from the TxODDS feed.
 *
 * Odds are pari-mutuel, so they're a *payout multiple*, not a bookmaker's line: backing an outcome
 * pays out the whole pool split across the winners, i.e. `totalPool / poolOnThatOutcome`. Until a
 * side has money on it that multiple is undefined — we emit 0 and the UI renders it as "—".
 */
export function applyChainState(markets: MarketLive[], chain: Map<number, ChainMarket>): MarketLive[] {
  return markets.map((m) => {
    const c = chain.get(m.fixtureId);
    if (!c) return m;

    return {
      ...m,
      onChain: true,
      poolUsdc: c.totalPool,
      bettors: c.bettors,
      closeTs: c.bettingCloseTs,
      // The pool bar is labelled "Tournament Pool", so show where the money actually is.
      momentumHome: c.totalPool > 0 ? c.poolPerOutcome[0] / c.totalPool : m.momentumHome,
      outcomes: m.outcomes.map((o, i) => ({
        ...o,
        odds: c.poolPerOutcome[i] > 0 ? c.totalPool / c.poolPerOutcome[i] : 0,
      })),
      // "refunded" is terminal too — the program takes that path when nobody staked the winning
      // outcome. Either way the market is settled and must stop accepting bets.
      winningOutcome: c.status === "open" ? m.winningOutcome : c.winningOutcome,
    };
  });
}
