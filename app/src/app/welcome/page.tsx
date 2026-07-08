/** Cinematic pre-login landing. Full-screen over the app chrome; "Launch app" enters the markets. */
export default function Welcome() {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-background">
      {/* stadium backdrop */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="w-full h-full object-cover grayscale opacity-40" src="/stadium.png" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 pitch-pattern opacity-40" />
      </div>

      <div className="relative z-10 min-h-full flex flex-col">
        {/* top brand */}
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16">
          <span className="font-display-hero text-headline-lg italic text-primary-fixed-dim tracking-tighter">VERDICT</span>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">FIFA World Cup 2026</span>
        </div>

        {/* hero */}
        <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop max-w-4xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="bg-danger-red px-2 py-0.5 font-label-caps text-[10px] italic pulse-live">ON-CHAIN</span>
            <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest">Verifiable settlement · Solana</span>
          </div>
          <h1 className="font-display-hero text-headline-lg md:text-display-hero italic uppercase leading-[0.9] mb-6">
            Bet the match. <br /><span className="text-primary-container">Trust the proof.</span>
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-xl mb-10">
            Pari-mutuel World Cup prediction markets that settle against TxODDS&apos; own on-chain
            Merkle-verified scores — via CPI into their <span className="font-data-numeric text-primary-container">validate_stat</span>.
            No trusted admin. No oracle key. Just the proof.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/" className="bg-primary-container text-on-primary-container px-10 py-4 font-label-caps text-label-caps font-black uppercase hover:scale-105 transition-all shadow-[0_0_25px_rgba(0,255,65,0.4)]">
              Launch app →
            </a>
            <a href="https://txline-docs.txodds.com" target="_blank" rel="noreferrer" className="border-2 border-primary-container text-primary-container px-10 py-4 font-label-caps text-label-caps italic uppercase hover:bg-primary-container/10 transition-colors">
              How it works
            </a>
          </div>
        </div>

        {/* value props */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-metallic-gray/40 border-t border-metallic-gray mt-10">
          {[
            ["0", "Trusted admins — settled by Merkle proof"],
            ["CPI", "Resolves via TxODDS validate_stat on-chain"],
            ["Pari-mutuel", "Fair pooled payouts on Solana"],
          ].map(([v, l]) => (
            <div key={l} className="bg-background px-margin-mobile md:px-8 py-6">
              <div className="font-data-numeric text-headline-lg-mobile italic text-primary-container">{v}</div>
              <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
