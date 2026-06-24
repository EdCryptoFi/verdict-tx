pub mod constants;
pub mod ed25519;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7");

#[program]
pub mod pitchmarket {
    use super::*;

    /// Create a pari-mutuel market for a World Cup match question.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        match_id: u64,
        kind: u8,
        num_outcomes: u8,
        betting_close_ts: i64,
        oracle_pubkey: [u8; 32],
    ) -> Result<()> {
        instructions::create_market::create_market_handler(
            ctx,
            match_id,
            kind,
            num_outcomes,
            betting_close_ts,
            oracle_pubkey,
        )
    }

    /// Stake USDC on an outcome.
    pub fn place_bet(ctx: Context<PlaceBet>, outcome: u8, amount: u64) -> Result<()> {
        instructions::place_bet::place_bet_handler(ctx, outcome, amount)
    }

    /// Resolve the market against a TxODDS-signed (ed25519) result.
    pub fn resolve(ctx: Context<Resolve>, winning_outcome: u8, ed25519_ix_index: u8) -> Result<()> {
        instructions::resolve::resolve_handler(ctx, winning_outcome, ed25519_ix_index)
    }

    /// Claim a winning position's pro-rata share of the pool.
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::claim_handler(ctx)
    }
}
