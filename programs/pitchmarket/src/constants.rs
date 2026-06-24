use anchor_lang::prelude::*;

/// PDA seeds
#[constant]
pub const MARKET_SEED: &[u8] = b"market";
#[constant]
pub const VAULT_SEED: &[u8] = b"vault";
#[constant]
pub const POSITION_SEED: &[u8] = b"position";

/// Max number of outcomes a market can have (e.g. 3 = Home/Draw/Away).
pub const MAX_OUTCOMES: usize = 8;

/// Protocol fee in basis points, skimmed from the pool at claim time (1% = 100 bps).
pub const PROTOCOL_FEE_BPS: u64 = 100;
pub const BPS_DENOMINATOR: u64 = 10_000;
