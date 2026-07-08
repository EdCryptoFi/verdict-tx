"use client";

import { useWallet } from "@solana/wallet-adapter-react";

// Seeded Pick'em preview. The on-chain Pick'em loop (free predictions → points/streaks) is the
// planned "fan" layer; this table is illustrative demo data with the connected wallet inserted.
const SEED = [
  { name: "elpistolero.sol", pts: 4820, win: 78, streak: 12 },
  { name: "0x9f3a…c21b", pts: 4610, win: 74, streak: 9 },
  { name: "midfieldmaestro", pts: 4390, win: 71, streak: 7 },
  { name: "0x71a2…C42b", pts: 4180, win: 69, streak: 6 },
  { name: "vardagol.sol", pts: 3900, win: 66, streak: 5 },
  { name: "0x3c8d…9a01", pts: 3720, win: 64, streak: 4 },
  { name: "tikitaka", pts: 3510, win: 61, streak: 3 },
  { name: "0xab19…77ef", pts: 3300, win: 59, streak: 3 },
];

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const rows = [...SEED];
  if (publicKey) {
    rows.splice(5, 0, { name: `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)} (you)`, pts: 3650, win: 63, streak: 4 });
  }
  rows.sort((a, b) => b.pts - a.pts);

  return (
    <main className="pt-16 lg:pl-64 pb-24 lg:pb-0 min-h-screen px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="font-display-hero text-headline-lg italic uppercase text-primary-container">Pick&apos;em Leaderboard</h1>
          <p className="font-body-md text-on-surface-variant">Free World Cup predictions · streaks &amp; points</p>
        </div>
        <span className="font-label-caps text-[10px] text-on-surface-variant border border-metallic-gray px-2 py-1 uppercase tracking-widest">Preview</span>
      </div>
      <p className="text-[11px] text-on-surface-variant/70 mb-8 max-w-2xl">
        A no-wallet fan layer: predict outcomes for free, build streaks, climb the board. Shown here as a seeded preview.
      </p>

      <div className="border border-metallic-gray bg-surface-container-low overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-secondary-container via-primary-container to-electric-cyan" />
        <div className="grid grid-cols-[48px_1fr_80px_80px_80px] gap-2 px-5 py-3 border-b border-metallic-gray/50 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
          <span>#</span><span>Predictor</span><span className="text-right">Points</span><span className="text-right">Win%</span><span className="text-right">Streak</span>
        </div>
        {rows.map((r, i) => {
          const you = r.name.includes("(you)");
          return (
            <div
              key={r.name}
              className="grid grid-cols-[48px_1fr_80px_80px_80px] gap-2 px-5 py-4 items-center border-b border-metallic-gray/20 last:border-0"
              style={{ background: you ? "rgba(0,255,65,0.06)" : i < 3 ? "rgba(157,5,255,0.04)" : "transparent" }}
            >
              <span className="font-display-hero italic text-headline-lg-mobile" style={{ color: i === 0 ? "var(--color-primary-container)" : i < 3 ? "var(--color-secondary-container)" : "var(--color-on-surface-variant)" }}>
                {i + 1}
              </span>
              <span className={`font-label-caps text-label-caps ${you ? "text-primary-container" : "text-on-surface"} truncate`}>
                {i === 0 && "🏆 "}{r.name}
              </span>
              <span className="text-right font-data-numeric text-primary-container italic">{r.pts.toLocaleString()}</span>
              <span className="text-right font-data-numeric text-on-surface-variant">{r.win}%</span>
              <span className="text-right font-data-numeric text-electric-cyan">🔥{r.streak}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
