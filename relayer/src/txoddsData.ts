/**
 * TxODDS TxLINE data client (devnet). Uses the JWT + apiToken from `subscribe` (relayer/.env).
 * Devnet data server is `txline-dev`.
 */
import "dotenv/config";

const DATA_ORIGIN = process.env.TXODDS_DATA_ORIGIN ?? "https://txline-dev.txodds.com";
const JWT = process.env.TXODDS_JWT ?? "";
const API_TOKEN = process.env.TXODDS_API_KEY ?? "";

function headers(): Record<string, string> {
  return { Authorization: `Bearer ${JWT}`, "X-Api-Token": API_TOKEN };
}

async function get<T = any>(path: string, query: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(path, DATA_ORIGIN);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: headers(), redirect: "follow" });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${url.pathname} → ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const txodds = {
  fixturesSnapshot: (q: Record<string, string | number> = {}) => get("/api/fixtures/snapshot", q),
  scoresSnapshot: (fixtureId: number | string) => get(`/api/scores/snapshot/${fixtureId}`),
  oddsSnapshot: (fixtureId: number | string) => get(`/api/odds/snapshot/${fixtureId}`),
  statValidation: (q: { fixtureId: number; seq: number; statKey: number; statKey2?: number }) =>
    get("/api/scores/stat-validation", q as any),
  raw: get,
};

export const hasCreds = Boolean(JWT && API_TOKEN);
