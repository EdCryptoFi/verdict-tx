use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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

    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump = market.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    /// Where the protocol fee is raked to. Pinned to the market's stored authority and mint, so a
    /// cranker cannot redirect the fee to themselves. Checked by constraint rather than created
    /// here on demand: `init_if_needed` would drag in the mint, ATA and system programs, and the
    /// Merkle proofs leave no room for them inside the 1232-byte transaction limit.
    #[account(
        mut,
        constraint = fee_destination.owner == market.authority @ PitchError::InvalidFeeDestination,
        constraint = fee_destination.mint == market.mint @ PitchError::InvalidMint,
    )]
    pub fee_destination: Account<'info, TokenAccount>,

    /// CHECK: must be the TxODDS program; verified by address.
    #[account(address = TXODDS_PROGRAM_ID @ PitchError::InvalidTxoddsProgram)]
    pub txodds_program: UncheckedAccount<'info>,

    /// CHECK: the TxODDS daily-scores Merkle-roots PDA. We assert it is owned by the TxODDS
    /// program so a caller cannot substitute a forged roots account.
    #[account(owner = TXODDS_PROGRAM_ID @ PitchError::InvalidRootsAccount)]
    pub daily_scores_merkle_roots: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
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

    // Betting must be closed before settlement, so a live in-play score can't be used to
    // resolve the market while people are still allowed to bet.
    let now = Clock::get()?.unix_timestamp;
    require!(now >= market.betting_close_ts, PitchError::BettingStillOpen);

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

    market.winning_outcome = winning_outcome;

    // If nobody staked the winning outcome, there are no winners to split the pool — refund
    // every bettor their stake instead of locking the funds forever. No fee is taken on a refund.
    if market.pool_per_outcome[winning_outcome as usize] == 0 {
        market.status = MarketStatus::Refunded;
        msg!(
            "Market resolved with no winning stake → refund: fixture={} winning_outcome={}",
            market.match_id,
            winning_outcome
        );
        return Ok(());
    }

    market.status = MarketStatus::Resolved;

    // Rake the protocol fee off the top, once, here at settlement. `total_pool` then *is* the net
    // pool that winners split pro-rata in `claim`, so no fee can be left stranded in the vault and
    // every lamport in it is owed to a winner.
    let fee: u64 = (market.total_pool as u128)
        .checked_mul(PROTOCOL_FEE_BPS as u128)
        .ok_or(PitchError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(PitchError::MathOverflow)? as u64;

    market.total_pool = market
        .total_pool
        .checked_sub(fee)
        .ok_or(PitchError::MathOverflow)?;

    let (match_id, kind, bump, net_pool) = (
        market.match_id,
        market.kind,
        market.bump,
        market.total_pool,
    );

    if fee > 0 {
        // Transfer signed by the market PDA (the vault authority).
        let match_id_bytes = match_id.to_le_bytes();
        let kind_bytes = [kind];
        let signer_seeds: &[&[&[u8]]] = &[&[
            MARKET_SEED,
            match_id_bytes.as_ref(),
            kind_bytes.as_ref(),
            &[bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.fee_destination.to_account_info(),
                    authority: ctx.accounts.market.to_account_info(),
                },
                signer_seeds,
            ),
            fee,
        )?;
    }

    msg!(
        "Market resolved: fixture={} winning_outcome={} fee={} net_pool={} (TxODDS Merkle-verified)",
        match_id,
        winning_outcome,
        fee,
        net_pool
    );
    Ok(())
}
