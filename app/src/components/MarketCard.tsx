"use client";

import type { MarketLive } from "@verdict/shared";
import { Countdown } from "./Countdown";
import { BetBox } from "./BetBox";

export function MarketCard({ m }: { m: MarketLive }) {
  const final = m.status === "final";
  const homePct = Math.round(m.momentumHome * 100);

  return (
    <div className="bg-surface-container-low border border-primary-container/20 hover:border-primary-container/60 relative overflow-hidden flex flex-col group transition-all duration-200">
      {/* Pitch texture overlay (CSS, no external asset) */}
      <div className="absolute inset-0 pitch-pattern opacity-40 pointer-events-none" />

      {/* Top gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-container via-electric-cyan to-primary-container group-hover:animate-pulse" />

      {/* Card Header */}
      <div className="p-4 flex justify-between items-center border-b border-metallic-gray/50 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${final ? "bg-metallic-gray" : "bg-danger-red pulse-live"}`} />
          <span className="font-label-caps text-[10px] text-on-surface radical-velocity-italic">
            {final ? "FULL TIME" : `LIVE · ${m.matchMinute}'`}
          </span>
        </div>
        <span className="font-label-caps text-[10px] text-on-surface-variant italic uppercase">FIFA World Cup</span>
      </div>

      {/* Teams & Score */}
      <div className="p-6 flex flex-col items-center gap-4 relative z-10">
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-14 h-14 bg-surface-variant flex items-center justify-center text-3xl shadow-inner border border-metallic-gray/30">
              {m.homeFlag}
            </div>
            <span className="font-label-caps text-label-caps text-center">{m.home}</span>
          </div>
          <div className="flex items-center gap-4 px-6 py-2 bg-background border border-primary-container/30 font-display-hero text-headline-lg-mobile italic text-primary-container shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <span>{m.liveScore[0]}</span>
            <span className="text-metallic-gray opacity-30 text-xl">—</span>
            <span>{m.liveScore[1]}</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-14 h-14 bg-surface-variant flex items-center justify-center text-3xl shadow-inner border border-metallic-gray/30">
              {m.awayFlag}
            </div>
            <span className="font-label-caps text-label-caps text-center">{m.away}</span>
          </div>
        </div>
      </div>

      {/* Momentum meter (real: home win-probability from live odds) */}
      <div className="px-6 pb-4 relative z-10">
        <div className="flex justify-between font-label-caps text-[9px] text-on-surface-variant mb-1 italic uppercase">
          <span>{m.home} {homePct}%</span>
          <span>Momentum</span>
          <span>{100 - homePct}% {m.away}</span>
        </div>
        <div className="h-1.5 w-full bg-surface-variant overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-primary-container to-electric-cyan transition-all duration-700" style={{ width: `${homePct}%` }} />
          <div className="h-full bg-metallic-gray" style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>

      {/* Question + countdown */}
      <div className="px-6 mb-3 flex items-center justify-between relative z-10">
        <h3 className="font-label-caps text-label-caps text-on-surface radical-velocity-italic">Who wins?</h3>
        <Countdown closeTs={m.closeTs} />
      </div>

      {/* Odds Selector */}
      <div className="px-6 pb-4 relative z-10">
        <h4 className="font-label-caps text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest">Victory Odds</h4>
        <div className="grid grid-cols-3 gap-2">
          {m.outcomes.map((o, i) => {
            const won = m.winningOutcome === i;
            return (
              <div
                key={o.label}
                className="flex flex-col items-center p-3 border bg-background/50 transition-all"
                style={{
                  borderColor: won ? "var(--color-primary-container)" : "var(--color-metallic-gray)",
                  background: won ? "rgba(0,255,65,0.05)" : "",
                }}
              >
                <span className="font-label-caps text-[9px] text-on-surface-variant mb-1 uppercase">
                  {o.label} {won && "🏆"}
                </span>
                <span className="font-data-numeric text-headline-lg-mobile text-primary-container italic">
                  {o.odds.toFixed(2)}x
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bet / claim actions */}
      <div className="px-6 pb-4 relative z-10">
        <BetBox m={m} />
      </div>

      {/* Footer Details */}
      <div className="p-4 bg-surface-container-highest/30 flex justify-between items-center relative z-10 border-t border-metallic-gray/30 mt-auto">
        <div className="flex items-center gap-3 font-label-caps text-[10px] text-on-surface-variant">
          <span>💰 {m.poolUsdc.toLocaleString()} USDC pool</span>
          <span className="text-metallic-gray">·</span>
          <span>👥 {m.bettors.toLocaleString()}</span>
        </div>
        <span className="text-[10px] text-primary-container font-label-caps">
          {m.winningOutcome !== undefined ? "✅ Settled on-chain" : "✅ TxODDS verified"}
        </span>
      </div>
    </div>
  );
}
