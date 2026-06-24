# Oracle Relayer

Ingests the TxODDS live football API and settles markets on-chain with a verifiable signature.

## Responsibilities
1. **Fixtures → markets** — for each World Cup fixture, call `create_market` (one or more per match: full-time result, over/under, etc.).
2. **Watch results** — poll/stream TxODDS for final (or interval) results.
3. **Sign & resolve** — when a result is final, build the canonical message
   `"PITCHMKT:v1" || match_id(LE u64) || kind(u8) || winning_outcome(u8)`, create a native
   **Ed25519Program** verify instruction signed by the oracle keypair, and submit a transaction
   `[ ed25519_verify_ix, resolve_ix(winning_outcome, ed25519_ix_index=0) ]`.

The on-chain program asserts ix #0 is a genuine Ed25519 verify of the market's `oracle_pubkey`
over the expected message — so settlement is trustless even though the relayer submits it.

## The message contract (must match the program's `resolution_message`)
```
message = utf8("PITCHMKT:v1") ++ u64_le(match_id) ++ u8(kind) ++ u8(winning_outcome)
```

## Files (planned)
- `src/txodds.ts` — TxODDS API client (fixtures, live scores, odds, results).
- `src/signer.ts` — load oracle keypair, build the Ed25519 verify instruction.
- `src/resolve.ts` — assemble + send the 2-ix resolve transaction.
- `src/createMarkets.ts` — fixtures → create_market.
- `src/index.ts` — the loop.

> Blocked on TxODDS API docs/credentials (Telegram). Until then, `src/txodds.ts` runs against a
> recorded-fixtures mock so the rest of the pipeline is testable end-to-end.
