"use client";

import dynamic from "next/dynamic";
import type { MarketLive } from "@verdict/shared";
import { MarketCard } from "@/components/MarketCard";
import { useLiveMarkets } from "@/lib/useLiveMarkets";

const WalletButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const DEMO: MarketLive[] = [
  {
    fixtureId: 900001,
    home: "Brazil",
    away: "Argentina",
    homeFlag: "🇧🇷",
    awayFlag: "🇦🇷",
    status: "live",
    liveScore: [2, 1],
    matchMinute: 67,
    closeTs: Date.now() + 4 * 60 * 1000 + 12 * 1000,
    poolUsdc: 12480,
    bettors: 237,
    momentumHome: 0.68,
    outcomes: [
      { label: "Home", odds: 1.85 },
      { label: "Draw", odds: 3.2 },
      { label: "Away", odds: 4.1 },
    ],
  },
  {
    fixtureId: 900002,
    home: "France",
    away: "England",
    homeFlag: "🇫🇷",
    awayFlag: "🏴",
    status: "live",
    liveScore: [0, 0],
    matchMinute: 12,
    closeTs: Date.now() + 18 * 60 * 1000,
    poolUsdc: 5310,
    bettors: 96,
    momentumHome: 0.52,
    outcomes: [
      { label: "Home", odds: 2.1 },
      { label: "Draw", odds: 2.9 },
      { label: "Away", odds: 3.4 },
    ],
  },
];

export default function Home() {
  const { markets, live } = useLiveMarkets(DEMO);

  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="relative w-full h-[320px] md:h-[400px] overflow-hidden flex items-center px-margin-mobile md:px-margin-desktop">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a2a14] via-background to-background" />
        <div className="absolute inset-0 z-0 pitch-pattern opacity-60" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-container/10 blur-3xl rounded-full z-0" />
        <div className="relative z-20 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-danger-red px-2 py-0.5 font-label-caps text-[10px] italic pulse-live">
              {live ? "LIVE NOW" : "DEMO"}
            </span>
            <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-tighter">
              FIFA World Cup 2026 · Verifiable Settlement
            </span>
          </div>
          <h1 className="font-display-hero text-headline-lg-mobile md:text-display-hero italic uppercase leading-[0.9] mb-4">
            Bet the match. <br />
            <span className="text-primary-container">Trust the proof.</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mb-8">
            Pari-mutuel World Cup prediction markets on Solana — settled against TxODDS&apos;
            on-chain Merkle-verified scores. No trusted admin, no oracle key. Just the proof.
          </p>
          <a
            href="#markets"
            className="inline-block bg-primary-container text-on-primary-container px-8 py-4 font-label-caps text-label-caps font-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)]"
          >
            VIEW MARKETS
          </a>
        </div>
      </section>

      {/* Action bar: connect + live/demo status */}
      <section className="px-margin-mobile md:px-margin-desktop py-4 bg-surface-container-lowest border-y border-metallic-gray/30 flex flex-wrap gap-4 items-center">
        <span className="font-label-caps text-label-caps text-primary-container border-b-2 border-primary-container py-1 italic">
          World Cup Markets
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 text-xs font-label-caps text-label-caps"
            style={{ color: live ? "var(--color-primary-container)" : "var(--color-on-surface-variant)" }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: live ? "var(--color-primary-container)" : "var(--color-on-surface-variant)" }}
            />
            {live ? "live feed" : "demo data"}
          </span>
          <WalletButton />
        </div>
      </section>

      {/* Markets grid */}
      <section id="markets" className="px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pitch-pattern opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg-mobile italic uppercase text-primary-container">
                Featured World Cup Matches
              </h2>
              <p className="font-body-md text-on-surface-variant">
                Live match data via the TxODDS API · settled on-chain
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-primary-fixed-dim">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-label-caps text-[10px]">TxODDS VERIFIED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {markets.map((m) => (
              <MarketCard key={m.fixtureId} m={m} />
            ))}
          </div>
        </div>
      </section>

      {/* How settlement works (honest facts, not fabricated stats) */}
      <section className="px-margin-mobile md:px-margin-desktop py-12 border-t border-metallic-gray/30 bg-surface-container-lowest/80 backdrop-blur-sm relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-primary-container italic">0</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Trusted admins — settled by Merkle proof
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-electric-cyan italic">CPI</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Resolves via TxODDS validate_stat on-chain
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-primary-fixed-dim italic">Pari-mutuel</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Fair pooled payouts on Solana
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
