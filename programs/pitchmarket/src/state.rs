use anchor_lang::prelude::*;

use crate::constants::MAX_OUTCOMES;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum MarketStatus {
    Open,
    Resolved,
}

/// A pari-mutuel prediction market for a single World Cup match question.
///
/// All bets across every outcome go into one pool. When the match settles,
/// holders of the winning outcome split the entire pool pro-rata to their stake.
#[account]
pub struct Market {
    /// TxODDS match identifier this market refers to.
    pub match_id: u64,
    /// Market question kind (0 = full-time result, 1 = over/under, ...). App-defined.
    pub kind: u8,
    /// Number of valid outcomes (e.g. 3 = Home/Draw/Away).
    pub num_outcomes: u8,
    /// Current status.
    pub status: MarketStatus,
    /// Winning outcome index, set on resolve.
    pub winning_outcome: u8,
    /// Unix ts after which betting is closed.
    pub betting_close_ts: i64,
    /// Total staked across all outcomes (in token base units, e.g. USDC).
    pub total_pool: u64,
    /// Staked amount per outcome.
    pub pool_per_outcome: [u64; MAX_OUTCOMES],
    /// The ed25519 public key authorized to sign this market's result (the TxODDS oracle).
    pub oracle_pubkey: [u8; 32],
    /// Authority that created the market (relayer/admin).
    pub authority: Pubkey,
    /// SPL mint used for settlement (e.g. USDC).
    pub mint: Pubkey,
    /// Bump for the market PDA.
    pub bump: u8,
    /// Bump for the vault authority PDA.
    pub vault_bump: u8,
}

impl Market {
    pub const SPACE: usize = 8   // discriminator
        + 8                      // match_id
        + 1                      // kind
        + 1                      // num_outcomes
        + 1                      // status (enum, 1 byte)
        + 1                      // winning_outcome
        + 8                      // betting_close_ts
        + 8                      // total_pool
        + 8 * MAX_OUTCOMES       // pool_per_outcome
        + 32                     // oracle_pubkey
        + 32                     // authority
        + 32                     // mint
        + 1                      // bump
        + 1; // vault_bump
}

/// A single bettor's stake in a given market, tracked per outcome.
#[account]
pub struct Position {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub stake_per_outcome: [u64; MAX_OUTCOMES],
    pub claimed: bool,
    pub bump: u8,
}

impl Position {
    pub const SPACE: usize = 8 + 32 + 32 + 8 * MAX_OUTCOMES + 1 + 1;
}
