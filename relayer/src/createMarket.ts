import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  build1X2Predicates,
  marketPda,
  vaultPda,
  MarketKind,
} from "@verdict/shared";
import { getProgram } from "./program.js";
import { STAT } from "./mock.js";

/** Create a 1X2 full-time market for a fixture. Returns the market PDA. */
export async function createMarket1X2(opts: {
  admin: Keypair;
  fixtureId: number;
  mint: PublicKey;
  bettingCloseTs: number; // unix seconds
  homeGoalsStatKey?: number;
  awayGoalsStatKey?: number;
  period?: number;
}): Promise<PublicKey> {
  const program = getProgram(opts.admin);
  const kind = MarketKind.FullTime1X2;
  const [market] = marketPda(BigInt(opts.fixtureId), kind);
  const [vault] = vaultPda(market);

  const predicates = build1X2Predicates(
    opts.homeGoalsStatKey ?? STAT.HOME_GOALS,
    opts.awayGoalsStatKey ?? STAT.AWAY_GOALS,
    opts.period ?? STAT.FULL_TIME
  );

  await program.methods
    .createMarket(new BN(opts.fixtureId), kind, 3, new BN(opts.bettingCloseTs), predicates)
    .accountsPartial({
      authority: opts.admin.publicKey,
      market,
      mint: opts.mint,
      vault,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log(`✅ market created: fixture=${opts.fixtureId} pda=${market.toBase58()}`);
  return market;
}
