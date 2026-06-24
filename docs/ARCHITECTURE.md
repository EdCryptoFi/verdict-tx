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
- **Position** — `seeds = ["position", market, bettor]`
  - `amount_per_outcome: [u64; N]`, `claimed: bool`

### Instructions
1. **`create_market`** — admin/relayer creates a market for a match (sets outcomes, close time, authorized `oracle_pubkey`).
2. **`place_bet`** — bettor deposits USDC into the market vault for a chosen outcome; updates `pool_per_outcome` and their `Position`. Only while `Open` and before `betting_close_ts`.
3. **`resolve`** — **the key instruction.** Takes the winning outcome + TxODDS signature.
   - Reads the **Ed25519 sysvar / instruction introspection** to confirm an `Ed25519Program` verify instruction in the same transaction signed `message = (match_id, market_kind, winning_outcome)` with `oracle_pubkey`.
   - Only then sets `status = Resolved`, `winning_outcome`.
4. **`claim`** — winners withdraw their pro-rata share of `total_pool` from the vault: `payout = stake_on_winner / pool_per_outcome[winner] * total_pool`. Marks `Position.claimed`.

### Pari-mutuel math
- All bets across outcomes go into one pool.
- Winners split the **whole** pool proportionally to their stake on the winning outcome.
- Optional protocol fee (e.g. 1–2%) skimmed at claim → sustainability story for judges.
- No market maker / no liquidity needed → robust, simple, fair. Ideal for a hackathon MVP.

## Verifiable settlement (the differentiator)
The Ed25519 signature is **not** verified by custom Rust crypto. Instead we use Solana's native
`Ed25519Program`: the relayer builds a transaction with two instructions —
1. an `Ed25519Program` instruction carrying `(pubkey, message, signature)`, and
2. our `resolve` instruction.

`resolve` uses **instruction introspection** (`sysvar::instructions`) to assert that ix #0 is a
genuine Ed25519 verify of the expected `oracle_pubkey` over the expected message. If the signature
is invalid, the Ed25519Program instruction fails and the whole tx reverts. → trustless settlement.

## Oracle relayer (Node/TS)
- Polls/streams TxODDS for match state.
- On final result (or interval-market settlement point), builds `message = borsh(match_id, kind, outcome)`,
  signs with the TxODDS oracle keypair (ed25519), and submits the 2-ix `resolve` transaction.
- Holds the oracle signing key; the *authority* to resolve is bound to `oracle_pubkey` on each market.

## Indexer (Node/TS)
- Mirrors TxODDS odds/scores to a fast store + websocket for the frontend (live odds, momentum).
- Decouples the UI from TxODDS rate limits and gives us the data for the Momentum Meter.

## Frontend (Next.js)
- **Live Match Pitch** — animated pitch; markets float over it; reacts to live events.
- **Momentum Meter** — win-probability curve from live odds.
- **Bet / Position / Claim** flows via wallet adapter.
- **Settlement Theater** — animated on-chain verification moment + shareable "Verified on-chain" card.
- **Pick'em** — free predictions, streaks, leaderboard (onboarding funnel; no wallet required to start).

## Open questions / to confirm with TxODDS (Telegram)
- API auth + rate limits + endpoints (odds, live scores, fixtures, final results).
- Does TxODDS provide signed results, or do we run the signer ourselves over their data?
- Available World Cup fixtures during the hackathon window for live demo.
