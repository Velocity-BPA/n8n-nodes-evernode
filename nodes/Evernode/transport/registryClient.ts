/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Evernode Registry Client
 * 
 * Handles interactions with the Evernode registry hooks
 * which manage host registrations and network state.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { NetworkConfig, HOST_STATUS, GOVERNANCE_MODE } from '../constants';
import { makeXrplRequest, getHookState } from './evernodeClient';

/**
 * Registry host entry
 */
export interface RegistryHost {
	address: string;
	token: string;
	countryCode: string;
	cpuMicrosec: number;
	ramMb: number;
	diskMb: number;
	totalInstanceCount: number;
	activeInstances: number;
	lastHeartbeatLedger: number;
	version: string;
	registrationLedger: number;
	registrationFee: string;
	emailHash: string;
	description: string;
	leaseAmount: string;
	reputation: number;
	status: number;
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
	hostCount: number;
	activeHostCount: number;
	momentSize: number;
	momentBaseIdx: number;
	hostRegFee: string;
	maxReg: number;
	rewardInfo: {
		epoch: number;
		rewardPool: string;
		rewardQuota: string;
	};
	governanceMode: number;
}

/**
 * Parse host data from hook state
 */
export function parseHostData(hexData: string): Partial<RegistryHost> {
	// Host data is stored in a specific binary format in hook state
	// This is a simplified parser - full implementation would decode all fields
	const buffer = Buffer.from(hexData, 'hex');
	
	return {
		// Parse fields based on Evernode hook state format
		// Actual implementation depends on the specific hook version
		status: buffer.readUInt8(0),
	};
}

/**
 * Get all registered hosts
 */
export async function getRegisteredHosts(
	context: IExecuteFunctions,
	config: NetworkConfig,
	options?: {
		active?: boolean;
		limit?: number;
		marker?: string;
	}
): Promise<{
	hosts: Partial<RegistryHost>[];
	marker?: string;
}> {
	const result = await getHookState(context, config, config.registryAddress);
	
	const hosts: Partial<RegistryHost>[] = [];
	const stateEntries = (result as any)?.namespace_entries || [];
	
	for (const entry of stateEntries) {
		try {
			const host = parseHostData(entry.HookStateData);
			if (options?.active && host.status !== HOST_STATUS.ACTIVE) {
				continue;
			}
			hosts.push(host);
		} catch (e) {
			// Skip entries that don't parse as hosts
		}
	}
	
	const limit = options?.limit || 100;
	return {
		hosts: hosts.slice(0, limit),
		marker: hosts.length > limit ? 'more' : undefined,
	};
}

/**
 * Get host by address
 */
export async function getHostByAddress(
	context: IExecuteFunctions,
	config: NetworkConfig,
	hostAddress: string
): Promise<Partial<RegistryHost> | null> {
	try {
		// Query account objects for the host's registration token
		const result = await makeXrplRequest(context, config, 'account_objects', [{
			account: hostAddress,
			type: 'uri_token',
			ledger_index: 'validated',
		}]);
		
		const objects = (result as any)?.account_objects || [];
		const hostToken = objects.find((obj: any) => 
			obj.Issuer === config.registryAddress
		);
		
		if (!hostToken) {
			return null;
		}
		
		return {
			address: hostAddress,
			token: hostToken.index,
			// Additional fields would be parsed from hook state
		};
	} catch (e) {
		return null;
	}
}

/**
 * Get host count
 */
export async function getHostCount(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<{
	total: number;
	active: number;
}> {
	// This would query the specific hook state keys for counts
	// Simplified implementation
	const result = await getHookState(context, config, config.registryAddress);
	
	return {
		total: 0, // Would parse from hook state
		active: 0,
	};
}

/**
 * Get registry configuration
 */
export async function getRegistryConfig(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<Partial<RegistryConfig>> {
	const hookState = await getHookState(context, config, config.governorAddress);
	
	// Parse configuration from hook state
	// Actual implementation depends on hook state format
	return {
		momentSize: 1800, // Default
		governanceMode: GOVERNANCE_MODE.PILOTED,
	};
}

/**
 * Get current moment info
 */
export async function getCurrentMoment(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<{
	moment: number;
	ledgerSeq: number;
	remainingLedgers: number;
}> {
	const ledgerResult = await makeXrplRequest(context, config, 'ledger', [{
		ledger_index: 'validated',
	}]);
	
	const currentLedger = (ledgerResult as any)?.ledger_index || 0;
	const registryConfig = await getRegistryConfig(context, config);
	const momentSize = registryConfig.momentSize || 1800;
	const baseIndex = registryConfig.momentBaseIdx || 0;
	
	const moment = Math.floor((currentLedger - baseIndex) / momentSize);
	const remainingLedgers = momentSize - ((currentLedger - baseIndex) % momentSize);
	
	return {
		moment,
		ledgerSeq: currentLedger,
		remainingLedgers,
	};
}

/**
 * Get reward info
 */
export async function getRewardInfo(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<{
	epoch: number;
	rewardPool: string;
	distributedRewards: string;
	pendingRewards: string;
}> {
	// Query reward-related hook state
	const hookState = await getHookState(context, config, config.governorAddress);
	
	return {
		epoch: 0,
		rewardPool: '0',
		distributedRewards: '0',
		pendingRewards: '0',
	};
}

/**
 * Get governance info
 */
export async function getGovernanceInfo(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<{
	mode: number;
	foundationAddress: string;
	proposalCount: number;
	activeProposals: number;
}> {
	const hookState = await getHookState(context, config, config.governorAddress);
	
	return {
		mode: GOVERNANCE_MODE.PILOTED,
		foundationAddress: config.foundationAddress,
		proposalCount: 0,
		activeProposals: 0,
	};
}

/**
 * Validate host requirements
 */
export function validateHostRequirements(specs: {
	cpuCount: number;
	ramMb: number;
	diskMb: number;
}): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];
	
	if (specs.cpuCount < 1) {
		errors.push('CPU count must be at least 1');
	}
	if (specs.ramMb < 512) {
		errors.push('RAM must be at least 512 MB');
	}
	if (specs.diskMb < 1024) {
		errors.push('Disk space must be at least 1024 MB');
	}
	
	return {
		valid: errors.length === 0,
		errors,
	};
}
