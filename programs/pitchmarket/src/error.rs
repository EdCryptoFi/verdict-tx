use anchor_lang::prelude::*;

#[error_code]
pub enum PitchError {
    #[msg("Outcome count must be between 2 and MAX_OUTCOMES")]
    InvalidOutcomeCount,
    #[msg("Selected outcome index is out of range")]
    OutcomeOutOfRange,
    #[msg("Bet amount must be greater than zero")]
    ZeroAmount,
    #[msg("Market is not open for betting")]
    MarketNotOpen,
    #[msg("Betting window has closed for this market")]
    BettingClosed,
    #[msg("Market is not yet resolved")]
    MarketNotResolved,
    #[msg("Market is already resolved")]
    AlreadyResolved,
    #[msg("Position has already been claimed")]
    AlreadyClaimed,
    #[msg("No winning stake in this position")]
    NothingToClaim,
    #[msg("Betting window has not closed yet")]
    BettingStillOpen,
    #[msg("Could not find a matching Ed25519 verify instruction in this transaction")]
    MissingEd25519Instruction,
    #[msg("Ed25519 instruction does not authorize the expected oracle/outcome")]
    InvalidOracleSignature,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
