import "dotenv/config";

export const config = {
  port: Number(process.env.INDEXER_PORT ?? 8787),
  rpcUrl: process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
  txodds: {
    base: process.env.TXODDS_API_BASE ?? "https://txline.txodds.com",
    apiKey: process.env.TXODDS_API_KEY ?? "",
    jwt: process.env.TXODDS_JWT ?? "",
    mock: process.env.TXODDS_MOCK === "1" || !process.env.TXODDS_API_KEY,
  },
};
