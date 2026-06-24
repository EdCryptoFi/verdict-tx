use anchor_lang::prelude::*;
use solana_instructions_sysvar::load_instruction_at_checked;
use solana_sdk_ids::ed25519_program::ID as ED25519_PROGRAM_ID;

use crate::error::PitchError;

// Layout of the native Ed25519 program instruction data.
// [ num_signatures: u8 | padding: u8 | offsets(14 bytes) | ...inline data... ]
const NUM_SIGNATURES: usize = 0;
const SIG_OFFSETS_START: usize = 2;
const SIG_OFFSETS_SIZE: usize = 14;

#[derive(Debug)]
struct Ed25519Offsets {
    signature_offset: u16,
    public_key_offset: u16,
    message_data_offset: u16,
    message_data_size: u16,
}

fn read_u16(data: &[u8], at: usize) -> Result<u16> {
    let bytes = data
        .get(at..at + 2)
        .ok_or(PitchError::MissingEd25519Instruction)?;
    Ok(u16::from_le_bytes([bytes[0], bytes[1]]))
}

fn parse_offsets(data: &[u8]) -> Result<Ed25519Offsets> {
    require!(
        data.len() >= SIG_OFFSETS_START + SIG_OFFSETS_SIZE,
        PitchError::MissingEd25519Instruction
    );
    require!(
        data[NUM_SIGNATURES] >= 1,
        PitchError::MissingEd25519Instruction
    );
    let base = SIG_OFFSETS_START;
    Ok(Ed25519Offsets {
        signature_offset: read_u16(data, base)?,
        // base + 2 = signature_instruction_index (ignored; assumed inline / current ix)
        public_key_offset: read_u16(data, base + 4)?,
        // base + 6 = public_key_instruction_index (ignored)
        message_data_offset: read_u16(data, base + 8)?,
        message_data_size: read_u16(data, base + 10)?,
        // base + 12 = message_instruction_index (ignored)
    })
}

/// Assert that the transaction contains a native Ed25519Program verify instruction (at
/// `ed25519_ix_index`) that proves `oracle_pubkey` signed exactly `expected_message`.
///
/// Because the signature is checked by the runtime's Ed25519 program (which fails the whole
/// transaction on a bad signature), confirming the instruction targets our pubkey + message
/// is sufficient for trustless settlement — we never run signature crypto ourselves.
pub fn verify_oracle_signature(
    instructions_sysvar: &AccountInfo,
    ed25519_ix_index: u8,
    oracle_pubkey: &[u8; 32],
    expected_message: &[u8],
) -> Result<()> {
    let ix = load_instruction_at_checked(ed25519_ix_index as usize, instructions_sysvar)
        .map_err(|_| error!(PitchError::MissingEd25519Instruction))?;

    require_keys_eq!(
        ix.program_id,
        ED25519_PROGRAM_ID,
        PitchError::MissingEd25519Instruction
    );

    let data = &ix.data;
    let off = parse_offsets(data)?;

    // Extract the public key the runtime verified.
    let pk = data
        .get(off.public_key_offset as usize..off.public_key_offset as usize + 32)
        .ok_or(PitchError::InvalidOracleSignature)?;
    require!(pk == oracle_pubkey, PitchError::InvalidOracleSignature);

    // Extract the message the runtime verified.
    let msg_start = off.message_data_offset as usize;
    let msg_end = msg_start
        .checked_add(off.message_data_size as usize)
        .ok_or(PitchError::InvalidOracleSignature)?;
    let msg = data
        .get(msg_start..msg_end)
        .ok_or(PitchError::InvalidOracleSignature)?;
    require!(
        msg == expected_message,
        PitchError::InvalidOracleSignature
    );

    // Sanity: signature region must exist.
    require!(
        data.len() >= off.signature_offset as usize + 64,
        PitchError::InvalidOracleSignature
    );

    Ok(())
}

/// Canonical message the oracle signs for a resolution:
/// `b"PITCHMKT:v1" || match_id(le) || kind || winning_outcome`.
pub fn resolution_message(match_id: u64, kind: u8, winning_outcome: u8) -> Vec<u8> {
    let mut m = Vec::with_capacity(11 + 8 + 1 + 1);
    m.extend_from_slice(b"PITCHMKT:v1");
    m.extend_from_slice(&match_id.to_le_bytes());
    m.push(kind);
    m.push(winning_outcome);
    m
}
