"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { MarketKind } from "@verdict/shared";
import { readonlyProgram, USDC_DECIMALS } from "./program";

export interface ProtocolStats {
  /** Total staked across every market, in USDC. */
  volumeUsdc: number;
  /** Markets still taking bets. */
  marketsOpen: number;
  /** Markets settled against a TxODDS proof. */
  marketsSettled: number;
  /** Distinct wallets holding a position. */
  traders: number;
  loaded: boolean;
}

const EMPTY: ProtocolStats = {
  volumeUsdc: 0,
  marketsOpen: 0,
  marketsSettled: 0,
  traders: 0,
  loaded: false,
};

/**
 * Protocol-wide totals, counted from the program's own accounts on devnet. These are deliberately
 * the real numbers — the whole pitch is that nothing on screen is invented, so a small honest
 * figure beats an impressive fake one.
 */
export function useProtocolStats(): ProtocolStats {
  const { connection } = useConnection();
  const program = useMemo(() => readonlyProgram(connection), [connection]);
  const [stats, setStats] = useState<ProtocolStats>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [markets, positions] = await Promise.all([
          program.account.market.all(),
          program.account.position.all(),
        ]);
        if (cancelled) return;

        const oneX2 = markets.filter((m) => m.account.kind === MarketKind.FullTime1X2);
        const volume = oneX2.reduce(
          (sum, m) => sum + Number(m.account.totalPool.toString()) / 10 ** USDC_DECIMALS,
          0
        );
        const status = (m: (typeof oneX2)[number]) => Object.keys(m.account.status)[0];

        setStats({
          volumeUsdc: volume,
          marketsOpen: oneX2.filter((m) => status(m) === "open").length,
          marketsSettled: oneX2.filter((m) => status(m) !== "open").length,
          traders: new Set(positions.map((p) => p.account.bettor.toBase58())).size,
          loaded: true,
        });
      } catch {
        if (!cancelled) setStats((s) => ({ ...s, loaded: true }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [program]);

  return stats;
}
