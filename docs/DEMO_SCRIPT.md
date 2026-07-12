# Verdict — roteiro do vídeo demo

Alvo: **2:30**. Track: *Prediction Markets and Settlement* ($18k).
Regra que guia tudo: **cada afirmação do vídeo tem que ser verificável ao vivo na tela.**

---

## 1. O que o hackathon pede → o que temos

O track pede: *"Markets, resolution & settlement on verifiable World Cup data: outcome markets, oracle tooling, on-chain proof integrations."*

| O que pedem | O que o Verdict entrega | Onde aparece no vídeo |
|---|---|---|
| **Outcome markets** | Mercados 1X2 pari-mutuel (Home/Draw/Away), pools e odds derivados do estado on-chain | Beat 2 (grid) e 3 (aposta move a odd) |
| **Resolution & settlement em dado verificável** | `resolve` faz **CPI no `validate_stat` da própria TxODDS**, que valida a prova Merkle contra a raiz que a TxODDS publica on-chain | Beat 4 (Settlement Theater + tx) |
| **On-chain proof integration** | Prova Merkle de 3 estágios (statProof → subTree → mainTree) vinda de `/api/scores/stat-validation` | Beat 4 |
| **Oracle tooling** | **Zero chave de oráculo.** Cada mercado guarda o `PredicateSpec` por outcome, então nem nós conseguimos liquidar um resultado falso | Beat 5 (o teste negativo) |
| Dado real de World Cup | Fixtures e placares reais da TxODDS; rotina `sync:daily` cria e resolve mercados sozinha, sem servidor | Beat 6 |

**O ângulo do pitch:** todo mercado de previsão morre no mesmo ponto — *quem decide o resultado?* Quase sempre um oráculo confiável ou um multisig. No Verdict, ninguém decide. A liquidação é uma prova.

---

## 2. Sequência de telas + legendas

> Legendas = o que aparece na tela (texto curto). Narração = o que você fala.
> Grave a tela em 1920×1080. Terminal com fonte grande (a `tx` precisa ser legível).

### Beat 1 — O problema (0:00–0:20)
- **Tela:** `/welcome` — hero "Predict the game. Own the outcome."
- **Legenda:** `Prediction markets don't fail at betting. They fail at settlement.`
- **Narração:** "Todo mercado de previsão resolve a mesma pergunta no final: quem decide o resultado? Normalmente, um oráculo em quem você tem que confiar. O Verdict tira a confiança da equação."

### Beat 2 — Os mercados (0:20–0:45)
- **Tela:** `/` — grid de mercados. Passe o mouse num card mostrando a tag **"· on-chain"** e o *Tournament Pool*.
- **Legenda:** `Pari-mutuel 1X2 · pools and odds read straight from Solana`
- **Narração:** "Mercados 1X2 pari-mutuel de Copa do Mundo. Esses pools, apostadores e odds não são mockados — vêm direto das contas do programa na devnet."
- ⚠️ Mostre um mercado que tenha pool > 0. Um mercado zerado mostra "—" nas odds (correto, mas não vende).

### Beat 3 — A aposta real (0:45–1:10)
- **Tela:** `/match?id=…` → conecte a carteira → aposte → **aprove na Phantom**.
- **Legenda:** `Real bet, real devnet transaction — odds move with the pool`
- **Narração:** "Aposto de verdade. É uma transação na devnet. E repare: a odd se mexe, porque em pari-mutuel a odd *é* a divisão do pool — pagamento igual pool total dividido pelo que está naquele lado."
- 🎯 **O momento visual:** a odd mudando depois da aposta. Espere o refresh (é rápido).

### Beat 4 — O clímax: a liquidação (1:10–1:50)
- **Tela:** `/match?id=18192996` (Mexico 2–3 England, já liquidado) → **Settlement Theater** toca os 4 passos.
- **Legendas** (uma por passo, acompanhando a animação):
  1. `TxODDS live score — scout-verified goals`
  2. `Merkle proof — score committed to TxODDS' on-chain root`
  3. `validate_stat (CPI) — Verdict verifies the proof against that root`
  4. `Verified winning outcome — settled on-chain`
- **Tela:** clique na tx → **Solana Explorer**, mostre o CPI para o programa da TxODDS.
- **Narração:** "Aqui está o coração. Nosso `resolve` não confia em nós. Ele faz um CPI para o `validate_stat` da própria TxODDS, que verifica a prova Merkle contra a raiz que a TxODDS publica on-chain. O resultado vem da raiz do patrocinador — não de mim."

### Beat 5 — A prova de que não dá pra trapacear (1:50–2:10)
- **Tela:** terminal, rode a suíte: `bash scripts/test-local.sh`
- **Foque no teste:** `✔ rejects a false outcome (predicate does not hold)`
- **Legenda:** `We tried to settle a false outcome. The chain rejected it.`
- **Narração:** "E se eu tentar liquidar um resultado falso? Cada mercado guarda o predicado de cada outcome no momento da criação. O `validate_stat` retorna falso e a transação reverte com `OracleValidationFailed`. Nem o admin consegue mentir."
- 🎯 **É o beat mais forte do vídeo.** Não corte.

### Beat 6 — Roda sozinho (2:10–2:30)
- **Tela:** terminal → `pnpm sync:daily`
- **Legenda:** `Live TxODDS fixtures → markets created and settled automatically. No server.`
- **Narração:** "Uma rotina puxa os jogos reais da TxODDS, cria os mercados e liquida os que terminaram — sem servidor, sem oráculo, sem eu no meio."
- **Fecha em:** logo + `github.com/EdCryptoFi/verdict-tx` + a URL do app.

