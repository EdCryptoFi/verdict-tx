"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BetBox } from "@/components/BetBox";
import { SettlementTheater } from "@/components/SettlementTheater";
import { Countdown } from "@/components/Countdown";
import { DEMO_MARKETS } from "@/lib/demoMarkets";
import { useLiveMarkets } from "@/lib/useLiveMarkets";

function MatchView() {
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const { markets } = useLiveMarkets(DEMO_MARKETS);
  const m = markets.find((x) => x.fixtureId === id) ?? DEMO_MARKETS.find((x) => x.fixtureId === id) ?? DEMO_MARKETS[0];
  const final = m.status === "final";
  const upcoming = m.status === "upcoming";

  return (
    <main className="pt-16 lg:pl-64 pb-24 lg:pb-0 min-h-screen">
      {/* Score hero */}
      <section className="relative overflow-hidden border-b border-metallic-gray">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="w-full h-full object-cover" src="/pitch.png" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0" />
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop py-10">
          <a href="/" className="font-label-caps text-[10px] text-on-surface-variant hover:text-primary-container uppercase tracking-widest">← Back to markets</a>
          <div className="mt-4 flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${final || upcoming ? "bg-metallic-gray" : "bg-danger-red pulse-live"}`} />
            <span className="font-label-caps text-label-caps text-primary-container italic uppercase">
              {final ? "FULL TIME" : upcoming ? "Upcoming" : `LIVE · ${m.matchMinute}'`} · FIFA World Cup 2026
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center md:justify-start gap-6 md:gap-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-variant flex items-center justify-center text-4xl border border-metallic-gray/40">{m.homeFlag}</div>
              <span className="font-headline-lg-mobile italic uppercase">{m.home}</span>
            </div>
            <div className="font-display-hero text-display-hero italic text-primary-container leading-none">
              {m.liveScore[0]}<span className="text-metallic-gray opacity-40 mx-3">—</span>{m.liveScore[1]}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-variant flex items-center justify-center text-4xl border border-metallic-gray/40">{m.awayFlag}</div>
              <span className="font-headline-lg-mobile italic uppercase">{m.away}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="font-label-caps text-[10px] px-3 py-1.5 border border-primary-container text-primary-container uppercase italic">
              {final ? "On-chain verified ✓" : "Settles via TxODDS Merkle proof"}
            </span>
            {!final && <Countdown closeTs={m.closeTs} />}
          </div>
        </div>
      </section>

      {/* Body: bet + settlement */}
      <section className="px-margin-mobile md:px-margin-desktop py-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-metallic-gray bg-surface-container-low">
          <div className="h-1 w-full bg-gradient-to-r from-primary-container to-electric-cyan" />
          <div className="pt-5">
            <h3 className="px-6 font-headline-lg-mobile italic uppercase text-primary-container mb-1">Place your prediction</h3>
            <p className="px-6 text-[11px] text-on-surface-variant mb-2">Pari-mutuel 1X2 · 1% protocol fee · pooled payouts</p>
            <BetBox m={m} />
          </div>
        </div>
        <SettlementTheater m={m} />
      </section>
    </main>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<main className="pt-24 text-center text-on-surface-variant">Loading…</main>}>
      <MatchView />
    </Suspense>
  );
}
