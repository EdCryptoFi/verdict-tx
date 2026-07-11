"use client";

import { MarketCard } from "@/components/MarketCard";
import { useLiveMarkets } from "@/lib/useLiveMarkets";
import { Icon } from "@/components/Icon";
import { VolumeCard } from "@/components/VolumeCard";
import { DEMO_MARKETS } from "@/lib/demoMarkets";

export default function Home() {
  const { markets, live } = useLiveMarkets(DEMO_MARKETS);

  return (
    <main className="pt-16 lg:pl-64">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-metallic-gray">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="w-full h-full object-cover object-top opacity-40 grayscale" src="/stadium.png" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        </div>

        {/* trophy */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src="/art/hero-trophy.png"
          className="hidden lg:block absolute right-[24%] top-1/2 -translate-y-1/2 h-[118%] w-auto object-contain z-[1] pointer-events-none select-none"
        />

        <div className="relative z-10 px-margin-mobile md:px-margin-desktop py-12 md:py-16">
          <div className="max-w-xl xl:max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-danger-red px-2 py-0.5 font-label-caps text-[10px] italic pulse-live">{live ? "LIVE" : "DEMO"}</span>
              <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest">FIFA World Cup 2026 · Verifiable Settlement</span>
            </div>
            <h1 className="grunge-text font-display-hero text-[13vw] leading-[0.82] md:text-[80px] italic uppercase">
              <span className="text-on-surface">World cup</span>
              <br />
              <span className="text-primary-container">glory awaits.</span>
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-md mt-5 mb-8">
              Pari-mutuel World Cup prediction markets on Solana. Every market settles against
              TxODDS&apos; on-chain Merkle-verified scores — no trusted admin, no oracle key.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#markets" className="flex items-center gap-2 bg-primary-container text-on-primary-container px-7 py-4 font-label-caps text-label-caps font-black uppercase hover:scale-105 transition-all shadow-[0_0_25px_rgba(207,243,1,0.35)]">
                View markets <Icon name="arrowRight" size={14} />
              </a>
              <a href="#how" className="border-2 border-primary-container text-primary-container px-7 py-4 font-label-caps text-label-caps italic uppercase hover:bg-primary-container/10 transition-colors">
                How it works
              </a>
            </div>
          </div>

          {/* Volume card (top-right, over the trophy) */}
          <div className="hidden lg:block absolute top-10 right-6 xl:right-10 z-20 w-80">
            <VolumeCard liveMarkets={24} volume={2458921} />
          </div>
          <div className="lg:hidden mt-8">
            <VolumeCard liveMarkets={24} volume={2458921} />
          </div>
        </div>
      </section>

      {/* Action bar */}
      <section className="px-margin-mobile md:px-margin-desktop py-4 bg-surface-container-lowest border-b border-metallic-gray/30 flex flex-wrap gap-4 items-center">
        <span className="font-label-caps text-label-caps text-primary-container border-b-2 border-primary-container py-1 italic uppercase">World Cup Markets</span>
        <a href="/leaderboard" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-container py-1 uppercase transition-colors">Leaderboard</a>
        <a href="/portfolio" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-container py-1 uppercase transition-colors">Portfolio</a>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: live ? "var(--color-primary-container)" : "var(--color-on-surface-variant)" }} />
          <span className="font-label-caps text-label-caps uppercase" style={{ color: live ? "var(--color-primary-container)" : "var(--color-on-surface-variant)" }}>{live ? "live feed" : "demo data"}</span>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pitch-pattern opacity-40 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg italic uppercase text-primary-container">Featured World Cup Matches</h2>
              <p className="font-body-md text-on-surface-variant">Live match data via the TxODDS API · settled on-chain</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-primary-container">
              <Icon name="verified" size={16} />
              <span className="font-label-caps text-[10px]">TxODDS VERIFIED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {markets.map((m) => (
              <MarketCard key={m.fixtureId} m={m} />
            ))}

            {/* Verifiable Settlement bento with player art */}
            <div id="how" className="relative overflow-hidden border-2 border-primary-container min-h-[400px] flex flex-col justify-end shadow-[0_0_30px_rgba(207,243,1,0.1)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src="/art/player.png" className="absolute right-0 top-0 h-full w-auto object-cover object-right opacity-90 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
              <div className="relative z-10 p-8">
                <span className="font-label-caps text-label-caps text-primary-container uppercase italic block mb-2">The differentiator</span>
                <h3 className="grunge-text font-display-hero text-headline-lg-mobile md:text-headline-lg italic uppercase leading-none mb-4">
                  Verifiable<br /><span className="text-primary-container">Settlement</span>
                </h3>
                <p className="font-body-md text-on-surface-variant mb-6 max-w-xs">
                  Markets resolve by CPI into TxODDS&apos; own <span className="font-data-numeric text-primary-container">validate_stat</span>, which verifies the score against their on-chain Merkle root. No trusted admin. No oracle key.
                </p>
                <a href="https://txline-docs.txodds.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 font-label-caps text-label-caps font-black uppercase italic hover:brightness-110 transition-all">
                  See how it works <Icon name="arrowRight" size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-margin-mobile md:px-margin-desktop py-12 border-t border-metallic-gray/30 bg-surface-container-lowest/80 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {[
          ["0", "Trusted admins — settled by Merkle proof"],
          ["CPI", "Resolves via TxODDS validate_stat on-chain"],
          ["Pari-mutuel", "Fair pooled payouts on Solana"],
        ].map(([v, l]) => (
          <div key={l} className="flex flex-col gap-2">
            <span className="font-data-numeric text-headline-lg text-primary-container italic">{v}</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{l}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
