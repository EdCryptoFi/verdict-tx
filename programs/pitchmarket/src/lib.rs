pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod txodds;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use txodds::*;

declare_id!("Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7");

#[program]
pub mod pitchmarket {
    use super::*;

    /// Create a pari-mutuel market for a World Cup match question, storing the per-outcome
    /// predicates that decide it against TxODDS score data.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        match_id: u64,
        kind: u8,
        num_outcomes: u8,
        betting_close_ts: i64,
        predicates: Vec<PredicateSpec>,
    ) -> Result<()> {
        instructions::create_market::create_market_handler(
            ctx,
            match_id,
            kind,
            num_outcomes,
            betting_close_ts,
            predicates,
        )
    }

    /// Stake USDC on an outcome.
    pub fn place_bet(ctx: Context<PlaceBet>, outcome: u8, amount: u64) -> Result<()> {
        instructions::place_bet::place_bet_handler(ctx, outcome, amount)
    }

    /// Resolve the market by CPI-verifying the winning outcome against TxODDS' on-chain
    /// Merkle-committed score (`validate_stat`).
    #[allow(clippy::too_many_arguments)]
    pub fn resolve(
        ctx: Context<Resolve>,
        winning_outcome: u8,
        ts: i64,
        fixture_summary: ScoresBatchSummary,
        fixture_proof: Vec<ProofNode>,
        main_tree_proof: Vec<ProofNode>,
        stat_a: StatTerm,
        stat_b: Option<StatTerm>,
    ) -> Result<()> {
        instructions::resolve::resolve_handler(
            ctx,
            winning_outcome,
            ts,
            fixture_summary,
            fixture_proof,
            main_tree_proof,
            stat_a,
            stat_b,
        )
    }

    /// Claim a winning position's pro-rata share of the pool.
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::claim_handler(ctx)
    }

    /// Cancel an unresolved market (authority anytime; anyone after the refund grace period),
    /// moving it to a refundable state.
    pub fn cancel_market(ctx: Context<CancelMarket>) -> Result<()> {
        instructions::cancel_market::cancel_market_handler(ctx)
    }

    /// Reclaim the full stake from a refunded/cancelled market.
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        instructions::claim_refund::claim_refund_handler(ctx)
    }
}
