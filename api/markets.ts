/**
 * Vercel Serverless Function — live market feed for the hosted (static) frontend.
 *
 * The frontend polls this instead of the local WebSocket indexer, so the public site stays in
 * sync without any always-on server. TxODDS credentials live in Vercel env vars (server-side),
 * so they never reach the browser — the client only sees the shaped JSON.
 *
 * Env: TXODDS_JWT, TXODDS_API_KEY, (optional) TXODDS_DATA_ORIGIN.
 */

const DATA_ORIGIN = process.env.TXODDS_DATA_ORIGIN ?? "https://txline-dev.txodds.com";
const JWT = process.env.TXODDS_JWT ?? "";
const API_TOKEN = process.env.TXODDS_API_KEY ?? "";

const BETTING_WINDOW_MS = 90 * 60 * 1000; // markets close ~kickoff + 90'
const MAX_MARKETS = 6;

const FLAGS: Record<string, string> = {
  Brazil: "🇧🇷", Argentina: "🇦🇷", France: "🇫🇷", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Spain: "🇪🇸", Portugal: "🇵🇹",
  Germany: "🇩🇪", Italy: "🇮🇹", Netherlands: "🇳🇱", Belgium: "🇧🇪", Croatia: "🇭🇷", Uruguay: "🇺🇾",
  Mexico: "🇲🇽", USA: "🇺🇸", "United States": "🇺🇸", Canada: "🇨🇦", Japan: "🇯🇵", "South Korea": "🇰🇷",
  Morocco: "🇲🇦", Senegal: "🇸🇳", Ghana: "🇬🇭", Nigeria: "🇳🇬", Cameroon: "🇨🇲", Egypt: "🇪🇬",
  Switzerland: "🇨🇭", Colombia: "🇨🇴", Norway: "🇳🇴", Sweden: "🇸🇪", Denmark: "🇩🇰", Poland: "🇵🇱",
  Ecuador: "🇪🇨", Peru: "🇵🇪", Chile: "🇨🇱", Australia: "🇦🇺", Qatar: "🇶🇦", "Saudi Arabia": "🇸🇦",
  Myanmar: "🇲🇲", Vietnam: "🇻🇳",
};
const flag = (name: string) => FLAGS[name] ?? "🏳️";

async function txGet(path: string): Promise<any> {
  const res = await fetch(new URL(path, DATA_ORIGIN), {
    headers: { Authorization: `Bearer ${JWT}`, "X-Api-Token": API_TOKEN },
    redirect: "follow",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return JSON.parse(text);
}

function toMarket(f: any) {
  const now = Date.now();
  const started = f.StartTime <= now;
  const done = now > f.StartTime + BETTING_WINDOW_MS;
  return {
    fixtureId: f.FixtureId,
    home: f.Participant1,
    away: f.Participant2,
    homeFlag: flag(f.Participant1),
    awayFlag: flag(f.Participant2),
    status: done ? "final" : started ? "live" : "upcoming",
    liveScore: [0, 0] as [number, number],
    matchMinute: 0,
    closeTs: f.StartTime,
    poolUsdc: 0,
    bettors: 0,
    momentumHome: 0.5,
    outcomes: [
      { label: "Home", odds: 2.1 },
      { label: "Draw", odds: 3.1 },
      { label: "Away", odds: 3.2 },
    ],
  };
}

function applyScore(m: ReturnType<typeof toMarket>, s: any) {
  const snap = Array.isArray(s) ? s[s.length - 1] : s;
  const g1 = snap?.Score?.Participant1?.Total?.Goals ?? m.liveScore[0];
  const g2 = snap?.Score?.Participant2?.Total?.Goals ?? m.liveScore[1];
  const minute = snap?.Clock?.Seconds ? Math.min(90, Math.floor(snap.Clock.Seconds / 60)) : m.matchMinute;
  const diff = g1 - g2;
  m.liveScore = [g1, g2];
  m.matchMinute = minute;
  m.momentumHome = Math.max(0.1, Math.min(0.9, 0.5 + diff * 0.12));
}

export default async function handler(_req: any, res: any) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=45");

  if (!JWT || !API_TOKEN) {
    res.status(200).json({ markets: [], live: false, reason: "no-credentials" });
    return;
  }

  try {
    const raw = await txGet("/api/fixtures/snapshot");
    const list: any[] = Array.isArray(raw) ? raw : raw.fixtures ?? [];
    const wc = list.filter((f) => f.Competition === "World Cup" || f.CompetitionId === 72);
    const chosen = (wc.length ? wc : list).slice(0, MAX_MARKETS);
    const markets = chosen.map(toMarket);

    // Enrich started matches with live scores (best-effort, in parallel).
    await Promise.all(
      markets.map(async (m) => {
        if (m.closeTs > Date.now()) return; // not started yet
        try {
          applyScore(m, await txGet(`/api/scores/snapshot/${m.fixtureId}`));
        } catch {
          /* no live score yet */
        }
      })
    );

    res.status(200).json({ markets, live: true });
  } catch (e: any) {
    res.status(200).json({ markets: [], live: false, reason: e.message });
  }
}
