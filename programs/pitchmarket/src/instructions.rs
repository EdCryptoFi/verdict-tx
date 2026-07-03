pub mod cancel_market;
pub mod claim;
pub mod claim_refund;
pub mod create_market;
pub mod place_bet;
pub mod resolve;

// Glob re-export so the Accounts structs AND their macro-generated `__client_accounts_*`
// modules surface at the crate root, where the `#[program]` macro expects them.
// Handlers are uniquely named per module to avoid glob-reexport ambiguity.
pub use cancel_market::*;
pub use claim::*;
pub use claim_refund::*;
pub use create_market::*;
pub use place_bet::*;
pub use resolve::*;
