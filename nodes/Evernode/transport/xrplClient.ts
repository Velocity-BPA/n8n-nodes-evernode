/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * XRPL/Xahau Client Transport
 * 
 * Handles direct communication with the XRPL/Xahau ledger
 * for low-level operations.
 */

import { IExecuteFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';
import { DEFAULT_TIMEOUT } from '../constants';

/**
 * XRPL network endpoints
 */
export const XRPL_ENDPOINTS = {
	xahauMainnet: {
		ws: 'wss://xahau.network',
		http: 'https://xahau.network',
	},
	xahauTestnet: {
		ws: 'wss://xahau-test.net',
		http: 'https://xahau-test.net',
	},
	xrplMainnet: {
		ws: 'wss://xrplcluster.com',
		http: 'https://xrplcluster.com',
	},
	xrplTestnet: {
		ws: 'wss://testnet.xrpl-labs.com',
		http: 'https://testnet.xrpl-labs.com',
	},
} as const;

/**
 * Get XRPL endpoint URL
 */
export function getXrplEndpoint(network: string, type: 'ws' | 'http' = 'http'): string {
	const endpoints = XRPL_ENDPOINTS[network as keyof typeof XRPL_ENDPOINTS];
	if (!endpoints) {
		throw new Error(`Unknown XRPL network: ${network}`);
	}
	return endpoints[type];
}

/**
 * Get XRPL credentials
 */
export async function getXrplCredentials(
	context: IExecuteFunctions,
	credentialName: string = 'xrplCredentials'
): Promise<ICredentialDataDecryptedObject> {
	return context.getCredentials(credentialName);
}

/**
 * Get HTTP endpoint from credentials
 */
export function getHttpEndpointFromCredentials(credentials: ICredentialDataDecryptedObject): string {
	const network = credentials.network as string;
	
	if (network === 'custom') {
		const wsUrl = credentials.wsUrl as string;
		return wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
	}
	
	return getXrplEndpoint(network, 'http');
}

/**
 * Make XRPL JSON-RPC request
 */
export async function xrplRequest(
	context: IExecuteFunctions,
	endpoint: string,
	method: string,
	params: unknown[] = [{}]
): Promise<unknown> {
	const response = await context.helpers.request({
		method: 'POST',
		url: endpoint,
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
 * Account methods
 */
export const AccountMethods = {
	async getInfo(
		context: IExecuteFunctions,
		endpoint: string,
		address: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'account_info', [{
			account: address,
			ledger_index: 'validated',
		}]);
	},

	async getLines(
		context: IExecuteFunctions,
		endpoint: string,
		address: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'account_lines', [{
			account: address,
			ledger_index: 'validated',
		}]);
	},

	async getOffers(
		context: IExecuteFunctions,
		endpoint: string,
		address: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'account_offers', [{
			account: address,
			ledger_index: 'validated',
		}]);
	},

	async getTransactions(
		context: IExecuteFunctions,
		endpoint: string,
		address: string,
		limit: number = 20
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'account_tx', [{
			account: address,
			ledger_index_min: -1,
			ledger_index_max: -1,
			limit,
			forward: false,
		}]);
	},

	async getObjects(
		context: IExecuteFunctions,
		endpoint: string,
		address: string,
		type?: string
	): Promise<unknown> {
		const params: Record<string, unknown> = {
			account: address,
			ledger_index: 'validated',
		};
		if (type) {
			params.type = type;
		}
		return xrplRequest(context, endpoint, 'account_objects', [params]);
	},
};

/**
 * Ledger methods
 */
export const LedgerMethods = {
	async getCurrent(
		context: IExecuteFunctions,
		endpoint: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'ledger', [{
			ledger_index: 'validated',
			accounts: false,
			full: false,
			transactions: false,
			expand: false,
			owner_funds: false,
		}]);
	},

	async getEntry(
		context: IExecuteFunctions,
		endpoint: string,
		index: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'ledger_entry', [{
			index,
			ledger_index: 'validated',
		}]);
	},
};

/**
 * Server methods
 */
export const ServerMethods = {
	async getInfo(
		context: IExecuteFunctions,
		endpoint: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'server_info', [{}]);
	},

	async getState(
		context: IExecuteFunctions,
		endpoint: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'server_state', [{}]);
	},

	async getFee(
		context: IExecuteFunctions,
		endpoint: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'fee', [{}]);
	},
};

/**
 * Transaction methods
 */
export const TransactionMethods = {
	async submit(
		context: IExecuteFunctions,
		endpoint: string,
		txBlob: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'submit', [{
			tx_blob: txBlob,
		}]);
	},

	async getInfo(
		context: IExecuteFunctions,
		endpoint: string,
		txHash: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'tx', [{
			transaction: txHash,
			binary: false,
		}]);
	},
};

/**
 * Hook state methods (Xahau-specific)
 */
export const HookMethods = {
	async getNamespace(
		context: IExecuteFunctions,
		endpoint: string,
		address: string,
		namespaceId?: string
	): Promise<unknown> {
		const params: Record<string, unknown> = {
			account: address,
			ledger_index: 'validated',
		};
		if (namespaceId) {
			params.namespace_id = namespaceId;
		}
		return xrplRequest(context, endpoint, 'account_namespace', [params]);
	},

	async getState(
		context: IExecuteFunctions,
		endpoint: string,
		hookAccount: string,
		key: string,
		namespaceId: string
	): Promise<unknown> {
		return xrplRequest(context, endpoint, 'ledger_entry', [{
			hook_state: {
				account: hookAccount,
				key,
				namespace_id: namespaceId,
			},
			ledger_index: 'validated',
		}]);
	},
};

/**
 * URI Token methods (used for Evernode leases)
 */
export const UriTokenMethods = {
	async getAll(
		context: IExecuteFunctions,
		endpoint: string,
		address: string
	): Promise<unknown> {
		return AccountMethods.getObjects(context, endpoint, address, 'uri_token');
	},
};

/**
 * Convert drops to XRP
 */
export function dropsToXrp(drops: string | number): number {
	return Number(drops) / 1000000;
}

/**
 * Convert XRP to drops
 */
export function xrpToDrops(xrp: string | number): string {
	return String(Math.floor(Number(xrp) * 1000000));
}
