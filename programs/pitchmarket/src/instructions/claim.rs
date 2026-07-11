use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::error::PitchError;
use crate::state::{Market, MarketStatus, Position};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        seeds = [MARKET_SEED, &market.match_id.to_le_bytes(), &[market.kind]],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [POSITION_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump = position.bump,
        constraint = position.bettor == bettor.key(),
        constraint = position.market == market.key(),
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump = market.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = bettor_token_account.mint == market.mint,
        constraint = bettor_token_account.owner == bettor.key(),
    )]
    pub bettor_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn claim_handler(ctx: Context<Claim>) -> Result<()> {
    let market = &ctx.accounts.market;
    require!(
        market.status == MarketStatus::Resolved,
        PitchError::MarketNotResolved
    );

    let position = &mut ctx.accounts.position;
    require!(!position.claimed, PitchError::AlreadyClaimed);

    let winner = market.winning_outcome as usize;
    let winning_stake = position.stake_per_outcome[winner];
    require!(winning_stake > 0, PitchError::NothingToClaim);

    let winner_pool = market.pool_per_outcome[winner];
    // winner_pool > 0 is guaranteed because this position staked on it.

    // Pari-mutuel pro-rata payout: stake / winner_pool * total_pool. `total_pool` is already net of
    // the protocol fee, which `resolve` raked off the top at settlement — so there is nothing to
    // skim here and the vault holds exactly what the winners are owed.
    let payout: u64 = (winning_stake as u128)
        .checked_mul(market.total_pool as u128)
        .ok_or(PitchError::MathOverflow)?
        .checked_div(winner_pool as u128)
        .ok_or(PitchError::MathOverflow)? as u64;

    position.claimed = true;

    // Transfer signed by the market PDA (the vault authority).
    let match_id_bytes = market.match_id.to_le_bytes();
    let kind = [market.kind];
    let signer_seeds: &[&[&[u8]]] = &[&[
        MARKET_SEED,
        match_id_bytes.as_ref(),
        kind.as_ref(),
        &[market.bump],
    ]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.bettor_token_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
            },
            signer_seeds,
        ),
        payout,
    )?;

    msg!(
        "Claimed: payout={} (stake={} of winner_pool={}, net pool={})",
        payout,
        winning_stake,
        winner_pool,
        market.total_pool
    );
    Ok(())
}
