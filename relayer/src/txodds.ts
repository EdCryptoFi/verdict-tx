/**
 * TxODDS TxLINE API client.
 *
 * Auth: guest JWT (`POST /auth/guest/start`) + long-lived API token after on-chain subscription,
 * sent as `Authorization: Bearer {jwt}` and `X-Api-Token: {apiToken}`.
 *
 * Until real credentials are wired (TxODDS Telegram), set `TXODDS_MOCK=1` to serve recorded
 * fixtures/scores/proofs so the whole pipeline (create_market → resolve → claim) is testable.
 */
import { request } from "undici";
import { config } from "./config.js";
import { mockFixtures, mockScoreValidation } from "./mock.js";

export interface Fixture {
  fixtureId: number;
  startTime: number; // unix ms
  league: string;
  home: string;
  away: string;
}

export interface ApiProofNode {
  hash: string;
  isRightSibling: boolean;
}
export interface ApiStatTerm {
  statToProve: { key: number; value: number; period: number };
  eventStatRoot: string;
  statProof: ApiProofNode[];
}

/** Shape of GET /api/scores/stat-validation (ScoresStatValidation). */
export interface ScoresStatValidation {
  ts: number;
  statToProve: { key: number; value: number; period: number };
  eventStatRoot: string;
  summary: {
    fixtureId: number;
    updateStats: { updateCount: number; minTimestamp: number; maxTimestamp: number };
    eventStatsSubTreeRoot: string;
  };
  statProof: ApiProofNode[];
  subTreeProof: ApiProofNode[];
  mainTreeProof: ApiProofNode[];
  statToProve2?: { key: number; value: number; period: number };
  statProof2?: ApiProofNode[];
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (config.txodds.jwt) h["Authorization"] = `Bearer ${config.txodds.jwt}`;
  if (config.txodds.apiKey) h["X-Api-Token"] = config.txodds.apiKey;
  return h;
}

async function get<T>(path: string, query: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(path, config.txodds.base);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  const res = await request(url, { method: "GET", headers: headers() });
  if (res.statusCode >= 300) {
    throw new Error(`TxODDS ${path} -> ${res.statusCode}: ${await res.body.text()}`);
  }
  return (await res.body.json()) as T;
}

/** List World Cup fixtures (free tier). */
export async function getFixtures(): Promise<Fixture[]> {
  if (config.txodds.mock) return mockFixtures();
  // TODO: confirm exact path/params with TxODDS; placeholder until creds arrive.
  return get<Fixture[]>("/api/fixtures/snapshot", { sport: "soccer" });
}

/**
 * Get the three-stage Merkle proof for a score statistic.
 * GET /api/scores/stat-validation?fixtureId&seq&statKey[&statKey2]
 */
export async function getStatValidation(params: {
  fixtureId: number;
  seq: number;
  statKey: number;
  statKey2?: number;
}): Promise<ScoresStatValidation> {
  if (config.txodds.mock) return mockScoreValidation(params);
  const q: Record<string, number> = {
    fixtureId: params.fixtureId,
    seq: params.seq,
    statKey: params.statKey,
  };
  if (params.statKey2 !== undefined) q.statKey2 = params.statKey2;
  return get<ScoresStatValidation>("/api/scores/stat-validation", q);
}
