"use client";

import { useEffect, useState } from "react";
import type { MarketLive } from "@verdict/shared";

const STEPS = [
  { k: "TxODDS live score", d: "Scout-verified goals from the TxODDS World Cup feed" },
  { k: "Merkle proof", d: "Score committed to TxODDS' on-chain Merkle root" },
  { k: "validate_stat (CPI)", d: "Verdict verifies the proof against the root on-chain" },
  { k: "Settled", d: "Winning outcome fixed — pari-mutuel payouts unlocked" },
];

/**
 * The verification climax. For a settled market it plays the 4-step proof flow ending on the
 * winning outcome + the on-chain settlement tx. For an open market it shows the pending state.
 */
export function SettlementTheater({ m }: { m: MarketLive }) {
  const settled = m.winningOutcome !== undefined;
  const [step, setStep] = useState(settled ? -1 : 0);

  useEffect(() => {
    if (!settled) return;
    setStep(-1);
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i), 500 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, [settled, m.fixtureId]);

  const winner = settled ? m.outcomes[m.winningOutcome!]?.label : null;

  return (
    <div className="border border-primary-container/30 bg-surface-container-low relative overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-secondary-container via-primary-container to-electric-cyan" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline-lg-mobile italic uppercase text-primary-container">Settlement Theater</h3>
          <span className={`font-label-caps text-[10px] px-2 py-1 ${settled ? "bg-primary-container text-on-primary-container" : "border border-metallic-gray text-on-surface-variant"}`}>
            {settled ? "ON-CHAIN VERIFIED" : "AWAITING FULL-TIME"}
          </span>
        </div>

        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const done = settled && step >= i;
            return (
              <div
                key={s.k}
                className="flex items-start gap-3 p-3 border transition-all duration-500"
                style={{
                  borderColor: done ? "var(--color-primary-container)" : "var(--color-metallic-gray)",
                  background: done ? "rgba(0,255,65,0.06)" : "transparent",
                  opacity: settled ? (step >= i ? 1 : 0.35) : 0.7,
                  transform: done ? "translateX(0)" : "translateX(-4px)",
                }}
              >
                <div
                  className="mt-0.5 w-5 h-5 flex items-center justify-center border text-[11px] font-black"
                  style={{
                    borderColor: done ? "var(--color-primary-container)" : "var(--color-metallic-gray)",
                    color: done ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
                    background: done ? "rgba(0,255,65,0.1)" : "transparent",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-on-surface uppercase">{s.k}</div>
                  <div className="text-[11px] text-on-surface-variant">{s.d}</div>
                </div>
              </div>
            );
          })}
        </div>

        {settled && step >= STEPS.length - 1 && (
          <div className="mt-5 p-4 border-2 border-primary-container bg-primary-container/5 text-center">
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Verified winning outcome</div>
            <div className="font-display-hero text-headline-lg italic uppercase text-primary-container">
              {winner} 🏆
            </div>
            {m.settlementTx && (
              <a
                href={`https://solscan.io/tx/${m.settlementTx}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 font-data-numeric text-[11px] text-electric-cyan hover:underline break-all"
              >
                tx {m.settlementTx.slice(0, 12)}… ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
