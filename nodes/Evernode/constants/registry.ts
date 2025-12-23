/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Evernode Registry Constants
 * 
 * Constants related to the Evernode registry system which tracks
 * all registered hosts and manages the network state.
 */

/**
 * Registry state keys used for hook state lookups
 */
export const REGISTRY_STATE_KEYS = {
	HOST_COUNT: 'host_count',
	ACTIVE_HOST_COUNT: 'active_host_count',
	MOMENT_SIZE: 'moment_size',
	MOMENT_BASE_IDX: 'moment_base_idx',
	HOST_REG_FEE: 'host_reg_fee',
	MAX_REG: 'max_reg',
	REWARD_INFO: 'reward_info',
	REWARD_CONFIGURATION: 'reward_config',
	GOVERNANCE_INFO: 'governance_info',
	GOVERNANCE_MODE: 'governance_mode',
	EPOCH_COUNT: 'epoch_count',
} as const;

/**
 * Host registration status values
 */
export const HOST_STATUS = {
	UNREGISTERED: 0,
	REGISTERED: 1,
	ACTIVE: 2,
	INACTIVE: 3,
	DEREGISTERING: 4,
} as const;

/**
 * Governance modes
 */
export const GOVERNANCE_MODE = {
	PILOTED: 0,
	CO_PILOTED: 1,
	AUTO_PILOTED: 2,
} as const;

/**
 * Minimum host requirements
 */
export const HOST_REQUIREMENTS = {
	MIN_RAM_MB: 512,
	MIN_DISK_MB: 1024,
	MIN_CPU_CORES: 1,
	MIN_LEASE_AMOUNT: 1,
	MIN_INSTANCES: 1,
} as const;

/**
 * Registration fee in EVR (may vary by network)
 */
export const REGISTRATION_FEE = {
	MAINNET: 500,
	TESTNET: 50,
} as const;

/**
 * Hook namespace for Evernode operations
 */
export const HOOK_NAMESPACE = 'evernode';

/**
 * Hook parameters
 */
export const HOOK_PARAMS = {
	OPERATION_TYPE: 'OT',
	HOST_ADDRESS: 'HA',
	TOKEN_ID: 'TI',
	AMOUNT: 'AM',
	MOMENT: 'MO',
	LEASE_TOKEN: 'LT',
} as const;

/**
 * Operation types for hook invocations
 */
export const OPERATION_TYPES = {
	HOST_REG: 1,
	HOST_DEREG: 2,
	HOST_UPDATE: 3,
	HEARTBEAT: 4,
	ACQUIRE_LEASE: 5,
	EXTEND_LEASE: 6,
	CLAIM_REWARD: 7,
	GOVERNANCE_VOTE: 8,
} as const;
