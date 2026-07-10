"use client";

import { motion } from "framer-motion";
import { VolumeStat } from "@/components/VolumeStat";
import { Icon } from "@/components/Icon";
import { WalletButton } from "@/components/WalletButton";

const HOT = [
  {
    tag: "FEATURED",
    q: "Who will win the",
    title: "FIFA World Cup 2026?",
    sub: "Outright Winner",
    art: "/art/ic-trophy.png",
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
    art: "/art/ic-ball.png",
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
    art: "/art/ic-glove.png",
    pool: "$142,550",
    opts: [
      ["🇩🇪", "M. Ter Stegen", "2.50", "20%"],
      ["🇧🇷", "Alisson", "3.10", "17%"],
      ["🇦🇷", "E. Martinez", "4.00", "13%"],
    ],
  },
];

const TRADERS: [string, string, string, string][] = [
  ["🥇", "DeFiStriker", "+ $18,490", "from-fuchsia-500 to-violet-600"],
  ["🥈", "PredictKing", "+ $11,230", "from-violet-500 to-indigo-600"],
  ["🥉", "SolBaller", "+ $7,890", "from-emerald-500 to-teal-600"],
  ["4", "MarketMaverick", "+ $5,430", "from-sky-500 to-blue-600"],
  ["5", "VerdictMaster", "+ $4,210", "from-amber-500 to-orange-600"],
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Wordmark({ small }: { small?: boolean }) {
  return (
    <span className={`font-display-hero italic tracking-tighter flex items-center gap-1 ${small ? "text-headline-lg-mobile" : "text-headline-lg"}`}>
      <span className="text-on-surface">VERDICT</span>
      <span className="text-primary-container border border-primary-container px-1 not-italic text-sm rounded-sm">TX</span>
    </span>
  );
}

export default function Welcome() {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-background text-on-surface grain">
      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-20 border-b border-metallic-gray/30">
        <a href="/" className="flex flex-col leading-none">
          <Wordmark />
          <span className="font-label-caps text-[8px] text-on-surface-variant/70 uppercase tracking-[0.2em] mt-1">Predict the game. Own the outcome.</span>
        </a>
        <div className="hidden md:flex items-center gap-9 font-label-caps text-label-caps uppercase">
          <a href="/" className="relative text-primary-container">
            Markets
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-container rounded-full" />
          </a>
          {[["Leaderboard", "/leaderboard"], ["How it works", "/#how"], ["About", "https://txline-docs.txodds.com"]].map(([l, h]) => (
            <a key={l} href={h} className="text-on-surface hover:text-primary-container transition-colors">{l}</a>
          ))}
        </div>
        <WalletButton />
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="w-full h-full object-cover opacity-25 grayscale" src="/stadium.png" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background/30" />
          <div className="absolute -left-40 top-1/3 w-[520px] h-[520px] rounded-full blur-[140px]" style={{ background: "rgba(207,243,1,0.07)" }} />
        </div>

        <div className="relative z-10 px-margin-mobile md:px-margin-desktop py-8 grid grid-cols-1 xl:grid-cols-[minmax(0,470px)_1fr] gap-8 items-start">
          {/* headline */}
          <motion.div initial={false} className="pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Predict. Stake. Win." src="/art/headline.png" className="w-full max-w-[470px] select-none pointer-events-none" />
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface mt-4 leading-relaxed">
              The ultimate <span className="text-primary-container">FIFA World Cup</span><br />prediction market
            </p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="skew-cta inline-flex items-center gap-4 mt-7 bg-primary-container text-on-primary-container pl-7 pr-3 py-4 shadow-[0_0_30px_rgba(207,243,1,0.35)]"
            >
              <span className="font-label-caps text-label-caps font-black uppercase">Browse markets</span>
              <span className="grid place-items-center w-8 h-8 bg-black/15">
                <Icon name="chevronRight" size={16} />
              </span>
            </motion.a>
          </motion.div>

          {/* trophy + cards */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] xl:grid-cols-[1fr_auto_auto] gap-5 items-start">
            <motion.img
              alt=""
              src="/art/trophy-rings.png"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="hidden lg:block h-[500px] w-auto object-contain justify-self-center pointer-events-none select-none drop-shadow-[0_0_60px_rgba(207,243,1,0.15)]"
            />

            {/* Stats */}
            <motion.div initial={false} className="rounded-2xl border border-primary-container/20 bg-black/70 backdrop-blur-md p-6 lime-glow w-full lg:w-[270px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-primary-container/15 text-primary-container"><Icon name="download" size={12} /></span>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Live Volume</span>
              </div>
              <VolumeStat value={2458921} prefix="$" className="block font-display-hero text-[34px] leading-none italic text-primary-container" />
              <div className="font-label-caps text-[10px] mt-2"><span className="text-primary-container">+24.7%</span></div>
              <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">24H Volume</div>

              <div className="h-px w-full bg-metallic-gray/40 my-5" />

              <div className="grid grid-cols-2">
                <div>
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Markets Live</div>
                  <VolumeStat value={24} className="font-display-hero text-[28px] italic text-primary-container" />
                </div>
                <div className="pl-4 border-l border-metallic-gray/40">
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Traders</div>
                  <VolumeStat value={5842} className="font-display-hero text-[28px] italic text-primary-container" />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-1.5 font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">
                Powered by <span className="text-on-surface">◎ Solana</span>
              </div>
            </motion.div>

            {/* Road to glory */}
            <motion.div initial={false} className="relative rounded-2xl overflow-hidden border border-primary-container/60 min-h-[300px] w-full xl:w-[240px] flex flex-col justify-between p-5 lime-glow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src="/art/road-glory.png" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
              <div className="relative z-10">
                <div className="grunge-text font-display-hero italic uppercase leading-none">
                  <span className="text-[22px] text-on-surface">Road to</span><br />
                  <span className="text-[40px] text-primary-container">Glory</span>
                </div>
                <p className="font-label-caps text-[9px] text-on-surface uppercase tracking-widest mt-3 leading-relaxed">
                  Every match.<br />Every moment.<br />Every prediction counts.
                </p>
              </div>
              <motion.a href="/" whileHover={{ scale: 1.03 }} className="relative z-10 rounded-lg text-center border border-primary-container text-primary-container py-2.5 font-label-caps text-[10px] uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors">
                Join the movement
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hot markets + Top traders */}
      <section className="relative z-10 px-margin-mobile md:px-margin-desktop pb-8 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div>
          <h2 className="font-headline-lg-mobile italic uppercase mb-4 flex items-center gap-2">🔥 Hot Markets</h2>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {HOT.map((m) => (
              <motion.a
                key={m.title}
                variants={rise}
                whileHover={{ y: -3 }}
                href="/"
                className="block rounded-xl border border-metallic-gray/50 bg-surface-container-low/80 hover:border-primary-container/60 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(230px,1.1fr)_2.3fr_auto_44px] items-center gap-4 p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src={m.art} className="w-12 h-12 rounded-lg object-cover border border-metallic-gray/40" />
                    <div className="min-w-0">
                      {m.tag && <span className="inline-block mb-1 rounded bg-primary-container text-on-primary-container px-1.5 py-0.5 font-label-caps text-[8px] uppercase">{m.tag}</span>}
                      <div className="font-body-md text-on-surface-variant text-sm leading-tight">{m.q}</div>
                      <div className="font-label-caps text-label-caps uppercase text-on-surface truncate">{m.title}</div>
                      <div className="font-label-caps text-[9px] text-on-surface-variant/60 uppercase mt-0.5">{m.sub}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3">
                    {m.opts.map(([flag, name, odds, pct], i) => (
                      <div key={name} className={i > 0 ? "pl-4 border-l border-metallic-gray/30" : ""}>
                        <div className="flex items-center gap-1.5 mb-1"><span className="text-base">{flag}</span><span className="font-label-caps text-[10px] uppercase truncate text-on-surface-variant">{name}</span></div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-data-numeric text-on-surface text-lg italic">{odds}</span>
                          <span className="text-[10px] text-on-surface-variant/60">{pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-right">
                    <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">Total Pool</div>
                    <div className="font-data-numeric text-primary-container italic text-lg">{m.pool}</div>
                  </div>

                  <span className="justify-self-end grid place-items-center w-9 h-9 rounded-full border border-metallic-gray/50 text-primary-container">
                    <Icon name="chevronRight" size={16} />
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.a href="/" whileHover={{ scale: 1.01 }} className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-primary-container/50 text-primary-container py-3.5 font-label-caps text-label-caps uppercase hover:bg-primary-container/10 transition-colors">
            View all markets
            <span className="grid place-items-center w-7 h-7 rounded-md border border-primary-container/50"><Icon name="chevronRight" size={14} /></span>
          </motion.a>
        </div>

        {/* Top traders */}
        <div className="rounded-2xl border border-metallic-gray/50 bg-surface-container-low/80 p-5 h-fit lime-glow">
          <h3 className="font-label-caps text-label-caps uppercase flex items-center gap-2 mb-4">
            <span className="grid place-items-center w-6 h-6 rounded-full bg-primary-container/15 text-primary-container"><Icon name="verified" size={13} /></span>
            Top Traders
          </h3>
          <div>
            {TRADERS.map(([rank, name, amt, grad], i) => (
              <motion.div key={name} whileHover={{ x: 2 }} className="flex items-center gap-3 py-2.5 border-b border-metallic-gray/20 last:border-0">
                <span className={`w-6 text-center ${i < 3 ? "text-base" : "font-display-hero italic text-on-surface-variant"}`}>{rank}</span>
                <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} shrink-0 border border-white/10`} />
                <span className="flex-1 font-label-caps text-label-caps truncate">{name}</span>
                <span className="font-data-numeric text-primary-container text-sm">{amt}</span>
              </motion.div>
            ))}
          </div>
          <motion.a href="/leaderboard" whileHover={{ scale: 1.02 }} className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-primary-container text-primary-container py-3 font-label-caps text-[10px] uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors">
            View Leaderboard 🏆
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-margin-mobile md:px-margin-desktop py-7 border-t border-metallic-gray/30 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Wordmark small />
          <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">Built for fans. Backed by blockchain.</span>
        </div>
        <div className="flex items-center gap-7 font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">
          {([["scale", "Fair markets"], ["lock", "On-chain transparency"], ["users", "Community driven"]] as const).map(([ic, l]) => (
            <span key={l} className="flex items-center gap-2">
              <span className="text-primary-container"><Icon name={ic} size={15} /></span>{l}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant/40">
          {(["discord", "x", "telegram"] as const).map((s) => (
            <span key={s} title="Coming soon" className="cursor-not-allowed">
              <Icon name={s} size={18} />
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
