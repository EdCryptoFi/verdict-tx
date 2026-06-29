/** CLI: resolve a 1X2 market. Usage: pnpm resolve <fixtureId> [seq] */
import { adminKeypair } from "../config.js";
import { resolveMarket1X2 } from "../resolveMarket.js";

const fixtureId = Number(process.argv[2] ?? 900001);
const seq = Number(process.argv[3] ?? 1);

await resolveMarket1X2({ cranker: adminKeypair(), fixtureId, seq });
