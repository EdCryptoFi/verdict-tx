"use client";

import { motion } from "framer-motion";
import { VolumeStat } from "@/components/VolumeStat";
import { Icon } from "@/components/Icon";
import { WalletButton } from "@/components/WalletButton";
import { useProtocolStats } from "@/lib/useProtocolStats";
import { useLiveMarkets } from "@/lib/useLiveMarkets";
import { useOnchainMarkets, applyChainState } from "@/lib/useOnchainMarkets";
import { DEMO_MARKETS } from "@/lib/demoMarkets";

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
  const stats = useProtocolStats();
  const { markets: feed } = useLiveMarkets(DEMO_MARKETS);
  const { chain } = useOnchainMarkets();
  const markets = applyChainState(feed, chain);
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
          {[["How it works", "/#how"], ["About", "https://txline-docs.txodds.com"]].map(([l, h]) => (
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
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Total Staked</span>
              </div>
              <VolumeStat value={Math.round(stats.volumeUsdc)} className="block font-display-hero text-[34px] leading-none italic text-primary-container" />
              <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">USDC · Solana devnet</div>

              <div className="h-px w-full bg-metallic-gray/40 my-5" />

              <div className="grid grid-cols-3">
                <div>
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Open</div>
                  <VolumeStat value={stats.marketsOpen} className="font-display-hero text-[28px] italic text-primary-container" />
                </div>
                <div className="pl-3 border-l border-metallic-gray/40">
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Settled</div>
                  <VolumeStat value={stats.marketsSettled} className="font-display-hero text-[28px] italic text-primary-container" />
                </div>
                <div className="pl-3 border-l border-metallic-gray/40">
                  <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Traders</div>
                  <VolumeStat value={stats.traders} className="font-display-hero text-[28px] italic text-primary-container" />
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

      {/* Live markets — the real ones, read from chain */}
      <section className="relative z-10 px-margin-mobile md:px-margin-desktop pb-8">
        <div>
          <h2 className="font-headline-lg-mobile italic uppercase mb-4 flex items-center gap-2">🔥 Live Markets</h2>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {markets.map((m) => (
              <motion.a
                key={m.fixtureId}
                variants={rise}
                whileHover={{ y: -3 }}
                href={`/match?id=${m.fixtureId}`}
                className="block rounded-xl border border-metallic-gray/50 bg-surface-container-low/80 hover:border-primary-container/60 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(230px,1.1fr)_2.3fr_auto_44px] items-center gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-12 h-12 rounded-lg border border-metallic-gray/40 text-2xl">{m.homeFlag}</span>
                    <div className="min-w-0">
                      {m.winningOutcome !== undefined && (
                        <span className="inline-block mb-1 rounded bg-primary-container text-on-primary-container px-1.5 py-0.5 font-label-caps text-[8px] uppercase">Settled ✓</span>
                      )}
                      <div className="font-body-md text-on-surface-variant text-sm leading-tight">Who wins?</div>
                      <div className="font-label-caps text-label-caps uppercase text-on-surface truncate">{m.home} v {m.away}</div>
                      <div className="font-label-caps text-[9px] text-on-surface-variant/60 uppercase mt-0.5">Full-time 1X2</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3">
                    {m.outcomes.map((o, i) => (
                      <div key={o.label} className={i > 0 ? "pl-4 border-l border-metallic-gray/30" : ""}>
                        <div className="font-label-caps text-[10px] uppercase truncate text-on-surface-variant mb-1">{o.label}</div>
                        <span className="font-data-numeric text-on-surface text-lg italic">
                          {o.odds > 0 ? `${o.odds.toFixed(2)}x` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-right">
                    <div className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">Total Pool</div>
                    <div className="font-data-numeric text-primary-container italic text-lg">{m.poolUsdc.toLocaleString()} USDC</div>
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
        <div className="flex items-center gap-5">
          <a href="https://x.com/EdCriptoFi" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-label-caps text-[9px] text-on-surface-variant hover:text-primary-container uppercase tracking-widest transition-colors">
            <Icon name="x" size={14} /> Created by Ed
          </a>
          <span className="flex items-center gap-3 text-on-surface-variant/40">
            {(["discord", "telegram"] as const).map((s) => (
              <span key={s} title="Coming soon" className="cursor-not-allowed">
                <Icon name={s} size={16} />
              </span>
            ))}
          </span>
        </div>
      </footer>
    </div>
  );
}
