"use client";

import { motion } from "framer-motion";
import { VolumeStat } from "@/components/VolumeStat";

const HOT = [
  {
    tag: "FEATURED",
    q: "Who will win the",
    title: "FIFA World Cup 2026?",
    sub: "Outright Winner",
    icon: "🏆",
    pool: "$512,430",
    opts: [
      ["🇧🇷", "Brazil", "2.75", "23%"],
      ["🇫🇷", "France", "3.40", "18%"],
      ["🇦🇷", "Argentina", "4.20", "15%"],
    ],
  },
  {
    q: "Which team will score",
    title: "the most goals?",
    sub: "Outright",
    icon: "⚽",
    pool: "$281,990",
    opts: [
      ["🏴󠁧󠁢󠁥󠁮󠁧󠁿", "England", "2.10", "28%"],
      ["🇧🇷", "Brazil", "2.80", "22%"],
      ["🇫🇷", "France", "3.60", "16%"],
    ],
  },
  {
    q: "Who will win the",
    title: "Golden Glove?",
    sub: "Outright",
    icon: "🧤",
    pool: "$142,550",
    opts: [
      ["🇩🇪", "M. Ter Stegen", "2.50", "20%"],
      ["🇧🇷", "Alisson", "3.10", "17%"],
      ["🇦🇷", "E. Martinez", "4.00", "13%"],
    ],
  },
];

const TRADERS = [
  ["🥇", "DeFiStriker", "+ $18,490"],
  ["🥈", "PredictKing", "+ $11,230"],
  ["🥉", "SolBaller", "+ $7,890"],
  ["4", "MarketMaverick", "+ $5,430"],
  ["5", "VerdictMaster", "+ $4,210"],
];

