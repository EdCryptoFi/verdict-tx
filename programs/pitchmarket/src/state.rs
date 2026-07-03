use anchor_lang::prelude::*;

use crate::constants::MAX_OUTCOMES;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum MarketStatus {
    Open,
    Resolved,
    /// Match cancelled, or resolved with no stake on the winning outcome → everyone refunded.
    Refunded,
}

/// The on-chain definition of how one outcome is decided against TxODDS score data.
///
/// At resolution we build a TxODDS `TraderPredicate` from `threshold`/`comparison` and feed
/// `stat_a` (and optionally `stat_b` combined via `op`) into `validate_stat`. Storing this per
/// outcome at market creation means the relayer can never settle to an outcome whose predicate
/// does not actually hold against the Merkle-verified score.
///
/// 1X2 full-time result (stat_a = home goals, stat_b = away goals, op = Subtract):
///   - Home win → threshold 0, comparison GreaterThan   ((home - away) > 0)
///   - Draw     → threshold 0, comparison EqualTo        ((home - away) == 0)
///   - Away win → threshold 0, comparison LessThan       ((home - away) < 0)
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, Default)]
pub struct PredicateSpec {
    /// TxODDS stat key for stat_a (e.g. home-team goals).
    pub stat_a_key: u32,
    /// TxODDS stat key for stat_b (e.g. away-team goals); only used when `use_stat_b`.
    pub stat_b_key: u32,
    /// Match period the stats belong to (e.g. full-time).
    pub period: i32,
    /// Whether this predicate combines two stats via `op`.
    pub use_stat_b: bool,
    /// 0 = Add, 1 = Subtract (combine stat_a and stat_b). Only meaningful when `use_stat_b`.
    pub op: u8,
    /// Comparison threshold.
    pub threshold: i32,
    /// 0 = GreaterThan, 1 = LessThan, 2 = EqualTo.
    pub comparison: u8,
}

impl PredicateSpec {
    pub const SIZE: usize = 4 + 4 + 4 + 1 + 1 + 4 + 1; // 19
}

/// A pari-mutuel prediction market for a single World Cup match question.
///
/// All bets across every outcome go into one pool. When the match settles, holders of the
/// winning outcome split the entire pool pro-rata to their stake.
#[account]
pub struct Market {
    /// TxODDS fixture id this market refers to.
    pub match_id: u64,
    /// Market question kind (0 = full-time 1X2, 1 = over/under, ...). App-defined.
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
    /// Predicate that decides each outcome against TxODDS data.
    pub predicates: [PredicateSpec; MAX_OUTCOMES],
    /// Authority that created the market (relayer/admin).
    pub authority: Pubkey,
    /// SPL mint used for settlement (e.g. USDC).
    pub mint: Pubkey,
    /// Bump for the market PDA.
    pub bump: u8,
    /// Bump for the vault token account PDA.
    pub vault_bump: u8,
}

impl Market {
    pub const SPACE: usize = 8   // discriminator
        + 8                      // match_id
        + 1                      // kind
        + 1                      // num_outcomes
        + 1                      // status
        + 1                      // winning_outcome
        + 8                      // betting_close_ts
        + 8                      // total_pool
        + 8 * MAX_OUTCOMES       // pool_per_outcome
        + PredicateSpec::SIZE * MAX_OUTCOMES // predicates
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
