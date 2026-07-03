#!/usr/bin/env bash
# Deploy pitchmarket to devnet and run first-time setup (test USDC mint + demo market).
# Requires the deploy wallet (~/.config/solana/id.json) to hold ~3 SOL on devnet.
#   Fund it via https://faucet.solana.com (paste the address printed below) if airdrop is rate-limited.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.cargo/bin:$HOME/.avm/bin:$PATH"

WALLET="$HOME/.config/solana/id.json"
ADDR="$(solana-keygen pubkey "$WALLET")"
solana config set --url devnet >/dev/null

echo "deploy wallet: $ADDR"
echo "balance: $(solana balance)"
solana airdrop 2 >/dev/null 2>&1 || echo "airdrop rate-limited — fund $ADDR at https://faucet.solana.com"

BAL=$(solana balance | awk '{print $1}')
awk "BEGIN{exit !($BAL < 2.5)}" && { echo "need ≥2.5 SOL to deploy; current $BAL. Fund and re-run."; exit 1; }

echo "▶ building…"
anchor build --ignore-keys >/dev/null

echo "▶ deploying pitchmarket to devnet…"
solana program deploy target/deploy/pitchmarket.so --program-id target/deploy/pitchmarket-keypair.json

echo "▶ setup (mint + market)…"
SOLANA_RPC_URL="https://api.devnet.solana.com" ADMIN_KEYPAIR="$WALLET" \
  pnpm --filter @pitchmarket/relayer exec tsx src/scripts/setup.ts 900001

echo "✅ devnet ready — copy the NEXT_PUBLIC_* lines into app/.env.local"
