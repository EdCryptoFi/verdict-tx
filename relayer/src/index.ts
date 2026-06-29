/**
 * Relayer entrypoint.
 *
 * Phase 1 (now): create markets from fixtures, and crank resolution when a match is final.
 * Phase 2: subscribe to TxODDS SSE for live scores and auto-resolve on full-time.
 */
import { adminKeypair, config } from "./config.js";
import { getFixtures } from "./txodds.js";

async function main() {
  console.log(`PitchMarket relayer · cluster=${config.cluster} · mock=${config.txodds.mock}`);
  const admin = adminKeypair();
  console.log(`admin: ${admin.publicKey.toBase58()}`);

  const fixtures = await getFixtures();
  console.log(`fixtures: ${fixtures.length}`);
  for (const f of fixtures) {
    console.log(`  · ${f.fixtureId} ${f.home} v ${f.away} @ ${new Date(f.startTime).toISOString()}`);
  }

  // TODO: per fixture → createMarket1X2 if not exists; watch SSE → resolveMarket1X2 on full-time.
  console.log("relayer idle (wire create/resolve loop once TxODDS creds + stat keys are confirmed).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
