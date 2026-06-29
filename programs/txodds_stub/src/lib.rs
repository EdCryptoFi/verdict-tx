//! Local-test stub for the TxODDS `txoracle` program.
//!
//! It implements `validate_stat` with the SAME instruction name (so the Anchor discriminator
//! matches the real program) and the SAME argument layout (so Borsh deserialization matches).
//! Instead of verifying a Merkle proof, it simply EVALUATES the predicate against the supplied
//! stat values and returns the boolean — enough to exercise PitchMarket's CPI + binding logic
//! end-to-end on localnet. Loaded at the real TxODDS address via Anchor.toml `[[test.genesis]]`.

use anchor_lang::prelude::*;

declare_id!("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");

#[program]
pub mod txodds_stub {
    use super::*;

    #[allow(clippy::too_many_arguments)]
    pub fn validate_stat(
        _ctx: Context<ValidateStat>,
        _ts: i64,
        _fixture_summary: ScoresBatchSummary,
        _fixture_proof: Vec<ProofNode>,
        _main_tree_proof: Vec<ProofNode>,
        predicate: TraderPredicate,
        stat_a: StatTerm,
        stat_b: Option<StatTerm>,
        op: Option<BinaryExpression>,
    ) -> Result<bool> {
        let a = stat_a.stat_to_prove.value as i64;
        let combined = match (stat_b, op) {
            (Some(b), Some(BinaryExpression::Add)) => a + b.stat_to_prove.value as i64,
            (Some(b), Some(BinaryExpression::Subtract)) => a - b.stat_to_prove.value as i64,
            _ => a,
        };
        let t = predicate.threshold as i64;
        let holds = match predicate.comparison {
            Comparison::GreaterThan => combined > t,
            Comparison::LessThan => combined < t,
            Comparison::EqualTo => combined == t,
        };
        Ok(holds)
    }
}

#[derive(Accounts)]
pub struct ValidateStat<'info> {
    /// CHECK: stub ignores the roots account contents.
    pub daily_scores_merkle_roots: UncheckedAccount<'info>,
}

// ---- Types mirrored from the TxODDS IDL (must match PitchMarket's txodds.rs) ----

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ProofNode {
    pub hash: [u8; 32],
    pub is_right_sibling: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct ScoreStat {
    pub key: u32,
    pub value: i32,
    pub period: i32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct StatTerm {
    pub stat_to_prove: ScoreStat,
    pub event_stat_root: [u8; 32],
    pub stat_proof: Vec<ProofNode>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct ScoresUpdateStats {
    pub update_count: i32,
    pub min_timestamp: i64,
    pub max_timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct ScoresBatchSummary {
    pub fixture_id: i64,
    pub update_stats: ScoresUpdateStats,
    pub events_sub_tree_root: [u8; 32],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Comparison {
    GreaterThan,
    LessThan,
    EqualTo,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum BinaryExpression {
    Add,
    Subtract,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct TraderPredicate {
    pub threshold: i32,
    pub comparison: Comparison,
}
