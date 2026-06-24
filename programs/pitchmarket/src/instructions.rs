pub mod claim;
pub mod create_market;
pub mod place_bet;
pub mod resolve;

// Glob re-export so the Accounts structs AND their macro-generated `__client_accounts_*`
// modules surface at the crate root, where the `#[program]` macro expects them.
// Handlers are uniquely named per module to avoid glob-reexport ambiguity.
pub use claim::*;
pub use create_market::*;
pub use place_bet::*;
pub use resolve::*;
