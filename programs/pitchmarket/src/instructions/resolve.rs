use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::PitchError;
use crate::state::{Market, MarketStatus};
use crate::txodds::{
    cpi_validate_stat, BinaryExpression, Comparison, ProofNode, ScoresBatchSummary, StatTerm,
    TraderPredicate, TXODDS_PROGRAM_ID,
};

#[derive(Accounts)]
pub struct Resolve<'info> {
    /// Anyone can crank resolution — trust comes from the TxODDS Merkle proof, not this signer.
    pub cranker: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, &market.match_id.to_le_bytes(), &[market.kind]],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    /// CHECK: must be the TxODDS program; verified by address.
    #[account(address = TXODDS_PROGRAM_ID @ PitchError::InvalidTxoddsProgram)]
    pub txodds_program: UncheckedAccount<'info>,

    /// CHECK: the TxODDS daily-scores Merkle-roots PDA. We assert it is owned by the TxODDS
    /// program so a caller cannot substitute a forged roots account.
    #[account(owner = TXODDS_PROGRAM_ID @ PitchError::InvalidRootsAccount)]
    pub daily_scores_merkle_roots: UncheckedAccount<'info>,
}

/// Resolve a market by proving the winning outcome's predicate against TxODDS' on-chain
/// Merkle-committed score, via CPI into TxODDS `validate_stat`.
///
/// The proof material (`fixture_summary`, proofs, `stat_a`/`stat_b`) is supplied by the relayer
/// from `GET /api/scores/stat-validation`; the *predicate* is taken from the market's stored
/// `PredicateSpec` for `winning_outcome`, so a relayer can only settle to an outcome that truly
/// holds against the verified score.
#[allow(clippy::too_many_arguments)]
pub fn resolve_handler(
    ctx: Context<Resolve>,
    winning_outcome: u8,
    ts: i64,
    fixture_summary: ScoresBatchSummary,
    fixture_proof: Vec<ProofNode>,
    main_tree_proof: Vec<ProofNode>,
    stat_a: StatTerm,
    stat_b: Option<StatTerm>,
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(market.status == MarketStatus::Open, PitchError::AlreadyResolved);
    require!(
        (winning_outcome as usize) < market.num_outcomes as usize,
        PitchError::OutcomeOutOfRange
    );

    // The proof must be for this market's fixture.
    require!(
        fixture_summary.fixture_id == market.match_id as i64,
        PitchError::FixtureMismatch
    );

    let spec = market.predicates[winning_outcome as usize];

    // Bind the supplied stats to the stored predicate spec (relayer can't swap stats).
    require!(
        stat_a.stat_to_prove.key == spec.stat_a_key && stat_a.stat_to_prove.period == spec.period,
        PitchError::StatSpecMismatch
    );

    let (resolved_stat_b, op) = if spec.use_stat_b {
        let b = stat_b.ok_or(error!(PitchError::MissingSecondStat))?;
        require!(
            b.stat_to_prove.key == spec.stat_b_key && b.stat_to_prove.period == spec.period,
            PitchError::StatSpecMismatch
        );
        let op = match spec.op {
            0 => BinaryExpression::Add,
            _ => BinaryExpression::Subtract,
        };
        (Some(b), Some(op))
    } else {
        (None, None)
    };

    let predicate = TraderPredicate {
        threshold: spec.threshold,
        comparison: match spec.comparison {
            0 => Comparison::GreaterThan,
            1 => Comparison::LessThan,
            _ => Comparison::EqualTo,
        },
    };

    let holds = cpi_validate_stat(
        &ctx.accounts.txodds_program.to_account_info(),
        &ctx.accounts.daily_scores_merkle_roots.to_account_info(),
        ts,
        fixture_summary,
        fixture_proof,
        main_tree_proof,
        predicate,
        stat_a,
        resolved_stat_b,
        op,
    )?;
    require!(holds, PitchError::OracleValidationFailed);

    market.status = MarketStatus::Resolved;
    market.winning_outcome = winning_outcome;

    msg!(
        "Market resolved: fixture={} winning_outcome={} (TxODDS Merkle-verified)",
        market.match_id,
        winning_outcome
    );
    Ok(())
}
