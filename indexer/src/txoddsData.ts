/** Minimal TxODDS TxLINE data client for the indexer (fixtures + scores). Devnet server. */
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";

// Load creds from the indexer's own .env, then fall back to the relayer's (where `subscribe` saves them).
loadEnv();
loadEnv({ path: fileURLToPath(new URL("../../relayer/.env", import.meta.url)) });

const ORIGIN = process.env.TXODDS_DATA_ORIGIN ?? "https://txline-dev.txodds.com";
const JWT = process.env.TXODDS_JWT ?? "";
const API_TOKEN = process.env.TXODDS_API_KEY ?? "";

export const hasCreds = Boolean(JWT && API_TOKEN);

async function get<T = any>(path: string): Promise<T> {
  const res = await fetch(new URL(path, ORIGIN), {
    headers: { Authorization: `Bearer ${JWT}`, "X-Api-Token": API_TOKEN },
    redirect: "follow",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${text.slice(0, 160)}`);
  return JSON.parse(text) as T;
}

export interface TxFixture {
  FixtureId: number;
  Participant1: string;
  Participant2: string;
  Participant1IsHome?: boolean;
  StartTime: number;
  Competition: string;
  CompetitionId: number;
}

export const txodds = {
  fixtures: () => get<TxFixture[] | { fixtures: TxFixture[] }>("/api/fixtures/snapshot"),
  scores: (fixtureId: number) => get<any>(`/api/scores/snapshot/${fixtureId}`),
};
