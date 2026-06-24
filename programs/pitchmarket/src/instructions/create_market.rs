use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::constants::*;
use crate::error::PitchError;
use crate::state::{Market, MarketStatus};

#[derive(Accounts)]
#[instruction(match_id: u64, kind: u8)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Market::SPACE,
        seeds = [MARKET_SEED, &match_id.to_le_bytes(), &[kind]],
        bump
    )]
    pub market: Account<'info, Market>,

    pub mint: Account<'info, Mint>,

    /// Vault token account owned by the vault-authority PDA, holding all staked tokens.
    #[account(
        init,
        payer = authority,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = market,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_market_handler(
    ctx: Context<CreateMarket>,
    match_id: u64,
    kind: u8,
    num_outcomes: u8,
    betting_close_ts: i64,
    oracle_pubkey: [u8; 32],
) -> Result<()> {
    require!(
        num_outcomes >= 2 && (num_outcomes as usize) <= MAX_OUTCOMES,
        PitchError::InvalidOutcomeCount
    );

    let market = &mut ctx.accounts.market;
    market.match_id = match_id;
    market.kind = kind;
    market.num_outcomes = num_outcomes;
    market.status = MarketStatus::Open;
    market.winning_outcome = 0;
    market.betting_close_ts = betting_close_ts;
    market.total_pool = 0;
    market.pool_per_outcome = [0u64; MAX_OUTCOMES];
    market.oracle_pubkey = oracle_pubkey;
    market.authority = ctx.accounts.authority.key();
    market.mint = ctx.accounts.mint.key();
    market.bump = ctx.bumps.market;
    market.vault_bump = ctx.bumps.vault;

    msg!(
        "Market created: match_id={} kind={} outcomes={}",
        match_id,
        kind,
        num_outcomes
    );
    Ok(())
}
