//! Mirror of the TxODDS TxLINE program (`txoracle` v1.5.2) types and a CPI helper for its
//! `validate_stat` instruction, which verifies a score statistic against the on-chain-committed
//! Merkle root and evaluates a predicate, returning a bool.
//!
//! Types are byte-exact copies of the TxODDS IDL so Borsh serialization matches for CPI.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::{AccountMeta, Instruction};
use anchor_lang::solana_program::program::{get_return_data, invoke};

use crate::error::PitchError;

/// TxODDS TxLINE program id (devnet). Swap for mainnet `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` on launch.
pub const TXODDS_PROGRAM_ID: Pubkey = pubkey!("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");

/// Anchor discriminator for `validate_stat` (sha256("global:validate_stat")[..8]).
pub const VALIDATE_STAT_DISCRIMINATOR: [u8; 8] = [107, 197, 232, 90, 191, 136, 105, 185];

// ---- TxODDS IDL types (exact mirror) ----

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

/// Argument tuple for `validate_stat`, serialized (in field order) after the discriminator.
#[derive(AnchorSerialize)]
struct ValidateStatArgs {
    ts: i64,
    fixture_summary: ScoresBatchSummary,
    fixture_proof: Vec<ProofNode>,
    main_tree_proof: Vec<ProofNode>,
    predicate: TraderPredicate,
    stat_a: StatTerm,
    stat_b: Option<StatTerm>,
    op: Option<BinaryExpression>,
}

/// CPI into TxODDS `validate_stat`. Returns whether the predicate holds against the
/// Merkle-verified on-chain score. `daily_scores_merkle_roots` must be the genuine
/// TxODDS-owned root PDA (ownership is asserted by the caller).
#[allow(clippy::too_many_arguments)]
pub fn cpi_validate_stat<'info>(
    txodds_program: &AccountInfo<'info>,
    daily_scores_merkle_roots: &AccountInfo<'info>,
    ts: i64,
    fixture_summary: ScoresBatchSummary,
    fixture_proof: Vec<ProofNode>,
    main_tree_proof: Vec<ProofNode>,
    predicate: TraderPredicate,
    stat_a: StatTerm,
    stat_b: Option<StatTerm>,
    op: Option<BinaryExpression>,
) -> Result<bool> {
    let mut data = Vec::with_capacity(256);
    data.extend_from_slice(&VALIDATE_STAT_DISCRIMINATOR);
    ValidateStatArgs {
        ts,
        fixture_summary,
        fixture_proof,
        main_tree_proof,
        predicate,
        stat_a,
        stat_b,
        op,
    }
    .serialize(&mut data)?;

    let ix = Instruction {
        program_id: TXODDS_PROGRAM_ID,
        accounts: vec![AccountMeta::new_readonly(
            daily_scores_merkle_roots.key(),
            false,
        )],
        data,
    };

    invoke(
        &ix,
        &[
            daily_scores_merkle_roots.clone(),
            txodds_program.clone(),
        ],
    )?;

    // validate_stat returns a Borsh-encoded bool via return data.
    let (returning_program, ret) =
        get_return_data().ok_or(error!(PitchError::OracleValidationFailed))?;
    require_keys_eq!(
        returning_program,
        TXODDS_PROGRAM_ID,
        PitchError::OracleValidationFailed
    );
    Ok(matches!(ret.first(), Some(1)))
}
