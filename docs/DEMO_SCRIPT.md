# Verdict — roteiro do vídeo demo

Alvo: **2:30**. Track: *Prediction Markets and Settlement* ($18k).
Regra que guia tudo: **cada afirmação do vídeo é verificável ao vivo na tela.**

Voz em **inglês** (o julgamento é em inglês); o português ao lado é só pra você ler natural.

---

## 1. O que o hackathon pede → o que temos

O track pede: *"Markets, resolution & settlement on verifiable World Cup data: outcome markets, oracle tooling, on-chain proof integrations."*

| O que pedem | O que o Verdict entrega | Shot |
|---|---|---|
| **Outcome markets** | Mercados 1X2 pari-mutuel; pools e odds derivados do estado on-chain | 4–6, 9 |
| **Resolution & settlement em dado verificável** | `resolve` faz **CPI no `validate_stat` da TxODDS**, que valida a prova Merkle contra a raiz que a TxODDS publica on-chain | 11–15 |
| **On-chain proof integration** | Prova Merkle de 3 estágios (statProof → subTree → mainTree) de `/api/scores/stat-validation` | 13, 15 |
| **Oracle tooling** | **Zero chave de oráculo.** O `PredicateSpec` de cada outcome é gravado na criação → nem nós liquidamos um resultado falso | 16–17 |
| Dado real de World Cup | Fixtures/placares reais; `sync:daily` cria e liquida mercados sozinho, sem servidor | 18 |

**A tese, numa frase:** todo mercado de previsão morre no mesmo ponto — *quem decide o resultado?* No Verdict, ninguém decide. **A liquidação é uma prova.**

---

## 2. Roteiro detalhado — shot a shot

> **TELA** = o que você faz/mostra · **LEGENDA** = texto sobreposto na tela · **VOZ** = o que você fala.

---

### BLOCO 1 — O problema · 0:00–0:20

**▸ SHOT 1 — 0:00–0:06**
- **TELA:** `/welcome`. Hero parado, zoom lento (Ken Burns) no título VERDICT.
- **LEGENDA:** `Prediction markets don't fail at betting.`
- **VOZ:** *"Every prediction market answers the same question at the end: who decides the result?"*
  <br>↳ *(Todo mercado de previsão responde a mesma pergunta no final: quem decide o resultado?)*

**▸ SHOT 2 — 0:06–0:13**
- **TELA:** ainda em `/welcome`, scroll lento revelando "Predict the game. Own the outcome."
- **LEGENDA:** `They fail at settlement.`
- **VOZ:** *"Almost always, an oracle you're asked to trust. A multisig. A committee."*
  <br>↳ *(Quase sempre um oráculo em quem te pedem pra confiar. Um multisig. Um comitê.)*

**▸ SHOT 3 — 0:13–0:20**
- **TELA:** clique em **"Browse markets"** → transição pra `/`.
- **LEGENDA:** `Verdict: settled by proof, not by trust.`
- **VOZ:** *"Verdict removes trust from that question entirely."*
  <br>↳ *(O Verdict tira a confiança dessa pergunta por completo.)*

---

### BLOCO 2 — Os mercados · 0:20–0:45

**▸ SHOT 4 — 0:20–0:28**
- **TELA:** `/`, o grid de mercados carregando. Câmera parada.
- **LEGENDA:** `Pari-mutuel 1X2 · FIFA World Cup`
- **VOZ:** *"These are pari-mutuel World Cup markets. Home, draw, away."*
  <br>↳ *(Mercados pari-mutuel de Copa do Mundo. Casa, empate, fora.)*

**▸ SHOT 5 — 0:28–0:37**
- **TELA:** hover num card **com pool > 0**. Zoom no rodapé: **`Tournament Pool · on-chain`**, o valor em USDC e os *Predictors*.
- **LEGENDA:** `Pool, predictors, odds — read live from Solana devnet`
- **VOZ:** *"And these numbers are not a mock-up. The pool, the predictors, the odds — the frontend reads them straight from the market accounts on Solana devnet."*
  <br>↳ *(E esses números não são mock. O pool, os apostadores, as odds — o front lê direto das contas do mercado na devnet.)*

