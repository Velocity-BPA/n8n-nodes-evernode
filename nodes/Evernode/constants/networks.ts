/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Evernode Network Constants
 * 
 * Network configurations for Evernode mainnet and testnet.
 * These values are sourced from the official Evernode documentation
 * and the evernode-js-client library.
 */

export interface NetworkConfig {
	name: string;
	xrplWsUrl: string;
	xrplHttpUrl: string;
	governorAddress: string;
	registryAddress: string;
	heartbeatAddress: string;
	foundationAddress: string;
	evrIssuer: string;
	evrCurrency: string;
}

/**
 * Evernode Mainnet Configuration
 */
export const MAINNET_CONFIG: NetworkConfig = {
	name: 'mainnet',
	xrplWsUrl: 'wss://xahau.network',
	xrplHttpUrl: 'https://xahau.network',
	governorAddress: 'rGVHr1PrfL93UAjyw3DWZvqvjgNQxZuLMx',
	registryAddress: 'rHktfGUbjqzU4GsYCMc1pDjdHXb5CJamto',
	heartbeatAddress: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
	foundationAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
	evrIssuer: 'rEvernodee8dJLaFsujS6q1EiXvZYmHXr8',
	evrCurrency: 'EVR',
};

/**
 * Evernode Testnet Configuration
 */
export const TESTNET_CONFIG: NetworkConfig = {
	name: 'testnet',
	xrplWsUrl: 'wss://xahau-test.net',
	xrplHttpUrl: 'https://xahau-test.net',
	governorAddress: 'rBvKgF3jSZWdJcwSsmoJspoXLLDVLDp6jg',
	registryAddress: 'rQUhXd7sopuga3taru3jfvc1BgVbscrb1X',
	heartbeatAddress: 'rDV6mWgCPLfWRhXBLJ8paEGimmCLbUAugh',
	foundationAddress: 'rEVt7QAhD1u3d9U7m4W6LxH8Y3DpvdqnGQ',
	evrIssuer: 'rEvernodee8dJLaFsujS6q1EiXvZYmHXr8',
	evrCurrency: 'EVR',
};

/**
 * Get network configuration by name
 */
export function getNetworkConfig(network: string): NetworkConfig {
	switch (network.toLowerCase()) {
		case 'mainnet':
			return MAINNET_CONFIG;
		case 'testnet':
			return TESTNET_CONFIG;
		default:
			throw new Error(`Unknown network: ${network}`);
	}
}

/**
 * Supported networks list
 */
export const SUPPORTED_NETWORKS = ['mainnet', 'testnet', 'custom'] as const;
export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

/**
 * Default network timeout in milliseconds
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Default number of retries for network operations
 */
export const DEFAULT_RETRIES = 3;

/**
 * WebSocket reconnect delay in milliseconds
 */
export const RECONNECT_DELAY = 5000;
