"use client";

import { useRef } from "react";
import type { MarketLive } from "@verdict/shared";
import { Countdown } from "./Countdown";
import { BetBox } from "./BetBox";
import { Icon } from "./Icon";

export function MarketCard({ m, onChainUpdate }: { m: MarketLive; onChainUpdate?: () => void }) {
  const final = m.status === "final";
  const upcoming = m.status === "upcoming";
  const homePct = Math.round(m.momentumHome * 100);
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt on hover (from the Radical Velocity design).
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = (e.clientY - r.top - r.height / 2) / 20;
    const ry = (r.width / 2 - (e.clientX - r.left)) / 20;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="bg-surface-container-low border border-primary-container/20 hover:border-primary-container/60 relative overflow-hidden flex flex-col group transition-transform duration-200"
    >
      {/* pitch texture */}
      <div className="absolute inset-0 pitch-pattern opacity-40 pointer-events-none" />
      {/* top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-container via-electric-cyan to-primary-container group-hover:animate-pulse" />

      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-metallic-gray/50 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${final || upcoming ? "bg-metallic-gray" : "bg-danger-red pulse-live"}`} />
          <span className="font-label-caps text-[10px] text-on-surface radical-velocity-italic">
            {final ? "FULL TIME" : upcoming ? "UPCOMING" : `LIVE · ${m.matchMinute}'`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-primary-container italic">
          <Icon name="timer" size={12} />
          <span className="font-data-numeric">{final ? "FINAL" : upcoming ? "KICKOFF SOON" : "IN PLAY"}</span>
        </div>
      </div>

      {/* Teams & score */}
      <div className="p-6 flex flex-col items-center gap-4 relative z-10">
        <div className="w-full flex justify-between items-center px-2">
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="w-14 h-14 bg-surface-variant flex items-center justify-center text-3xl shadow-inner border border-metallic-gray/30">
              {m.homeFlag}
            </div>
            <span className="font-label-caps text-label-caps text-center uppercase truncate w-full">{m.home}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-2 bg-background border border-primary-container/30 font-display-hero text-headline-lg italic text-primary-container shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <span>{m.liveScore[0]}</span>
            <span className="text-metallic-gray opacity-30 text-xl">—</span>
            <span>{m.liveScore[1]}</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="w-14 h-14 bg-surface-variant flex items-center justify-center text-3xl shadow-inner border border-metallic-gray/30">
              {m.awayFlag}
            </div>
            <span className="font-label-caps text-label-caps text-center uppercase truncate w-full">{m.away}</span>
          </div>
        </div>
      </div>

      {/* Who wins + countdown */}
      <div className="px-6 mb-1 flex items-center justify-between relative z-10">
        <h3 className="font-label-caps text-label-caps text-on-surface radical-velocity-italic">Who wins?</h3>
        <Countdown closeTs={m.closeTs} />
      </div>

      {/* Victory Odds + bet/claim (real on-chain) */}
      <BetBox m={m} onChainUpdate={onChainUpdate} />

      {/* Momentum / pool bar */}
      <div className="px-6 pb-4 relative z-10">
        <div className="flex justify-between font-label-caps text-[9px] text-on-surface-variant mb-1 italic uppercase">
          <span className="flex items-center gap-1.5">
            Tournament Pool
            {m.onChain && (
              <span className="text-primary-container/70 not-italic" title="Live market account on Solana devnet">
                · on-chain
              </span>
            )}
          </span>
          <span className="text-primary-container">{m.poolUsdc.toLocaleString()} USDC</span>
        </div>
        <div className="h-1.5 w-full bg-surface-variant overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-primary-container to-electric-cyan transition-all duration-700" style={{ width: `${homePct}%` }} />
          <div className="h-full bg-metallic-gray" style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-surface-container-highest/30 flex justify-between items-center relative z-10 border-t border-metallic-gray/30 mt-auto">
        <div className="flex items-center gap-2 font-label-caps text-[10px] text-on-surface-variant">
          <Icon name="users" size={13} />
          <span>{m.bettors.toLocaleString()} Predictors</span>
        </div>
        <a href={`/match?id=${m.fixtureId}`} className="text-[10px] text-primary-container font-label-caps uppercase radical-velocity-italic hover:underline">
          {m.winningOutcome !== undefined ? "Settled ✓ · details" : "Match center →"}
        </a>
      </div>
    </div>
  );
}
