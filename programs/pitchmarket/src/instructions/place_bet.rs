use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::error::PitchError;
use crate::state::{Market, MarketStatus, Position};

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, &market.match_id.to_le_bytes(), &[market.kind]],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    #[account(
        init_if_needed,
        payer = bettor,
        space = Position::SPACE,
        seeds = [POSITION_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump,
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
    pub system_program: Program<'info, System>,
}

pub fn place_bet_handler(ctx: Context<PlaceBet>, outcome: u8, amount: u64) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(market.status == MarketStatus::Open, PitchError::MarketNotOpen);
    require!(amount > 0, PitchError::ZeroAmount);
    require!(
        (outcome as usize) < market.num_outcomes as usize,
        PitchError::OutcomeOutOfRange
    );

    let now = Clock::get()?.unix_timestamp;
    require!(now < market.betting_close_ts, PitchError::BettingClosed);

    // Move tokens into the vault.
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.bettor_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.bettor.to_account_info(),
            },
        ),
        amount,
    )?;

    // Update pools.
    let o = outcome as usize;
    market.pool_per_outcome[o] = market.pool_per_outcome[o]
        .checked_add(amount)
        .ok_or(PitchError::MathOverflow)?;
    market.total_pool = market
        .total_pool
        .checked_add(amount)
        .ok_or(PitchError::MathOverflow)?;

    // Update the bettor's position.
    let position = &mut ctx.accounts.position;
    if position.market == Pubkey::default() {
        position.market = market.key();
        position.bettor = ctx.accounts.bettor.key();
        position.claimed = false;
        position.bump = ctx.bumps.position;
    }
    position.stake_per_outcome[o] = position.stake_per_outcome[o]
        .checked_add(amount)
        .ok_or(PitchError::MathOverflow)?;

    msg!("Bet placed: outcome={} amount={}", outcome, amount);
    Ok(())
}
