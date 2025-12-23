/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Governance Constants
 * 
 * Evernode uses a governance system for network parameter changes,
 * host performance monitoring, and protocol upgrades.
 */

/**
 * Governance modes
 */
export const GOVERNANCE_MODES = {
	/** Foundation has full control */
	PILOTED: 0,
	/** Foundation and community share control */
	CO_PILOTED: 1,
	/** Fully community governed */
	AUTO_PILOTED: 2,
} as const;

export type GovernanceMode = typeof GOVERNANCE_MODES[keyof typeof GOVERNANCE_MODES];

/**
 * Proposal types
 */
export const PROPOSAL_TYPES = {
	/** Change network parameter */
	PARAMETER_CHANGE: 1,
	/** Hook code update */
	HOOK_UPDATE: 2,
	/** Dud host removal */
	DUD_HOST_REMOVAL: 3,
	/** Foundation withdrawal */
	FOUNDATION_WITHDRAWAL: 4,
	/** Reward pool change */
	REWARD_POOL_CHANGE: 5,
} as const;

export type ProposalType = typeof PROPOSAL_TYPES[keyof typeof PROPOSAL_TYPES];

/**
 * Proposal status
 */
export const PROPOSAL_STATUS = {
	PENDING: 0,
	ACTIVE: 1,
	PASSED: 2,
	REJECTED: 3,
	EXECUTED: 4,
	EXPIRED: 5,
} as const;

export type ProposalStatus = typeof PROPOSAL_STATUS[keyof typeof PROPOSAL_STATUS];

/**
 * Voting configuration
 */
export const VOTING_CONFIG = {
	/** Minimum percentage of votes required for quorum */
	QUORUM_PERCENTAGE: 30,
	
	/** Percentage of votes required to pass */
	PASS_PERCENTAGE: 51,
	
	/** Voting period in moments */
	VOTING_PERIOD_MOMENTS: 720, // ~30 days
	
	/** Grace period after voting ends (in moments) */
	GRACE_PERIOD_MOMENTS: 24, // ~1 day
} as const;

/**
 * Governance parameters that can be changed
 */
export const GOVERNABLE_PARAMS = {
	MOMENT_SIZE: 'moment_size',
	HOST_REG_FEE: 'host_reg_fee',
	MAX_HOST_REG: 'max_host_reg',
	REWARD_RATE: 'reward_rate',
	MIN_LEASE_AMOUNT: 'min_lease_amount',
	HEARTBEAT_FREQ: 'heartbeat_freq',
} as const;

/**
 * Dud host configuration
 * Dud hosts are hosts that fail to meet performance requirements
 */
export const DUD_HOST_CONFIG = {
	/** Minimum reputation score to avoid dud status */
	MIN_REPUTATION_SCORE: 20,
	
	/** Maximum consecutive missed heartbeats */
	MAX_MISSED_HEARTBEATS: 10,
	
	/** Penalty period in moments */
	PENALTY_PERIOD_MOMENTS: 168, // ~1 week
	
	/** Number of reports required to flag a host */
	REQUIRED_REPORTS: 3,
} as const;

/**
 * Foundation multisig configuration
 */
export const FOUNDATION_CONFIG = {
	/** Required signatures for foundation operations */
	REQUIRED_SIGNATURES: 3,
	
	/** Total foundation signers */
	TOTAL_SIGNERS: 5,
	
	/** Maximum withdrawal per period in EVR */
	MAX_WITHDRAWAL_PER_PERIOD: 1000000,
} as const;