**▸ SHOT 6 — 0:37–0:45**
- **TELA:** zoom nas três odds do BetBox (ex.: `3.00x` / `—` / `1.50x`).
- **LEGENDA:** `No bookmaker. The odds ARE the split of the pool.`
- **VOZ:** *"In pari-mutuel there's no bookmaker setting a line. The odds are the split of the pool."*
  <br>↳ *(Em pari-mutuel não existe casa definindo a linha. A odd É a divisão do pool.)*

---

### BLOCO 3 — A aposta real · 0:45–1:10

**▸ SHOT 7 — 0:45–0:52**
- **TELA:** `/match?id=…` → clique **Connect Wallet** → popup da Phantom → conectado (endereço aparece).
- **LEGENDA:** `Connect · Solana devnet`
- **VOZ:** *"So let me actually bet."*
  <br>↳ *(Então deixa eu apostar de verdade.)*

**▸ SHOT 8 — 0:52–1:00**
- **TELA:** selecione um outcome → digite `25` → clique **Place bet** → **popup da Phantom pedindo aprovação** (segure 1s aqui, é a prova de que é real).
- **LEGENDA:** `Real transaction — not a simulation`
- **VOZ:** *"This is a real transaction on devnet. Not a simulation."*
  <br>↳ *(É uma transação real na devnet. Não é simulação.)*

**▸ SHOT 9 — 1:00–1:10** ⭐
- **TELA:** confirma → aparece `✅ bet placed · <assinatura>` → **as odds mudam na tela**. Zoom nelas.
- **LEGENDA:** `Stake enters the pool → every payout multiple moves`
- **VOZ:** *"Watch the odds. My stake goes into the pool, and the payout multiple on every outcome moves — because the payout is just the total pool divided by what's sitting on that side."*
  <br>↳ *(Olha as odds. Minha aposta entra no pool e o múltiplo de todo resultado se mexe — porque o pagamento é só o pool total dividido pelo que está naquele lado.)*

---

### BLOCO 4 — A liquidação (o clímax) · 1:10–1:50

**▸ SHOT 10 — 1:10–1:17**
- **TELA:** navegue pra `/match?id=18192996`. Hero do placar: **2 — 3**, badge `FULL TIME`.
- **LEGENDA:** `Mexico 2 – 3 England · finished`
- **VOZ:** *"Now the part that matters. This match is finished. Mexico two, England three."*
  <br>↳ *(Agora a parte que importa. Essa partida acabou. México 2, Inglaterra 3.)*

**▸ SHOT 11 — 1:17–1:23**
- **TELA:** **Settlement Theater** — passo ① acende.
- **LEGENDA:** `① TxODDS live score — scout-verified`
- **VOZ:** *"TxODDS scouts the score."*
  <br>↳ *(A TxODDS apura o placar.)*

**▸ SHOT 12 — 1:23–1:30**
- **TELA:** passo ② acende.
- **LEGENDA:** `② Merkle proof — committed to TxODDS' on-chain root`
- **VOZ:** *"And commits it to a Merkle root, on-chain."*
  <br>↳ *(E o compromete numa raiz Merkle, on-chain.)*

**▸ SHOT 13 — 1:30–1:41** ⭐⭐ **FALE DEVAGAR**
- **TELA:** passo ③ acende — `validate_stat (CPI)`. Segure o enquadramento aqui.
- **LEGENDA:** `③ validate_stat (CPI) — Verdict verifies the proof against THEIR root`
- **VOZ:** *"When Verdict settles, it does not trust me, and it does not trust a relayer. It makes a cross-program invocation into TxODDS' own validate_stat, which verifies the Merkle proof against their root."*
  <br>↳ *(Quando o Verdict liquida, ele não confia em mim nem num relayer. Ele faz um CPI no próprio `validate_stat` da TxODDS, que verifica a prova Merkle contra a raiz DELES.)*

**▸ SHOT 14 — 1:41–1:46** ⭐⭐
- **TELA:** passo ④ + o outcome vencedor destacado (`Verified winning outcome`, AWAY 🏆).
- **LEGENDA:** `④ Verified winning outcome — AWAY`
- **VOZ:** *"The winning outcome comes from the sponsor's on-chain commitment — not from my server."*
  <br>↳ *(O resultado vencedor vem do compromisso on-chain do patrocinador — não do meu servidor.)*

