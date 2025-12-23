/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Evernode Client Transport
 * 
 * Handles communication with the Evernode network using the
 * official evernode-js-client library.
 */

import { IExecuteFunctions, ILoadOptionsFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';
import { getNetworkConfig, NetworkConfig, DEFAULT_TIMEOUT } from '../constants';

/**
 * Interface for Evernode client initialization options
 */
export interface EvernodeClientOptions {
	network: string;
	walletSeed?: string;
	walletMnemonic?: string;
	customConfig?: Partial<NetworkConfig>;
	timeout?: number;
}

/**
 * Interface for host information
 */
export interface HostInfo {
	address: string;
	domain: string;
	cpuCount: number;
	cpuSpeed: number;
	cpuModel: string;
	ramMb: number;
	diskMb: number;
	description: string;
	registeredAt: number;
	lastHeartbeat: number;
	active: boolean;
	instanceCount: number;
	maxInstances: number;
	leaseAmount: string;
	reputation: number;
	countryCode: string;
	version: string;
}

/**
 * Interface for lease information
 */
export interface LeaseInfo {
	tokenId: string;
	hostAddress: string;
	tenantAddress: string;
	createdAt: number;
	expiresAt: number;
	leaseAmount: string;
	instanceCount: number;
	status: string;
}

/**
 * Interface for instance information
 */
export interface InstanceInfo {
	instanceId: string;
	hostAddress: string;
	tenantAddress: string;
	status: string;
	publicKey: string;
	createdAt: number;
	lastActive: number;
	config: Record<string, unknown>;
}

/**
 * Get Evernode credentials from the n8n context
 */
export async function getEvernodeCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	credentialName: string = 'evernodeNetwork'
): Promise<ICredentialDataDecryptedObject> {
	return context.getCredentials(credentialName);
}

/**
 * Get network configuration based on credentials
 */
export function getNetworkConfigFromCredentials(
	credentials: ICredentialDataDecryptedObject
): NetworkConfig {
	const network = credentials.network as string;
	
	if (network === 'custom') {
		return {
			name: 'custom',
			xrplWsUrl: credentials.xrplWsUrl as string,
			xrplHttpUrl: (credentials.xrplWsUrl as string).replace('wss://', 'https://').replace('ws://', 'http://'),
			governorAddress: credentials.governorAddress as string || '',
			registryAddress: credentials.registryAddress as string || '',
			heartbeatAddress: credentials.heartbeatAddress as string || '',
			foundationAddress: '',
			evrIssuer: 'rEvernodee8dJLaFsujS6q1EiXvZYmHXr8',
			evrCurrency: 'EVR',
		};
	}
	
	return getNetworkConfig(network);
}

/**
 * Initialize Evernode client with credentials
 */
export async function initializeEvernodeClient(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	options?: Partial<EvernodeClientOptions>
): Promise<{
	config: NetworkConfig;
	walletSeed?: string;
	connected: boolean;
}> {
	const credentials = await getEvernodeCredentials(context);
	const config = getNetworkConfigFromCredentials(credentials);
	const walletSeed = credentials.walletSeed as string || undefined;
	
	return {
		config,
		walletSeed,
		connected: true,
	};
}

/**
 * Make an HTTP request to the XRPL/Xahau network
 */
export async function makeXrplRequest(
	context: IExecuteFunctions,
	config: NetworkConfig,
	method: string,
	params: unknown[] = [{}]
): Promise<unknown> {
	const response = await context.helpers.request({
		method: 'POST',
		url: config.xrplHttpUrl,
		body: {
			method,
			params,
		},
		json: true,
		timeout: DEFAULT_TIMEOUT,
	});
	
	if (response.result?.error) {
		throw new Error(`XRPL Error: ${response.result.error_message || response.result.error}`);
	}
	
	return response.result;
}

/**
 * Get account info from the ledger
 */
export async function getAccountInfo(
	context: IExecuteFunctions,
	config: NetworkConfig,
	address: string
): Promise<unknown> {
	return makeXrplRequest(context, config, 'account_info', [{
		account: address,
		ledger_index: 'validated',
	}]);
}

/**
 * Get account trustlines
 */
export async function getAccountLines(
	context: IExecuteFunctions,
	config: NetworkConfig,
	address: string
): Promise<unknown> {
	return makeXrplRequest(context, config, 'account_lines', [{
		account: address,
		ledger_index: 'validated',
	}]);
}

/**
 * Get account transactions
 */
export async function getAccountTransactions(
	context: IExecuteFunctions,
	config: NetworkConfig,
	address: string,
	limit: number = 20
): Promise<unknown> {
	return makeXrplRequest(context, config, 'account_tx', [{
		account: address,
		ledger_index_min: -1,
		ledger_index_max: -1,
		limit,
		forward: false,
	}]);
}

/**
 * Get server info
 */
export async function getServerInfo(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<unknown> {
	return makeXrplRequest(context, config, 'server_info', [{}]);
}

/**
 * Get current ledger info
 */
export async function getLedgerInfo(
	context: IExecuteFunctions,
	config: NetworkConfig
): Promise<unknown> {
	return makeXrplRequest(context, config, 'ledger', [{
		ledger_index: 'validated',
		accounts: false,
		full: false,
		transactions: false,
		expand: false,
		owner_funds: false,
	}]);
}

/**
 * Get hook state for an account
 */
export async function getHookState(
	context: IExecuteFunctions,
	config: NetworkConfig,
	address: string,
	namespace?: string
): Promise<unknown> {
	const params: Record<string, unknown> = {
		account: address,
		ledger_index: 'validated',
	};
	
	if (namespace) {
		params.namespace_id = namespace;
	}
	
	return makeXrplRequest(context, config, 'account_namespace', [params]);
}

/**
 * Submit a signed transaction
 */
export async function submitTransaction(
	context: IExecuteFunctions,
	config: NetworkConfig,
	txBlob: string
): Promise<unknown> {
	return makeXrplRequest(context, config, 'submit', [{
		tx_blob: txBlob,
	}]);
}

/**
 * Validate an XRPL/Xahau address
 */
export function isValidXrplAddress(address: string): boolean {
	// Basic validation - starts with 'r' and is base58 encoded
	if (!address || !address.startsWith('r')) {
		return false;
	}
	
	const base58Regex = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;
	return base58Regex.test(address);
}

/**
 * Parse EVR amount from ledger format
 */
export function parseEvrAmount(amount: string | { value: string; currency: string; issuer: string }): string {
	if (typeof amount === 'string') {
		return amount;
	}
	return amount.value;
}

/**
 * Format EVR amount for display
 */
export function formatEvrAmount(amount: string, decimals: number = 6): string {
	const num = parseFloat(amount);
	return num.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals,
	});
}
