import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { pitchmarketIdl, type Pitchmarket } from "@verdict/shared";
import { connection } from "./config.js";

export function getProgram(payer: Keypair): Program<Pitchmarket> {
  const provider = new AnchorProvider(connection(), new Wallet(payer), {
    commitment: "confirmed",
  });
  return new Program<Pitchmarket>(pitchmarketIdl as Pitchmarket, provider);
}
