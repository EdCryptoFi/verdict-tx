use anchor_lang::prelude::*;

#[error_code]
pub enum PitchError {
    #[msg("Outcome count must be between 2 and MAX_OUTCOMES")]
    InvalidOutcomeCount,
    #[msg("Number of predicates must equal number of outcomes")]
    PredicateCountMismatch,
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
    #[msg("Proof is for a different fixture than this market")]
    FixtureMismatch,
    #[msg("Provided stat does not match the outcome's predicate spec")]
    StatSpecMismatch,
    #[msg("This outcome's predicate requires a second stat that was not provided")]
    MissingSecondStat,
    #[msg("The TxODDS roots account is not owned by the TxODDS program")]
    InvalidRootsAccount,
    #[msg("Wrong TxODDS program account")]
    InvalidTxoddsProgram,
    #[msg("TxODDS validate_stat did not confirm the claimed outcome")]
    OracleValidationFailed,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
