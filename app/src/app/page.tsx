"use client";

import { MarketCard } from "@/components/MarketCard";
import { useLiveMarkets } from "@/lib/useLiveMarkets";
import { Icon } from "@/components/Icon";
import { DEMO_MARKETS } from "@/lib/demoMarkets";

export default function Home() {
  const { markets, live } = useLiveMarkets(DEMO_MARKETS);

  return (
    <main className="pt-16 lg:pl-64 pb-24 lg:pb-0">
      {/* Hero */}
      <section className="relative w-full h-[350px] md:h-[450px] overflow-hidden flex items-center px-margin-mobile md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="World Cup stadium" className="w-full h-full object-cover object-center grayscale opacity-60" src="/stadium.png" />
        </div>
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
            World cup <br /><span className="text-primary-container">glory awaits.</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mb-8">
            Pari-mutuel World Cup prediction markets on Solana. Every market settles against
            TxODDS&apos; on-chain Merkle-verified scores — no trusted admin, no oracle key.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#markets" className="bg-primary-container text-on-primary-container px-8 py-4 font-label-caps text-label-caps font-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)]">
              VIEW MARKETS
            </a>
            <a href="#how" className="border-2 border-primary-container text-primary-container px-8 py-4 font-label-caps text-label-caps italic hover:bg-primary-container/10 transition-colors">
              HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* Action bar */}
      <section className="px-margin-mobile md:px-margin-desktop py-4 bg-surface-container-lowest border-y border-metallic-gray/30 flex flex-wrap gap-4 items-center">
        <span className="font-label-caps text-label-caps text-primary-container border-b-2 border-primary-container py-1 italic">
          World Cup Markets
        </span>
        {["Squad Stats", "Top Scorers"].map((label) => (
          <button key={label} disabled title="Coming soon" className="flex items-center gap-2 px-5 py-2 bg-surface-container-high border border-metallic-gray text-on-surface-variant/50 radical-velocity-italic text-label-caps cursor-not-allowed">
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: live ? "var(--color-primary-container)" : "var(--color-on-surface-variant)" }} />
          <span className="font-label-caps text-label-caps" style={{ color: live ? "var(--color-primary-container)" : "var(--color-on-surface-variant)" }}>
            {live ? "live feed" : "demo data"}
          </span>
        </div>
      </section>

      {/* Markets grid */}
      <section id="markets" className="px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="w-full h-full object-cover" src="/pitch.png" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg italic uppercase text-primary-container">Featured World Cup Matches</h2>
              <p className="font-body-md text-on-surface-variant">Live match data via the TxODDS API · settled on-chain</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-primary-fixed-dim">
              <Icon name="verified" size={16} />
              <span className="font-label-caps text-[10px]">TxODDS VERIFIED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {markets.map((m) => (
              <MarketCard key={m.fixtureId} m={m} />
            ))}

            {/* Verifiable Settlement bento (reframed from the design's "Whale Hub") */}
            <div id="how" className="bg-surface-container-low border-2 border-primary-container p-8 relative overflow-hidden flex flex-col justify-center min-h-[400px] shadow-[0_0_30px_rgba(0,255,65,0.1)]">
              <div className="absolute inset-0 pitch-pattern opacity-30 pointer-events-none" />
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/10 blur-3xl rounded-full" />
              <div className="relative z-10">
                <span className="font-label-caps text-label-caps text-primary-container uppercase italic block mb-2">The differentiator</span>
                <h3 className="font-display-hero text-headline-lg-mobile md:text-headline-lg italic mb-4 uppercase leading-none">
                  Verifiable <br /><span className="text-electric-cyan">Settlement</span>
                </h3>
                <p className="font-body-md text-on-surface-variant mb-6">
                  Markets resolve by CPI into TxODDS&apos; own <span className="font-data-numeric text-primary-container">validate_stat</span>,
                  which verifies the score against their on-chain Merkle root. No trusted admin. No oracle key.
                </p>
                <a href="https://txline-docs.txodds.com" target="_blank" rel="noreferrer" className="block w-full text-center bg-primary-container text-on-primary-container py-4 font-label-caps text-label-caps font-black hover:brightness-110 transition-all uppercase italic shadow-lg">
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How settlement works — honest facts */}
      <section className="px-margin-mobile md:px-margin-desktop py-12 border-t border-metallic-gray/30 bg-surface-container-lowest/80 backdrop-blur-sm relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-primary-container italic">0</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Trusted admins — settled by Merkle proof</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-electric-cyan italic">CPI</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Resolves via TxODDS validate_stat on-chain</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-primary-fixed-dim italic">Pari-mutuel</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Fair pooled payouts on Solana</span>
          </div>
        </div>
      </section>
    </main>
  );
}
