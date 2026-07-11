# Verdict — Verifiable World Cup Prediction Markets on Solana

> **TxODDS World Cup Hackathon** · Track: **Prediction Markets & Settlement** ($18k)
> Live demo: **https://verdict-tx.vercel.app** · Program (devnet): `Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7`

Pari-mutuel prediction markets on World Cup matches where **settlement is trustless and
cryptographically verifiable**. Verdict resolves each market by **CPI into TxODDS' own on-chain
program (`validate_stat`)**, which verifies the final score against TxODDS' Merkle root committed
on-chain. **No trusted admin. No oracle key.** The only thing anyone can do is crank a settlement
that is *already true* against the sponsor's own cryptographic commitment.

## Why this wins the track
The track asks for *"resolution and settlement built on verifiable World Cup data … on-chain proof
integrations."* Most entries will settle with an admin button or a trusted signer. Verdict settles
by **using TxODDS' own on-chain verification primitive directly** — proven end-to-end on devnet with
a real match (Mexico 2–3 England).

| Requirement | Verdict |
|---|---|
| Outcome markets | 1X2 pari-mutuel markets in USDC |
| Resolution | `resolve` binds a per-outcome predicate to the fixture + stats |
| Settlement on verifiable data | **CPI → TxODDS `validate_stat`** against their on-chain Merkle root |
| On-chain proof integration | Reads TxODDS' `daily_scores_merkle_roots` PDA; no re-implemented crypto |

## How settlement works
```
TxODDS live score ──► Merkle root committed on-chain by TxODDS
                                   │
Verdict.resolve(winning_outcome, proof) ──CPI──► TxODDS.validate_stat
   • asserts txodds_program id + roots-account owner                │ verifies proof vs root
   • binds fixture_id + stat keys/period to the stored predicate    │ evaluates predicate
   • requires the returned bool == true  ◄─── get_return_data ──────┘
   → market Resolved; winners split the pool pro-rata (1% fee)
```

## Program instructions (Anchor)
`create_market` · `place_bet` · `resolve` (CPI verify) · `claim` · `cancel_market` · `claim_refund`

Safety: betting-closed guard on resolve (can't settle on a live in-play score); refund path if a
match is cancelled or nobody staked the winning outcome; checked math throughout; vault owned by
the market PDA. **5 passing end-to-end tests** (pro-rata split, loser/double-claim rejection, draw,
false-outcome rejection, cancel→refund, no-winner→refund).

## Monorepo
| Dir | What |
|---|---|
| `programs/pitchmarket` | The Anchor program (settlement via CPI into TxODDS) |
| `programs/txodds_stub` | Local-test stub of TxODDS `validate_stat` (loaded at the real address for tests) |
| `app` | Next.js frontend (static export) — markets, bet/claim, Match Details + Settlement Theater, Portfolio, Leaderboard, landing |
| `relayer` | TxODDS API client + self-serve credentialing + create/resolve builders + scripts |
| `indexer` | WebSocket live feed (mock simulator; real TxODDS SSE hooks) |
| `shared` | Program IDL/types, 1X2 predicate + PDA + proof-mapping helpers |
| `deps` | Vendored TxODDS devnet IDL + API reference |

## Live on devnet
- Program: `Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7`
- Test USDC mint: `7SHsjDmsmVxHcDrur7VHHSGRzbsE1LCQWQPbFTz21maT` (6 decimals)
- Open market to bet: fixture **18198205** (Portugal v Spain). Settled example: fixture 18192996.
- Wallets: Phantom, Solflare, OKX + any Wallet-Standard wallet.

## Run it
```bash
pnpm install
anchor build                    # build the program
bash scripts/test-local.sh      # 5-test suite on a local validator (surfpool not required)
pnpm --filter @verdict/app dev  # frontend at http://localhost:3000

# Real TxODDS integration (self-serve, free World Cup tier — no support needed):
pnpm --filter @verdict/relayer subscribe     # guest JWT → on-chain subscribe → apiToken (relayer/.env)
pnpm --filter @verdict/relayer exec tsx src/scripts/verify.ts    # health-check markets + TxODDS
pnpm --filter @verdict/relayer exec tsx src/scripts/goldenTest.ts # verify a real proof vs real TxODDS validate_stat
```

## Security
- No secrets committed: `relayer/.env` (TxODDS JWT/apiToken) and `app/.env.local` are gitignored;
  only public devnet config is baked into the frontend build.
- On-chain: TxODDS program id + roots-account ownership are asserted before the CPI, so a caller
  can't substitute a forged roots account or fake the winning outcome.

Design notes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/DESIGN.md](docs/DESIGN.md) · [docs/ROADMAP.md](docs/ROADMAP.md)

🤖 Built with [Claude Code](https://claude.com/claude-code)
