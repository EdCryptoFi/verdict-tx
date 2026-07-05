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

## Phase 3.5 · Live counters — days 14–18 (see DESIGN.md)
- [ ] ⏳ Betting-closes-in countdown (FOMO; turns red < 60s)
- [ ] 💰 Live pool size (count-up on new bets, tabular figures)
- [ ] 👥 Live bettors count (via indexer websocket)
- [ ] ⚽ Match clock + live score (TxODDS SSE)

## Phase 4 · Differentiators & polish — days 18–22 (style: Broadcast Premium + Crypto)
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

---

# UPDATED PLAN — status @ 2026-07-04 (deadline 19 Jul, ~15 days left)

> Phases 0–3.5 above are largely DONE, but settlement PIVOTED from ed25519 to a **CPI into
> TxODDS `validate_stat`** against their on-chain Merkle root (stronger, sponsor-native).

## Done ✅
- Anchor program `pitchmarket` (project renamed **Verdict**): create_market, place_bet,
  resolve (CPI validate_stat), claim, cancel_market, claim_refund. Betting-closed guard;
  no-winner → refund. **5 tests passing** (`bash scripts/test-local.sh`; surfpool not installed).
- Deployed to devnet: program `Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7`; test USDC mint
  `7SHsjDmsmVxHcDrur7VHHSGRzbsE1LCQWQPbFTz21maT`; demo market fixture 900001. Real 25 USDC bet verified on devnet.
- Frontend (Next.js, Broadcast Premium): live counters, indexer WS (mock simulator),
  wallet bet/claim flow (BetBox). shared/relayer/indexer/app typecheck clean.
- Scripts: relayer setup/faucet/create-market/resolve/betTest; deploy-devnet.sh; test-local.sh.

## P0 — Real TxODDS integration (SELF-SERVE, no Telegram) ⭐ critical path
The World Cup tier is programmable AND free (on-chain pricing row_id=1 price/week=**0**), so we
credential ourselves. **NOT STARTED — build when green-lit.**

Concrete devnet addresses:
- TxODDS program `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
- TxL mint (Token-2022) `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG`
- `pricingMatrixPda = findPDA(["pricing_matrix"])` = `B4hHn1FpD1YPPrcM4yUrQhBPF18zFWgijHLTsumGzeKi`
- `tokenTreasuryPda = findPDA(["token_treasury_v2"])`; `tokenTreasuryVault = ATA(txlMint, tokenTreasuryPda)` (Token-2022)
- apiOrigin `https://txline.txodds.com`, apiBaseUrl `https://txline.txodds.com/api`

Steps:
1. **Credential module** (`relayer/src/txoddsAuth.ts` + `scripts/subscribe.ts`):
   - `POST /auth/guest/start` → jwt
   - ensure user TxL ATA (Token-2022; empty is fine since free)
   - `subscribe(service_level_id=1, weeks=N)` on TxODDS program (accounts: user, pricingMatrix,
     tokenMint, userTokenAccount, tokenTreasuryVault, tokenTreasuryPda, TOKEN_2022, ATA prog, system)
   - sign `${txSig}:${leagues.join(",")}:${jwt}` (ed25519 detached, base64)
   - `POST /token/activate {txSig, walletSignature, leagues:[]}` w/ Bearer jwt → **apiToken**
   - persist jwt + apiToken to .env; data calls send `Authorization: Bearer jwt` + `X-Api-Token: apiToken`
2. **Discover endpoints + stat keys**: read `https://txline-docs.txodds.com/api-reference/openapi.json`
   for fixtures/scores paths; empirically find the goal stat keys (home/away) + full-time period
   from a finished World Cup match's score snapshot.
3. **Wire real data**: relayer real `getFixtures`; indexer real scores/odds (SSE) → replace mock simulator.
4. **⭐ Golden test**: resolve a market with a REAL `/api/scores/stat-validation` proof via CPI into
   the REAL TxODDS `validate_stat` on devnet (confirm return_data-over-CPI works; fix account/units if not).
   This is the make-or-break proof for the $18k track.

## P1 — Close the loop & demo
- End-to-end on devnet with a real finished match: create market → bet → real resolve → claim.
- Resolve/claim visible in UI; relayer auto-resolve at full-time.

## P2 — Visual impact (for the video)
- Market-detail page: **Live Match Pitch** (animated) + **Settlement Theater** (on-chain verify animation).
- Momentum Meter on real odds. Optional Pick'em/leaderboard.

## P3 — Package the submission
- 2–3 min demo video; README/submission polish (verifiable-settlement narrative + devnet addresses);
  submit on Superteam Earn before 19 Jul.

## Minor tech debt (non-blocking)
- `withdraw_fees`; Anchor events (Bet/Resolved) for the indexer; close Position/Market for rent;
  update README top (still says "ed25519" — now CPI).
