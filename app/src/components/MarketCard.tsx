"use client";

import type { MarketLive } from "@pitchmarket/shared";
import { Countdown } from "./Countdown";

function Stat({ children }: { children: React.ReactNode }) {
  return <span className="tnum text-sm text-[var(--color-muted)]">{children}</span>;
}

/** A single 1X2 market card — the core surface, in Broadcast Premium style. */
export function MarketCard({ m }: { m: MarketLive }) {
  const final = m.status === "final";
  return (
    <div className="glass rounded-2xl p-5 shadow-2xl">
      {/* Live match header */}
      <div className="pitch -mx-5 -mt-5 mb-4 rounded-t-2xl px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
            {final ? "● FULL TIME" : `◉ LIVE · ${m.matchMinute}'`}
          </span>
          <span className="text-xs text-white/70">FIFA World Cup</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-2xl font-bold">
          <span>
            {m.homeFlag} {m.home}
          </span>
          <span className="tnum rounded-lg bg-black/30 px-3 py-1">
            {m.liveScore[0]} — {m.liveScore[1]}
          </span>
          <span>
            {m.away} {m.awayFlag}
          </span>
        </div>
        {/* Momentum meter */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.round(m.momentumHome * 100)}%`,
              background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-2))",
            }}
          />
        </div>
      </div>

      {/* Question + countdown */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Who wins?</h3>
        <Countdown closeTs={m.closeTs} />
      </div>

      {/* Outcomes */}
      <div className="grid grid-cols-3 gap-2">
        {m.outcomes.map((o, i) => {
          const won = m.winningOutcome === i;
          return (
            <button
              key={o.label}
              className="rounded-xl border px-3 py-3 text-center transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
              style={{
                borderColor: won ? "var(--color-gold)" : "rgba(255,255,255,0.1)",
                background: won ? "rgba(255,197,61,0.1)" : "rgba(255,255,255,0.05)",
              }}
            >
              <div className="text-sm text-[var(--color-muted)]">{o.label}</div>
              <div className="tnum text-lg font-bold text-[var(--color-accent)]">
                {o.odds.toFixed(2)}x
              </div>
            </button>
          );
        })}
      </div>

      {/* Live counters */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <Stat>💰 pool {m.poolUsdc.toLocaleString()} USDC</Stat>
        <Stat>👥 {m.bettors} bettors</Stat>
      </div>
      <div className="mt-2 text-xs text-[var(--color-accent)]">
        {m.winningOutcome !== undefined
          ? "✅ Settled on-chain — TxODDS Merkle-verified"
          : "✅ Settlement verified on-chain via TxODDS"}
      </div>
    </div>
  );
}
