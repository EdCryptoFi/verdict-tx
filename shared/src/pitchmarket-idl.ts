/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pitchmarket.json`.
 */
export type Pitchmarket = {
  "address": "Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7",
  "metadata": {
    "name": "pitchmarket",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelMarket",
      "docs": [
        "Cancel an unresolved market (authority anytime; anyone after the refund grace period),",
        "moving it to a refundable state."
      ],
      "discriminator": [
        205,
        121,
        84,
        210,
        222,
        71,
        150,
        11
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "docs": [
        "Claim a winning position's pro-rata share of the pool."
      ],
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "market"
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "bettor"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "bettorTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "claimRefund",
      "docs": [
        "Reclaim the full stake from a refunded/cancelled market."
      ],
      "discriminator": [
        15,
        16,
        30,
        161,
        255,
        228,
        97,
        60
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "market"
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "bettor"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "bettorTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "docs": [
        "Create a pari-mutuel market for a World Cup match question, storing the per-outcome",
        "predicates that decide it against TxODDS score data."
      ],
      "discriminator": [
        103,
        226,
        97,
        235,
        200,
        188,
        251,
        254
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "vault",
          "docs": [
            "Vault token account owned by the market PDA, holding all staked tokens."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "u64"
        },
        {
          "name": "kind",
          "type": "u8"
        },
        {
          "name": "numOutcomes",
          "type": "u8"
        },
        {
          "name": "bettingCloseTs",
          "type": "i64"
        },
        {
          "name": "predicates",
          "type": {
            "vec": {
              "defined": {
                "name": "predicateSpec"
              }
            }
          }
        }
      ]
    },
    {
      "name": "placeBet",
      "docs": [
        "Stake USDC on an outcome."
      ],
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "bettor"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "bettorTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolve",
      "docs": [
        "Resolve the market by CPI-verifying the winning outcome against TxODDS' on-chain",
        "Merkle-committed score (`validate_stat`)."
      ],
      "discriminator": [
        246,
        150,
        236,
        206,
        108,
        63,
        58,
        10
      ],
      "accounts": [
        {
          "name": "cranker",
          "docs": [
            "Anyone can crank resolution — trust comes from the TxODDS Merkle proof, not this signer."
          ],
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "txoddsProgram",
          "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
        },
        {
          "name": "dailyScoresMerkleRoots",
          "docs": [
            "program so a caller cannot substitute a forged roots account."
          ]
        }
      ],
      "args": [
        {
          "name": "winningOutcome",
          "type": "u8"
        },
        {
          "name": "ts",
          "type": "i64"
        },
        {
          "name": "fixtureSummary",
          "type": {
            "defined": {
              "name": "scoresBatchSummary"
            }
          }
        },
        {
          "name": "fixtureProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        },
        {
          "name": "mainTreeProof",
          "type": {
            "vec": {
              "defined": {
                "name": "proofNode"
              }
            }
          }
        },
        {
          "name": "statA",
          "type": {
            "defined": {
              "name": "statTerm"
            }
          }
        },
        {
          "name": "statB",
          "type": {
            "option": {
              "defined": {
                "name": "statTerm"
              }
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidOutcomeCount",
      "msg": "Outcome count must be between 2 and MAX_OUTCOMES"
    },
    {
      "code": 6001,
      "name": "predicateCountMismatch",
      "msg": "Number of predicates must equal number of outcomes"
    },
    {
      "code": 6002,
      "name": "outcomeOutOfRange",
      "msg": "Selected outcome index is out of range"
    },
    {
      "code": 6003,
      "name": "zeroAmount",
      "msg": "Bet amount must be greater than zero"
    },
    {
      "code": 6004,
      "name": "marketNotOpen",
      "msg": "Market is not open for betting"
    },
    {
      "code": 6005,
      "name": "bettingClosed",
      "msg": "Betting window has closed for this market"
    },
    {
      "code": 6006,
      "name": "marketNotResolved",
      "msg": "Market is not yet resolved"
    },
    {
      "code": 6007,
      "name": "alreadyResolved",
      "msg": "Market is already resolved"
    },
    {
      "code": 6008,
      "name": "bettingStillOpen",
      "msg": "Cannot resolve until the betting window has closed"
    },
    {
      "code": 6009,
      "name": "marketNotRefunded",
      "msg": "Market is not in a refundable state"
    },
    {
      "code": 6010,
      "name": "notCancellable",
      "msg": "Not authorized to cancel yet (authority-only until the refund grace period passes)"
    },
    {
      "code": 6011,
      "name": "noRefundAvailable",
      "msg": "No stake to refund in this position"
    },
    {
      "code": 6012,
      "name": "alreadyClaimed",
      "msg": "Position has already been claimed"
    },
    {
      "code": 6013,
      "name": "nothingToClaim",
      "msg": "No winning stake in this position"
    },
    {
      "code": 6014,
      "name": "fixtureMismatch",
      "msg": "Proof is for a different fixture than this market"
    },
    {
      "code": 6015,
      "name": "statSpecMismatch",
      "msg": "Provided stat does not match the outcome's predicate spec"
    },
    {
      "code": 6016,
      "name": "missingSecondStat",
      "msg": "This outcome's predicate requires a second stat that was not provided"
    },
    {
      "code": 6017,
      "name": "invalidRootsAccount",
      "msg": "The TxODDS roots account is not owned by the TxODDS program"
    },
    {
      "code": 6018,
      "name": "invalidTxoddsProgram",
      "msg": "Wrong TxODDS program account"
    },
    {
      "code": 6019,
      "name": "oracleValidationFailed",
      "msg": "TxODDS validate_stat did not confirm the claimed outcome"
    },
    {
      "code": 6020,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "market",
      "docs": [
        "A pari-mutuel prediction market for a single World Cup match question.",
        "",
        "All bets across every outcome go into one pool. When the match settles, holders of the",
        "winning outcome split the entire pool pro-rata to their stake."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "docs": [
              "TxODDS fixture id this market refers to."
            ],
            "type": "u64"
          },
          {
            "name": "kind",
            "docs": [
              "Market question kind (0 = full-time 1X2, 1 = over/under, ...). App-defined."
            ],
            "type": "u8"
          },
          {
            "name": "numOutcomes",
            "docs": [
              "Number of valid outcomes (e.g. 3 = Home/Draw/Away)."
            ],
            "type": "u8"
          },
          {
            "name": "status",
            "docs": [
              "Current status."
            ],
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "winningOutcome",
            "docs": [
              "Winning outcome index, set on resolve."
            ],
            "type": "u8"
          },
          {
            "name": "bettingCloseTs",
            "docs": [
              "Unix ts after which betting is closed."
            ],
            "type": "i64"
          },
          {
            "name": "totalPool",
            "docs": [
              "Total staked across all outcomes (in token base units, e.g. USDC)."
            ],
            "type": "u64"
          },
          {
            "name": "poolPerOutcome",
            "docs": [
              "Staked amount per outcome."
            ],
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          },
          {
            "name": "predicates",
            "docs": [
              "Predicate that decides each outcome against TxODDS data."
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "predicateSpec"
                  }
                },
                8
              ]
            }
          },
          {
            "name": "authority",
            "docs": [
              "Authority that created the market (relayer/admin)."
            ],
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "SPL mint used for settlement (e.g. USDC)."
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "Bump for the market PDA."
            ],
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "docs": [
              "Bump for the vault token account PDA."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "resolved"
          },
          {
            "name": "refunded"
          }
        ]
      }
    },
    {
      "name": "position",
      "docs": [
        "A single bettor's stake in a given market, tracked per outcome."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "bettor",
            "type": "pubkey"
          },
          {
            "name": "stakePerOutcome",
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "predicateSpec",
      "docs": [
        "The on-chain definition of how one outcome is decided against TxODDS score data.",
        "",
        "At resolution we build a TxODDS `TraderPredicate` from `threshold`/`comparison` and feed",
        "`stat_a` (and optionally `stat_b` combined via `op`) into `validate_stat`. Storing this per",
        "outcome at market creation means the relayer can never settle to an outcome whose predicate",
        "does not actually hold against the Merkle-verified score.",
        "",
        "1X2 full-time result (stat_a = home goals, stat_b = away goals, op = Subtract):",
        "- Home win → threshold 0, comparison GreaterThan   ((home - away) > 0)",
        "- Draw     → threshold 0, comparison EqualTo        ((home - away) == 0)",
        "- Away win → threshold 0, comparison LessThan       ((home - away) < 0)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "statAKey",
            "docs": [
              "TxODDS stat key for stat_a (e.g. home-team goals)."
            ],
            "type": "u32"
          },
          {
            "name": "statBKey",
            "docs": [
              "TxODDS stat key for stat_b (e.g. away-team goals); only used when `use_stat_b`."
            ],
            "type": "u32"
          },
          {
            "name": "period",
            "docs": [
              "Match period the stats belong to (e.g. full-time)."
            ],
            "type": "i32"
          },
          {
            "name": "useStatB",
            "docs": [
              "Whether this predicate combines two stats via `op`."
            ],
            "type": "bool"
          },
          {
            "name": "op",
            "docs": [
              "0 = Add, 1 = Subtract (combine stat_a and stat_b). Only meaningful when `use_stat_b`."
            ],
            "type": "u8"
          },
          {
            "name": "threshold",
            "docs": [
              "Comparison threshold."
            ],
            "type": "i32"
          },
          {
            "name": "comparison",
            "docs": [
              "0 = GreaterThan, 1 = LessThan, 2 = EqualTo."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proofNode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "isRightSibling",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "scoreStat",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "u32"
          },
          {
            "name": "value",
            "type": "i32"
          },
          {
            "name": "period",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "scoresBatchSummary",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "updateStats",
            "type": {
              "defined": {
                "name": "scoresUpdateStats"
              }
            }
          },
          {
            "name": "eventsSubTreeRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "scoresUpdateStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateCount",
            "type": "i32"
          },
          {
            "name": "minTimestamp",
            "type": "i64"
          },
          {
            "name": "maxTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "statTerm",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "statToProve",
            "type": {
              "defined": {
                "name": "scoreStat"
              }
            }
          },
          {
            "name": "eventStatRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "statProof",
            "type": {
              "vec": {
                "defined": {
                  "name": "proofNode"
                }
              }
            }
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "marketSeed",
      "docs": [
        "PDA seeds"
      ],
      "type": "bytes",
      "value": "[109, 97, 114, 107, 101, 116]"
    },
    {
      "name": "positionSeed",
      "type": "bytes",
      "value": "[112, 111, 115, 105, 116, 105, 111, 110]"
    },
    {
      "name": "vaultSeed",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    }
  ]
};