export default function Welcome() {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-background text-on-surface">
      {/* Top nav */}
      <nav className="relative z-20 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-20 border-b border-metallic-gray/40">
        <a href="/" className="flex flex-col leading-none">
          <span className="font-display-hero text-headline-lg italic tracking-tighter flex items-center gap-1">
            <span className="text-on-surface">VERDICT</span>
            <span className="text-primary-container border border-primary-container px-1 not-italic">TX</span>
          </span>
          <span className="font-label-caps text-[8px] text-on-surface-variant/70 uppercase tracking-[0.2em] mt-0.5">Predict the game. Own the outcome.</span>
        </a>
        <div className="hidden md:flex items-center gap-8 font-label-caps text-label-caps uppercase">
          <a href="/" className="text-primary-container">Markets</a>
          <a href="/leaderboard" className="text-on-surface hover:text-primary-container transition-colors">Leaderboard</a>
          <a href="#how" className="text-on-surface hover:text-primary-container transition-colors">How it works</a>
          <a href="https://txline-docs.txodds.com" target="_blank" rel="noreferrer" className="text-on-surface hover:text-primary-container transition-colors">About</a>
        </div>
        <a href="/" className="flex items-center gap-2 border border-primary-container text-primary-container px-5 py-2.5 font-label-caps text-label-caps uppercase hover:bg-primary-container hover:text-on-primary-container transition-all">
          Connect Wallet
        </a>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="w-full h-full object-cover opacity-30 grayscale" src="/stadium.png" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/40" />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/art/landing-trophy.png" className="hidden lg:block absolute left-1/2 top-8 -translate-x-1/2 h-[90%] w-auto object-contain z-[1] mix-blend-lighten pointer-events-none" />

        <div className="relative z-10 px-margin-mobile md:px-margin-desktop pt-10 pb-8 grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-8 items-start">
          {/* headline */}
          <motion.div initial={false}>
            <h1 className="grunge-text font-display-hero text-[16vw] md:text-[110px] leading-[0.8] italic uppercase">
              <span className="text-on-surface">Predict.</span><br />
              <span className="text-on-surface">Stake.</span><br />
              <span className="text-primary-container">Win.</span>
            </h1>
            <p className="font-body-md text-on-surface-variant mt-6 max-w-sm">
              The ultimate <span className="text-primary-container font-bold">FIFA World Cup</span> prediction market — settled on-chain by TxODDS.
            </p>
            <a href="/" className="inline-flex items-center gap-3 mt-8 bg-primary-container text-on-primary-container px-8 py-4 font-label-caps text-label-caps font-black uppercase hover:scale-105 transition-all shadow-[0_0_25px_rgba(207,243,1,0.35)]">
              Browse markets →
            </a>
          </motion.div>

          {/* right cards */}
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 xl:justify-self-end w-full">
            {/* stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="border border-primary-container/30 bg-black/60 backdrop-blur-md p-6 self-start">
              <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Live Volume</div>
              <VolumeStat value={2458921} prefix="$" className="font-display-hero text-headline-lg italic text-primary-container" />
              <div className="font-label-caps text-[10px] mt-1"><span className="text-primary-container">+24.7%</span> <span className="text-on-surface-variant">24H Volume</span></div>
              <div className="h-px w-full bg-metallic-gray/40 my-5" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Markets Live</div>
                  <VolumeStat value={24} className="font-display-hero text-headline-lg-mobile italic text-primary-container" />
                </div>
                <div>
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Traders</div>
                  <VolumeStat value={5842} className="font-display-hero text-headline-lg-mobile italic text-primary-container" />
                </div>
              </div>
              <div className="mt-5 font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">Powered by ◎ Solana</div>
            </motion.div>

            {/* road to glory */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative overflow-hidden border border-primary-container/40 min-h-[280px] flex flex-col justify-between p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src="/art/road-glory.png" className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-lighten" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="relative z-10">
                <div className="grunge-text font-display-hero text-headline-lg-mobile italic uppercase leading-none">
                  Road to<br /><span className="text-primary-container">Glory</span>
                </div>
                <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mt-2">Every match. Every moment.<br />Every prediction counts.</p>
              </div>
              <a href="/" className="relative z-10 text-center border border-primary-container text-primary-container py-2.5 font-label-caps text-[10px] uppercase hover:bg-primary-container hover:text-on-primary-container transition-all">Join the movement</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hot markets + Top traders */}
      <section className="px-margin-mobile md:px-margin-desktop py-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div>
          <h2 className="font-headline-lg-mobile italic uppercase mb-4 flex items-center gap-2">🔥 Hot Markets</h2>
          <div className="space-y-4">
            {HOT.map((m) => (
              <a key={m.title} href="/" className="block border border-metallic-gray/60 bg-surface-container-low hover:border-primary-container/60 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,1.2fr)_2.4fr_auto_40px] items-center gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center text-xl bg-surface-variant border border-metallic-gray/40">{m.icon}</span>
                    <div>
                      {m.tag && <span className="bg-primary-container text-on-primary-container px-1.5 py-0.5 font-label-caps text-[8px] uppercase">{m.tag}</span>}
                      <div className="font-body-md text-on-surface-variant text-sm">{m.q}</div>
                      <div className="font-label-caps text-label-caps uppercase text-on-surface">{m.title}</div>
                      <div className="font-label-caps text-[9px] text-on-surface-variant/60 uppercase">{m.sub}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {m.opts.map(([flag, name, odds, pct]) => (
                      <div key={name}>
                        <div className="flex items-center gap-1.5 mb-0.5"><span>{flag}</span><span className="font-label-caps text-[10px] uppercase truncate">{name}</span></div>
                        <div className="flex items-baseline gap-2"><span className="font-data-numeric text-primary-container italic">{odds}</span><span className="text-[10px] text-on-surface-variant">{pct}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="font-label-caps text-[9px] text-on-surface-variant uppercase">Total Pool</div>
                    <div className="font-data-numeric text-primary-container italic">{m.pool}</div>
                  </div>
                  <span className="text-primary-container text-center">›</span>
                </div>
              </a>
            ))}
          </div>
          <a href="/" className="mt-4 flex items-center justify-center gap-2 border border-primary-container/50 text-primary-container py-3 font-label-caps text-label-caps uppercase hover:bg-primary-container/10 transition-colors">View all markets →</a>
        </div>

        {/* Top traders */}
        <div className="border border-metallic-gray/60 bg-surface-container-low p-5 h-fit">
          <h3 className="font-label-caps text-label-caps uppercase flex items-center gap-2 mb-4">◎ Top Traders</h3>
          <div className="space-y-1">
            {TRADERS.map(([rank, name, amt]) => (
              <div key={name} className="flex items-center gap-3 py-2.5 border-b border-metallic-gray/20 last:border-0">
                <span className="w-6 text-center font-display-hero italic text-headline-lg-mobile" style={{ color: rank.length === 1 && Number(rank) > 3 ? "var(--color-on-surface-variant)" : "var(--color-primary-container)" }}>{rank}</span>
                <span className="flex-1 font-label-caps text-label-caps">{name}</span>
                <span className="font-data-numeric text-primary-container text-sm">{amt}</span>
              </div>
            ))}
          </div>
          <a href="/leaderboard" className="mt-4 flex items-center justify-center gap-2 border border-primary-container text-primary-container py-3 font-label-caps text-[10px] uppercase hover:bg-primary-container hover:text-on-primary-container transition-all">View Leaderboard 🏆</a>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="px-margin-mobile md:px-margin-desktop py-6 border-t border-metallic-gray/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display-hero text-headline-lg-mobile italic flex items-center gap-1"><span>VERDICT</span><span className="text-primary-container border border-primary-container px-1 not-italic text-sm">TX</span></span>
          <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">Built for fans. Backed by blockchain.</span>
        </div>
        <div className="flex items-center gap-6 font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">
          <span>◇ Fair markets</span><span>🔒 On-chain transparency</span><span>◎ Community driven</span>
        </div>
      </footer>
    </div>
  );
}
