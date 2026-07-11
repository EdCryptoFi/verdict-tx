/**
 * Vercel Serverless Function — on-chain market sync, triggered by Vercel Cron (see vercel.json).
 *
 * Runs one pass of the same `runSyncOnce()` used by the local loop: creates a 1X2 market for any
 * new World Cup fixture and resolves finished ones via the real TxODDS validate_stat CPI. This is
 * the "no always-on server" path — Vercel invokes it on a schedule instead of a persistent host.
 *
 * Env: ADMIN_KEYPAIR_SECRET (JSON byte array of the admin key), USDC_MINT, SOLANA_RPC_URL,
 *      TXODDS_JWT, TXODDS_API_KEY, and CRON_SECRET (Vercel sends it as a Bearer token).
 */
import { runSyncOnce } from "../relayer/src/syncOnce.js";

export default async function handler(req: any, res: any) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Reject anything else so the endpoint
  // can't be triggered by the public.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const result = await runSyncOnce();
    res.status(200).json({ ok: true, ...result });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
