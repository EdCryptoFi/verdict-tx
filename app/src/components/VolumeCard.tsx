"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";

function AnimatedNumber({ value, prefix = "", className = "" }: { value: number; prefix?: string; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);
  return (
    <span className={`tnum ${className}`}>
      {prefix}
      {Math.round(display).toLocaleString()}
    </span>
  );
}

// Rising sparkline path (viewBox 0..100 x, 0..40 y). Animated draw.
const POINTS = [38, 34, 36, 30, 32, 26, 22, 24, 18, 20, 12, 14, 8, 6];
const PATH = POINTS.map((y, i) => `${(i / (POINTS.length - 1)) * 100},${y}`).join(" ");

/** LIVE MARKETS + TOTAL VOLUME card with an animated count-up and a drawn sparkline (bet.png). */
export function VolumeCard({ liveMarkets = 24, volume = 2458921 }: { liveMarkets?: number; volume?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-sm border border-primary-container/30 bg-black/60 backdrop-blur-md p-6"
      style={{ boxShadow: "0 0 40px rgba(207,243,1,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-primary-container pulse-live" />
        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Live Markets</span>
      </div>
      <div className="font-display-hero text-display-hero leading-none italic text-primary-container mb-4">
        <AnimatedNumber value={liveMarkets} />
      </div>
      <div className="h-px w-full bg-metallic-gray/40 mb-4" />
      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Volume</div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <AnimatedNumber value={volume} prefix="$" className="font-display-hero text-headline-lg italic text-on-surface" />
          <div className="mt-1 font-label-caps text-[10px] uppercase tracking-widest">
            <span className="text-primary-container">+24.7%</span> <span className="text-on-surface-variant">24H</span>
          </div>
        </div>
        <svg viewBox="0 0 100 40" className="w-28 h-12 overflow-visible" preserveAspectRatio="none">
          <motion.polyline
            points={PATH}
            fill="none"
            stroke="var(--color-primary-container)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
          <motion.circle
            cx="100" cy={POINTS[POINTS.length - 1]} r="2.5"
            fill="var(--color-primary-container)"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