---

## 3. O que NÃO mostrar

- **`/leaderboard`** — os dados são um array hardcoded (`const SEED`). Se um juiz clicar durante o vídeo, contamina a credibilidade de tudo que é real. Ou você tira do nav antes de gravar, ou simplesmente não navega pra lá.
- Mercados com pool zero (odds aparecem como "—").
- O site hospedado não tem as credenciais TxODDS nas env vars, então serve os fixtures seed. **Grave com o indexer local rodando** (`pnpm indexer:dev`) se quiser os jogos ao vivo de verdade na tela.

---

## 4. Narração — palavra por palavra

Inglês (o que você grava) com o português ao lado (pra você ler natural). ~370 palavras ≈ 2:30 num
ritmo calmo. **Fale devagar nos beats 4 e 5** — é onde está o argumento.

---

**[0:00 · `/welcome`, hero]**

> "Every prediction market answers the same question at the end: **who decides the result?**
> Almost always, an oracle you're asked to trust. A multisig. A committee.
> Prediction markets don't fail at betting. They fail at settlement.
> Verdict removes trust from that question entirely."

*(Todo mercado de previsão responde a mesma pergunta no final: quem decide o resultado? Quase sempre um oráculo em quem te pedem pra confiar. Mercados de previsão não falham na aposta — falham na liquidação. O Verdict tira a confiança dessa pergunta.)*

---

**[0:20 · `/`, grid de mercados — passe o mouse num card]**

> "These are pari-mutuel World Cup markets. Home, Draw, Away.
> And these numbers are not a mock-up. The pool, the predictors, the odds —
> the frontend reads them straight from the market accounts on Solana devnet.
> In pari-mutuel there's no bookmaker setting a line. The odds **are** the split of the pool."

*(Mercados pari-mutuel de Copa. E esses números não são mock: o front lê direto das contas na devnet. Em pari-mutuel não existe casa definindo a linha — a odd É a divisão do pool.)*

---

**[0:45 · `/match`, conectar carteira → apostar → aprovar na Phantom]**

> "So let me actually bet. This is a real transaction on devnet.
> Watch the odds. My stake goes into the pool, and the payout multiple on every outcome moves —
> because the payout is just the total pool divided by what's sitting on that side."

*(Deixa eu apostar de verdade. Transação real na devnet. Olha as odds: minha aposta entra no pool e o múltiplo de todos os resultados se mexe — porque o pagamento é o pool total dividido pelo que está naquele lado.)*

---

**[1:10 · `/match?id=18192996` — Settlement Theater roda os 4 passos]**

> "Now the part that matters. This match is finished — Mexico two, England three.
> TxODDS commits that score to a Merkle root **on-chain**.
> When Verdict settles, it does **not** trust me, and it does not trust a relayer.
> It makes a cross-program invocation into TxODDS' own `validate_stat`,
> which verifies the Merkle proof against **their** root.
> The winning outcome comes from the sponsor's on-chain commitment — not from my server."

**[clique na tx → Solana Explorer, mostre o CPI]**

> "There's the transaction. That inner instruction is the call into the TxODDS program."

*(Agora a parte que importa. Jogo terminado, México 2 Inglaterra 3. A TxODDS publica esse placar numa raiz Merkle on-chain. Na liquidação, o Verdict não confia em mim nem num relayer: ele faz um CPI no `validate_stat` da própria TxODDS, que verifica a prova contra a raiz DELES. O resultado vem do compromisso on-chain do patrocinador — não do meu servidor.)*

---

**[1:50 · terminal — `bash scripts/test-local.sh`, destaque no teste negativo]**

> "But can I cheat? Let's try. Every market stores the predicate for each outcome
> at creation time. So here I try to settle a **false** outcome — a result that didn't happen.
> `validate_stat` returns false, and the transaction reverts. `OracleValidationFailed`.
> Not even the admin can lie about the score."

*(Mas dá pra trapacear? Vamos tentar. Cada mercado guarda o predicado de cada resultado na criação. Aqui eu tento liquidar um resultado falso — que não aconteceu. O `validate_stat` retorna falso e a transação reverte. Nem o admin consegue mentir sobre o placar.)*

---

**[2:10 · terminal — `pnpm sync:daily` → fecha no logo + links]**

> "And it runs itself. One routine pulls the live TxODDS fixtures,
> creates the markets, and settles the ones that finished.
> No oracle key. No trusted server. No me in the middle.
> Verdict — the verdict of the match, proved on-chain."

*(E roda sozinho. Uma rotina puxa os jogos reais da TxODDS, cria os mercados e liquida os que terminaram. Sem chave de oráculo, sem servidor confiável, sem eu no meio. Verdict — o veredito da partida, provado on-chain.)*

---

**Cartela final (3s):**
```
VERDICT
Pari-mutuel World Cup markets. Settled by proof, not by trust.

github.com/EdCryptoFi/verdict-tx
verdict-tx.vercel.app
Solana devnet · Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7
```

---

## 5. Checklist antes de gravar

- [ ] `pnpm sync:daily` — garante que os mercados estão criados
- [ ] Carteira com SOL de devnet + USDC de teste (`pnpm --filter @verdict/relayer faucet <addr> <amount>`)
- [ ] Um mercado com pool > 0 (aposte antes, pra ter odd bonita na tela)
- [ ] `bash scripts/test-local.sh` roda limpo (5/5)
- [ ] Fonte do terminal grande o bastante pra ler a assinatura da tx
