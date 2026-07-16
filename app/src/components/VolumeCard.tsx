"use client";

import { motion } from "framer-motion";
import { VolumeStat } from "./VolumeStat";
import { useProtocolStats } from "@/lib/useProtocolStats";

/**
 * Protocol totals, counted from the program's accounts on devnet.
 *
 * There is deliberately no trend line or 24h delta here: we don't index history, so any sparkline
 * would be drawing a shape we made up. Every number on this card is one you can verify on-chain.
 */
export function VolumeCard() {
  const { volumeUsdc, marketsOpen, marketsSettled } = useProtocolStats();

  return (
    <motion.div
      initial={false}
      className="w-full max-w-sm border border-primary-container/30 bg-black/60 backdrop-blur-md p-6"
      style={{ boxShadow: "0 0 40px rgba(207,243,1,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-primary-container pulse-live" />
        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Live Markets</span>
      </div>
      <VolumeStat value={marketsOpen} className="block font-display-hero text-display-hero leading-none italic text-primary-container mb-4" />

      <div className="h-px w-full bg-metallic-gray/40 mb-4" />

      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Staked</div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <VolumeStat value={Math.round(volumeUsdc)} className="block font-display-hero text-headline-lg italic text-on-surface" />
          <div className="mt-1 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">USDC · devnet</div>
        </div>
        <div className="text-right">
          <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Settled</div>
          <VolumeStat value={marketsSettled} className="font-display-hero text-headline-lg-mobile italic text-electric-cyan" />
          <div className="font-label-caps text-[9px] text-on-surface-variant/70 uppercase mt-0.5">by proof</div>
        </div>
      </div>
    </motion.div>
  );
}
