# Architecture — PitchMarket

## Goal
World Cup prediction markets on Solana with **verifiable settlement**: markets resolve only
against a TxODDS-signed result whose ed25519 signature is verified **on-chain**.

## High-level flow

```
TxODDS Live API ──► Oracle Relayer ──► Solana Program ◄── Frontend (wallet)
  odds + scores       (Node/TS)          (Anchor)          (Next.js)
                         │                   ▲                 │
                         │ sign result       │ verify sig      │ bet / claim
                         └── ed25519 ─────────┘                 │
                                                                ▼
                                  Indexer (odds cache + live websocket)
```

## On-chain program (Anchor)

### Accounts (PDAs)
- **Market** — `seeds = ["market", match_id, market_kind]`
  - `match_id: u64`, `kind: MarketKind` (e.g. MatchResult, NextGoal)
  - `outcomes: u8` (e.g. 3 = Home/Draw/Away)
  - `pool_per_outcome: [u64; N]`, `total_pool: u64`
  - `betting_close_ts: i64`, `status: Open | Locked | Resolved`
  - `winning_outcome: Option<u8>`
  - `oracle_pubkey: Pubkey` (the TxODDS signer authorized for this market)
  - `vault: Pubkey` (USDC token account owned by a PDA)
  - `predicates: [PredicateSpec; N]` — per-outcome rule that decides the winner against TxODDS data
- **Position** — `seeds = ["position", market, bettor]`
  - `stake_per_outcome: [u64; N]`, `claimed: bool`

### Instructions
1. **`create_market`** — relayer/admin creates a market for a fixture, storing `num_outcomes`, `betting_close_ts`, and a `PredicateSpec` per outcome.
2. **`place_bet`** — bettor deposits USDC into the market vault for a chosen outcome; updates `pool_per_outcome` and their `Position`. Only while `Open` and before `betting_close_ts`.
3. **`resolve`** — **the key instruction.** Takes `winning_outcome` + the TxODDS score proof material (`ts`, `fixture_summary`, `fixture_proof`, `main_tree_proof`, `stat_a`, `stat_b?`).
   - Binds `fixture_summary.fixture_id == market.match_id` and the supplied stats to the stored `PredicateSpec[winning_outcome]`.
   - **CPIs into TxODDS `validate_stat`** with that predicate; requires the returned bool == true.
   - Only then sets `status = Resolved`, `winning_outcome`.
4. **`claim`** — winners withdraw their pro-rata share of `total_pool` from the vault: `payout = stake_on_winner / pool_per_outcome[winner] * total_pool` minus protocol fee. Marks `Position.claimed`.

### PredicateSpec (how an outcome is decided)
`{ stat_a_key, stat_b_key, period, use_stat_b, op (0=Add,1=Subtract), threshold, comparison (0=GT,1=LT,2=EQ) }`.
1X2 full-time (stat_a = home goals, stat_b = away goals, op = Subtract, threshold 0):
Home = GreaterThan, Draw = EqualTo, Away = LessThan. Stored at creation so the relayer can only
settle to an outcome whose predicate genuinely holds against the verified score.

### Pari-mutuel math
- All bets across outcomes go into one pool.
- Winners split the **whole** pool proportionally to their stake on the winning outcome.
- Protocol fee (1%, `PROTOCOL_FEE_BPS`) skimmed at claim → sustainability story for judges.
- No market maker / no liquidity needed → robust, simple, fair. Ideal for a hackathon MVP.

## Verifiable settlement (the differentiator)
We do **not** trust an oracle key and do **not** reimplement Merkle hashing. `resolve` performs a
**CPI into the TxODDS `txoracle` program's `validate_stat`** instruction, which verifies the score
statistic against TxODDS' own on-chain-committed Merkle root (`daily_scores_merkle_roots` PDA) and
evaluates our predicate, returning a bool we read via `get_return_data`.

Safety bindings in `resolve`:
- `txodds_program` address must equal the TxODDS program id.
- `daily_scores_merkle_roots` must be **owned by** the TxODDS program (no forged roots account).
- `fixture_summary.fixture_id` must equal the market's fixture.
- supplied `stat_a`/`stat_b` keys + period must match the stored `PredicateSpec`.
→ The only thing a relayer controls is *which* (already-true) outcome to crank. Trustless settlement,
secured by the sponsor's own cryptographic commitment. (TxODDS devnet program: `6pW64g…wyP2J`.)

## Oracle relayer (Node/TS)
- Polls/streams TxODDS for match state (SSE for live, REST for snapshots).
- On final result, calls `GET /api/scores/stat-validation` to get the three-stage Merkle proof,
  maps `subTreeProof → fixture_proof`, `mainTreeProof → main_tree_proof`, builds the `StatTerm`s,
  and submits `resolve(winning_outcome, …)` (with a ComputeBudget bump for the Merkle verification).
- Holds no settlement authority — anyone could crank `resolve`; correctness is enforced on-chain.

## Indexer (Node/TS)
- Mirrors TxODDS odds/scores to a fast store + websocket for the frontend (live odds, momentum).
- Decouples the UI from TxODDS rate limits and gives us the data for the Momentum Meter.

## Frontend (Next.js)
- **Live Match Pitch** — animated pitch; markets float over it; reacts to live events.
- **Momentum Meter** — win-probability curve from live odds.
- **Bet / Position / Claim** flows via wallet adapter.
- **Settlement Theater** — animated on-chain verification moment + shareable "Verified on-chain" card.
- **Pick'em** — free predictions, streaks, leaderboard (onboarding funnel; no wallet required to start).

## Open questions / to confirm with TxODDS
- Exact `validate_stat` behavior under CPI (return_data of a `view` ix) — validate on devnet.
- The TxODDS stat keys/period for World Cup goals (to fill `PredicateSpec`).
- `daily_scores_merkle_roots` PDA derivation/`ts` units (s vs ms) for the relayer.
- Rate limits; available World Cup fixtures during the hackathon window for a live demo.
