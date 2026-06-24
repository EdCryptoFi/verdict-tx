use anchor_lang::prelude::*;
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;

use crate::constants::*;
use crate::ed25519::{resolution_message, verify_oracle_signature};
use crate::error::PitchError;
use crate::state::{Market, MarketStatus};

#[derive(Accounts)]
pub struct Resolve<'info> {
    /// Anyone can crank resolution — trust comes from the oracle signature, not this signer.
    pub cranker: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, &market.match_id.to_le_bytes(), &[market.kind]],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    /// CHECK: validated by address; read via instruction introspection.
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,
}

/// Resolve a market against a TxODDS-signed result.
///
/// The transaction MUST contain a native Ed25519Program verify instruction (at
/// `ed25519_ix_index`) proving the market's `oracle_pubkey` signed
/// `resolution_message(match_id, kind, winning_outcome)`. The runtime verifies the
/// signature itself; we only assert it targets the expected pubkey + message.
pub fn resolve_handler(ctx: Context<Resolve>, winning_outcome: u8, ed25519_ix_index: u8) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(
        market.status == MarketStatus::Open,
        PitchError::AlreadyResolved
    );
    require!(
        (winning_outcome as usize) < market.num_outcomes as usize,
        PitchError::OutcomeOutOfRange
    );

    let expected_msg = resolution_message(market.match_id, market.kind, winning_outcome);
    verify_oracle_signature(
        &ctx.accounts.instructions_sysvar.to_account_info(),
        ed25519_ix_index,
        &market.oracle_pubkey,
        &expected_msg,
    )?;

    market.status = MarketStatus::Resolved;
    market.winning_outcome = winning_outcome;

    msg!(
        "Market resolved: match_id={} winning_outcome={} (oracle-verified)",
        market.match_id,
        winning_outcome
    );
    Ok(())
}
