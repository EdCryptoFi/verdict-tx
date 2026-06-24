# Roadmap — 24 Jun → 19 Jul 2026 (~25 days, full-time)

Track: **Prediction Markets & Settlement** ($18k). Model: **pari-mutuel**. Program: **Anchor**.

## Phase 0 · Setup & spikes — days 1–3
- [x] Toolchain (Rust, Solana CLI, Anchor, Node/pnpm) + devnet config
- [x] Monorepo scaffold + docs
- [ ] Anchor workspace + hello program builds on devnet
- [ ] **Spike:** ed25519 verify on-chain via Ed25519Program + instruction introspection (the crux)
- [ ] Get TxODDS API access/docs (Telegram) — *blocking for real data*

## Phase 1 · Core program — days 4–10
- [ ] `Market` / `Position` accounts + PDAs
- [ ] `create_market`
- [ ] `place_bet` (USDC vault, pool accounting)
- [ ] `resolve` with ed25519 signature verification
- [ ] `claim` (pari-mutuel pro-rata payout + protocol fee)
- [ ] Full anchor test suite on devnet

## Phase 2 · Oracle relayer — days 8–13
- [ ] TxODDS ingest (fixtures, live scores, odds)
- [ ] Result signer (ed25519 keypair = market `oracle_pubkey`)
- [ ] Auto-submit 2-ix `resolve` tx on final result
- [ ] Create-market automation from fixtures

## Phase 3 · Frontend MVP — days 11–18
- [ ] Wallet adapter + connect
- [ ] Market list + match view
- [ ] Bet flow + position view + claim
- [ ] Indexer websocket → live odds

## Phase 4 · Differentiators & polish — days 18–22
- [ ] Live Match Pitch (animated pitch UI)
- [ ] Momentum Meter (win-prob curve)
- [ ] Settlement Theater (verification animation + shareable card)
- [ ] Pick'em + leaderboard
- [ ] Deploy (devnet, mainnet-beta if time)

## Phase 5 · Demo & submission — days 22–25
- [ ] Demo video + script
- [ ] README polish + "verifiable settlement" narrative
- [ ] Submission on Superteam Earn

## Decisions locked
- Pari-mutuel (no market maker, fair, robust)
- Anchor (ecosystem standard)
- ed25519 native verification via Ed25519Program (not custom crypto)
- USDC settlement
- Devnet first

## Risks / unknowns
- TxODDS API shape & whether they sign results → confirm on Telegram
- World Cup fixtures live during window → need at least one live match for the demo (else replay recorded data)