**▸ SHOT 15 — 1:46–1:50**
- **TELA:** clique na tx de liquidação → **Solana Explorer** → destaque a **inner instruction** apontando pro programa da TxODDS (`6pW64g…yP2J`).
- **LEGENDA:** `Inner instruction → TxODDS program 6pW64g…yP2J`
- **VOZ:** *"There's the transaction. That inner instruction is the call into the TxODDS program."*
  <br>↳ *(Aí está a transação. Essa inner instruction é a chamada pro programa da TxODDS.)*

---

### BLOCO 5 — Não dá pra trapacear · 1:50–2:10

**▸ SHOT 16 — 1:50–1:58**
- **TELA:** terminal em tela cheia (fonte grande). Rode `bash scripts/test-local.sh`. Testes rolando.
- **LEGENDA:** `But can I cheat?`
- **VOZ:** *"But can I cheat? Let's try. Every market stores the predicate for each outcome at creation time."*
  <br>↳ *(Mas dá pra eu trapacear? Vamos tentar. Cada mercado guarda o predicado de cada resultado no momento da criação.)*

**▸ SHOT 17 — 1:58–2:10** ⭐⭐⭐ **O BEAT MAIS FORTE. FALE DEVAGAR.**
- **TELA:** zoom/destaque na linha `✔ rejects a false outcome (predicate does not hold)`.
- **LEGENDA:** `Settling a false outcome → reverts: OracleValidationFailed`
- **VOZ:** *"Here I try to settle a false outcome — a result that didn't happen. validate_stat returns false, and the transaction reverts. Not even the admin can lie about the score."*
  <br>↳ *(Aqui eu tento liquidar um resultado falso — que não aconteceu. O `validate_stat` retorna falso e a transação reverte. Nem o admin consegue mentir sobre o placar.)*

---

### BLOCO 6 — Roda sozinho · 2:10–2:30

**▸ SHOT 18 — 2:10–2:22**
- **TELA:** terminal → `pnpm sync:daily`. Mostre a saída (fixtures encontrados, mercados criados/liquidados).
- **LEGENDA:** `Live TxODDS fixtures → markets created & settled. No server.`
- **VOZ:** *"And it runs itself. One routine pulls the live TxODDS fixtures, creates the markets, and settles the ones that finished. No oracle key. No trusted server. No me in the middle."*
  <br>↳ *(E roda sozinho. Uma rotina puxa os jogos reais da TxODDS, cria os mercados e liquida os que terminaram. Sem chave de oráculo, sem servidor confiável, sem eu no meio.)*

**▸ SHOT 19 — 2:22–2:30 · cartela final**
- **TELA:**
  ```
  VERDICT
  Pari-mutuel World Cup markets.
  Settled by proof, not by trust.

  github.com/EdCryptoFi/verdict-tx
  verdict-tx.vercel.app
  Solana devnet · Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7
  ```
- **LEGENDA:** *(a própria cartela)*
- **VOZ:** *"Verdict — the verdict of the match, proved on-chain."*
  <br>↳ *(Verdict — o veredito da partida, provado on-chain.)*

---

## 3. O que NÃO mostrar

- **`/leaderboard`** — os dados são um array hardcoded (`const SEED` em `app/src/app/leaderboard/page.tsx`). Se o juiz clicar ali, o mock contamina a credibilidade de tudo que é real. Tire do nav antes de gravar, ou não navegue pra lá.
- **Mercados com pool zero** — as odds aparecem como `—` (correto em pari-mutuel: sem dinheiro num lado, o múltiplo é indefinido). Verdadeiro, mas não vende. Use um mercado com pool.
- O site hospedado **não tem as creds da TxODDS** nas env vars, então serve os fixtures seed. Se quiser os jogos ao vivo reais na tela, grave com `pnpm indexer:dev` rodando local.

---

## 4. Checklist antes de gravar

- [ ] `pnpm sync:daily` — garante os mercados criados
- [ ] Carteira com SOL de devnet + USDC de teste (`pnpm --filter @verdict/relayer faucet <addr> <amount>`)
- [ ] **Um mercado com pool > 0** (aposte antes, pra ter odd de verdade no shot 6)
- [ ] `bash scripts/test-local.sh` roda limpo (5/5) — você vai rodar ao vivo no shot 16
- [ ] Terminal com fonte grande (a assinatura da tx precisa ser legível)
- [ ] Gravar em 1920×1080
