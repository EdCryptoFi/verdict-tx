/**
 * Self-credential against the TxODDS World Cup free tier on devnet, then persist creds.
 * Usage: SOLANA_RPC_URL=devnet ADMIN_KEYPAIR=~/.config/solana/id.json pnpm --filter @verdict/relayer subscribe
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { adminKeypair, connection } from "../config.js";
import { guestJwt, subscribeFree, activate, TXL_MINT, SERVICE_LEVEL_ID, DURATION_WEEKS } from "../txoddsAuth.js";

const admin = adminKeypair();
console.log(`admin: ${admin.publicKey.toBase58()}`);
console.log(`SOL: ${(await connection().getBalance(admin.publicKey)) / 1e9}`);
console.log(`service_level=${SERVICE_LEVEL_ID} weeks=${DURATION_WEEKS} TxL mint=${TXL_MINT.toBase58()}\n`);

console.log("① guest JWT…");
const jwt = await guestJwt();
console.log(`   jwt: ${jwt.slice(0, 24)}… (${jwt.length} chars)`);

console.log("② subscribe (free World Cup tier)…");
const txSig = await subscribeFree(admin);
console.log(`   tx: ${txSig}`);

console.log("③ activate…");
const apiToken = await activate(admin, txSig, jwt, []);
console.log(`   apiToken: ${apiToken.slice(0, 24)}… (${apiToken.length} chars)`);

// Persist to relayer/.env (gitignored) for the relayer + indexer to use.
const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const withoutOld = existing
  .split("\n")
  .filter((l) => !/^TXODDS_(JWT|API_KEY)=/.test(l))
  .join("\n")
  .trim();
writeFileSync(envPath, `${withoutOld}\n`.replace(/^\n/, ""));
appendFileSync(envPath, `TXODDS_JWT=${jwt}\nTXODDS_API_KEY=${apiToken}\n`);
console.log(`\n✅ credentials saved to relayer/.env`);
