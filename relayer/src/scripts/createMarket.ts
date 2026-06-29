/** CLI: create a 1X2 market for a fixture. Usage: pnpm create-market <fixtureId> [closeInMin] */
import { PublicKey } from "@solana/web3.js";
import { adminKeypair, config } from "../config.js";
import { createMarket1X2 } from "../createMarket.js";

const fixtureId = Number(process.argv[2] ?? 900001);
const closeInMin = Number(process.argv[3] ?? 90);

if (!config.usdcMint) {
  console.error("Set USDC_MINT in .env (the settlement SPL mint).");
  process.exit(1);
}

await createMarket1X2({
  admin: adminKeypair(),
  fixtureId,
  mint: new PublicKey(config.usdcMint),
  bettingCloseTs: Math.floor(Date.now() / 1000) + closeInMin * 60,
});
