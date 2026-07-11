# TxODDS Integration — how Verdict settles on verifiable data

This is the heart of Verdict and of the **Prediction Markets & Settlement** track: markets resolve
**trustlessly** by verifying TxODDS' own on-chain Merkle-committed World Cup scores. No trusted
admin, no oracle key — Verdict's `resolve` performs a **CPI into TxODDS' `validate_stat`** and only
settles when TxODDS' program itself confirms the proof against its committed root.

Everything below is reproducible against devnet with the scripts in `relayer/`.

---

## 0. Addresses & endpoints (devnet)
| | |
|---|---|
| TxODDS program (`txoracle`) | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` |
| TxL mint (Token-2022) | `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG` |
| Off-chain API server | **`https://txline-dev.txodds.com`** (devnet) · `txline.txodds.com` (mainnet) |
| Verdict program | `Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7` |

We vendored the TxODDS devnet IDL at `deps/txodds-idl.json` and mirror the needed types in
`programs/pitchmarket/src/txodds.rs` for byte-exact Borsh CPI.

---

## 1. Self-serve credentialing (free World Cup tier)
The World Cup tier is **free** (on-chain pricing row `id=1` has `price_per_week_token = 0`) and fully
programmable — no support contact needed. Flow (`relayer/src/txoddsAuth.ts`):

1. `POST {server}/auth/guest/start` → **guest JWT** (30-day).
2. On-chain `subscribe(service_level_id = 1, weeks)` on the TxODDS program.
   Accounts: `user, pricingMatrix (["pricing_matrix"]), tokenMint, userTokenAccount (ATA, Token-2022),
   tokenTreasuryVault (ATA of tokenTreasuryPda), tokenTreasuryPda (["token_treasury_v2"]),
   TOKEN_2022, associatedTokenProgram, systemProgram`.
3. Sign the message `${txSig}:${leagues.join(",")}:${jwt}` (ed25519) → base64 `walletSignature`.
4. `POST {server}/api/token/activate {txSig, walletSignature, leagues}` (Bearer JWT) → **apiToken**.

Data requests then send `Authorization: Bearer <jwt>` + `X-Api-Token: <apiToken>`.

```bash
pnpm --filter @verdict/relayer subscribe    # runs the whole flow, saves creds to relayer/.env
```

**Gotchas we hit (and fixed):**
- Devnet must use the **`txline-dev`** server; using `txline` (mainnet) can't see the devnet subscribe tx.
- `weeks` must be a **multiple of 4** (else `InvalidWeeks 6041`).
- `activate` returns the apiToken as a **plain string**, not JSON.

---

## 2. Data endpoints & the goal stat keys
| Purpose | Endpoint |
|---|---|
| Fixtures | `GET /api/fixtures/snapshot` — PascalCase (`FixtureId`, `Participant1`=home, `Participant2`=away, `Competition`, `CompetitionId=72` for World Cup) |
| Live scores | `GET /api/scores/snapshot/{fixtureId}` — `Score.Participant1/2.Total.Goals`, `Seq`, `Clock` |
| **Score Merkle proof** | `GET /api/scores/stat-validation?fixtureId&seq&statKey&statKey2` |

Discovered empirically from a real match:
- **`statKey = 1` → home goals, `statKey = 2` → away goals, `period = 4` → full-time (Total).**
- `stat-validation` is camelCase; `ProofNode = { hash: number[32], isRightSibling: boolean }`.

```bash
pnpm --filter @verdict/relayer exec tsx src/scripts/verify.ts   # lists WC fixtures + one real proof
```

---

## 3. The settlement CPI (`resolve`)
Verdict's `resolve` (`programs/pitchmarket/src/instructions/resolve.rs`) turns a TxODDS proof into a
trustless market settlement.

**Args:** `winning_outcome, ts, fixture_summary, fixture_proof, main_tree_proof, stat_a, stat_b?`
mapped from the `stat-validation` response (`subTreeProof → fixture_proof`, `mainTreeProof →
main_tree_proof`, the `StatTerm`s from `statToProve`/`statProof`).

**Critical:** the `ts` argument **and** the `daily_scores_roots` PDA seed both use
`summary.updateStats.minTimestamp` (NOT the top-level `ts`), or TxODDS rejects with
`TimestampMismatch 6010`. PDA: `["daily_scores_roots", u16_le(floor(minTimestamp/86_400_000))]`.

**On-chain safety bindings (before the CPI):**
- `txodds_program` address == TxODDS program id.
- `daily_scores_merkle_roots` account **owned by** the TxODDS program (no forged roots).
- `fixture_summary.fixture_id == market.match_id`.
- supplied `stat_a`/`stat_b` keys + period == the market's stored `PredicateSpec[winning_outcome]`.

Then it **CPIs `validate_stat`**, reads the boolean via `get_return_data`, and requires `true`.
→ A relayer can only crank an outcome that is *already true* against TxODDS' committed root.

```
stat-validation (API)  ──►  resolve args  ──CPI──►  TxODDS.validate_stat
                                                     verifies proof vs on-chain Merkle root
                                                     + evaluates predicate → bool (return_data)
```

The market's per-outcome predicate (`PredicateSpec`, stored at creation) encodes the 1X2 rule, e.g.
Home = `(homeGoals − awayGoals) > 0`, Draw `== 0`, Away `< 0` (via TxODDS `TraderPredicate` +
`BinaryExpression::Subtract`).

---

## 4. The golden test — real proof, real program
`relayer/src/scripts/goldenTest.ts` calls the **real** TxODDS `validate_stat` on devnet with a
**real** World Cup proof and confirms the 1X2 predicates:

```
fixture 18192996 seq 770: HOME 2 - 3 AWAY (period 4)
validate_stat (real TxODDS program, real Merkle proof):
  ✅ Home wins → false
  ✅ Draw     → false
  ✅ Away wins → true      # Mexico 2–3 England → England (away) won
```

And the full loop through Verdict's own program (`e2eReal.ts`): create market → bet → `resolve`
(CPI) → claim, settling Mexico 2–3 England on devnet.

```bash
pnpm --filter @verdict/relayer exec tsx src/scripts/goldenTest.ts   # direct validate_stat
pnpm --filter @verdict/relayer exec tsx src/scripts/e2eReal.ts      # market→bet→resolve→claim
```

Notes on the CPI: `validate_stat` is a `view` (returns a bool). Under CPI its result is read via
`solana_program::program::get_return_data`; the simulate-based direct call (goldenTest) needs a
funded fee payer, else `AccountNotFound`.

---

## 5. Local testing without real data
For the test suite we ship `programs/txodds_stub` — a minimal program that implements
`validate_stat` (same instruction discriminator + arg layout) by **evaluating the predicate** against
the supplied stats. It `declare_id!`s the real TxODDS address and is loaded there on the local
validator via `Anchor.toml [[test.genesis]]`, so `resolve`'s CPI works offline.

```bash
bash scripts/test-local.sh    # 5 passing tests (surfpool not required)
```

---

## TL;DR
Verdict doesn't trust an oracle — it **defers to TxODDS' own on-chain verification** and only settles
what TxODDS' program confirms. Proven end-to-end on devnet with a real World Cup match.
