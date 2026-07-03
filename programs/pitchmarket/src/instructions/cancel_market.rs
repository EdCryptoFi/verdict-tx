use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::PitchError;
use crate::state::{Market, MarketStatus};

#[derive(Accounts)]
pub struct CancelMarket<'info> {
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, &market.match_id.to_le_bytes(), &[market.kind]],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,
}

/// Cancel an unresolved market so bettors can reclaim their stakes (e.g. the match was
/// cancelled or postponed). The market authority may cancel at any time while `Open`; anyone
/// may cancel once `betting_close_ts + REFUND_GRACE_SECS` has passed, so funds are never stuck.
pub fn cancel_market_handler(ctx: Context<CancelMarket>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    require!(market.status == MarketStatus::Open, PitchError::AlreadyResolved);

    let is_authority = ctx.accounts.signer.key() == market.authority;
    let now = Clock::get()?.unix_timestamp;
    let grace_passed = now >= market.betting_close_ts + REFUND_GRACE_SECS;
    require!(is_authority || grace_passed, PitchError::NotCancellable);

    market.status = MarketStatus::Refunded;
    msg!("Market cancelled → refund: fixture={}", market.match_id);
    Ok(())
}
