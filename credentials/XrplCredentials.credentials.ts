/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * XRPL/Xahau Credentials
 * 
 * Provides authentication for direct XRPL/Xahau ledger operations.
 * Used for low-level ledger interactions that bypass Evernode abstractions.
 * 
 * The Xahau network is a sidechain of XRPL that supports hooks (smart contracts)
 * and is the underlying ledger for Evernode.
 */
export class XrplCredentials implements ICredentialType {
	name = 'xrplCredentials';
	displayName = 'XRPL/Xahau Credentials';
	documentationUrl = 'https://xrpl.org/docs';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Xahau Mainnet',
					value: 'xahauMainnet',
					description: 'Xahau mainnet (Evernode production)',
				},
				{
					name: 'Xahau Testnet',
					value: 'xahauTestnet',
					description: 'Xahau testnet for development',
				},
				{
					name: 'XRPL Mainnet',
					value: 'xrplMainnet',
					description: 'XRPL mainnet',
				},
				{
					name: 'XRPL Testnet',
					value: 'xrplTestnet',
					description: 'XRPL testnet',
				},
				{
					name: 'Custom',
					value: 'custom',
					description: 'Custom network endpoint',
				},
			],
			default: 'xahauMainnet',
			description: 'The ledger network to connect to',
		},
		{
			displayName: 'WebSocket URL',
			name: 'wsUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://xahau.network',
			description: 'WebSocket URL for the ledger',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Wallet Seed',
			name: 'walletSeed',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'Your wallet secret seed. Required for signing transactions.',
		},
		{
			displayName: 'Regular Key',
			name: 'regularKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional: Regular key for signing (alternative to master key)',
		},
		{
			displayName: 'Account Address',
			name: 'accountAddress',
			type: 'string',
			default: '',
			placeholder: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'Your account address (derived from seed if not provided)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "xahauMainnet" ? "https://xahau.network" : $credentials.network === "xahauTestnet" ? "https://xahau-test.net" : $credentials.network === "xrplMainnet" ? "https://xrplcluster.com" : $credentials.network === "xrplTestnet" ? "https://testnet.xrpl-labs.com" : $credentials.wsUrl}}',
			url: '/',
			method: 'POST',
			body: {
				method: 'server_info',
				params: [{}],
			},
		},
	};
}
