#!/usr/bin/env bash
# Run the Anchor TS tests against a local validator WITHOUT surfpool.
# Loads the TxODDS stub at the real TxODDS address, deploys pitchmarket, runs ts-mocha.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LEDGER="${SCRATCH_LEDGER:-/tmp/pitchmarket-test-ledger}"
RPC="http://127.0.0.1:8899"
WALLET="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
TXODDS="6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
STUB_SO="target/deploy/txodds_stub.so"
PM_SO="target/deploy/pitchmarket.so"
PM_KP="target/deploy/pitchmarket-keypair.json"

[ -f "$STUB_SO" ] || { echo "missing $STUB_SO — run: cargo build-sbf --manifest-path programs/txodds_stub/Cargo.toml"; exit 1; }
[ -f "$PM_SO" ] || { echo "missing $PM_SO — run: anchor build"; exit 1; }

echo "▶ starting validator (stub loaded at $TXODDS)…"
rm -rf "$LEDGER"
solana-test-validator -r --ledger "$LEDGER" \
  --bpf-program "$TXODDS" "$STUB_SO" \
  >/tmp/pitchmarket-validator.log 2>&1 &
VALIDATOR_PID=$!
trap 'kill $VALIDATOR_PID 2>/dev/null || true' EXIT

echo "▶ waiting for RPC…"
for i in $(seq 1 60); do
  if solana --url "$RPC" cluster-version >/dev/null 2>&1; then break; fi
  sleep 1
done
solana --url "$RPC" cluster-version >/dev/null 2>&1 || { echo "validator did not come up"; cat /tmp/pitchmarket-validator.log; exit 1; }

echo "▶ funding wallet…"
solana --url "$RPC" airdrop 100 "$(solana-keygen pubkey "$WALLET")" >/dev/null 2>&1 || true

echo "▶ deploying pitchmarket…"
solana --url "$RPC" program deploy "$PM_SO" --program-id "$PM_KP" >/dev/null

echo "▶ running tests…"
ANCHOR_PROVIDER_URL="$RPC" ANCHOR_WALLET="$WALLET" \
  pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts

echo "✅ tests finished"
