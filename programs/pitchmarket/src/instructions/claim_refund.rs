use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::error::PitchError;
use crate::state::{Market, MarketStatus, Position};

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
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

/// Reclaim the full staked amount from a refunded/cancelled market.
pub fn claim_refund_handler(ctx: Context<ClaimRefund>) -> Result<()> {
    let market = &ctx.accounts.market;
    require!(
        market.status == MarketStatus::Refunded,
        PitchError::MarketNotRefunded
    );

    let position = &mut ctx.accounts.position;
    require!(!position.claimed, PitchError::AlreadyClaimed);

    let refund: u64 = position
        .stake_per_outcome
        .iter()
        .try_fold(0u64, |acc, s| acc.checked_add(*s))
        .ok_or(PitchError::MathOverflow)?;
    require!(refund > 0, PitchError::NoRefundAvailable);

    position.claimed = true;

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
        refund,
    )?;

    msg!("Refunded: amount={}", refund);
    Ok(())
}
