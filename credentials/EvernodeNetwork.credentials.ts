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
 * Evernode Network Credentials
 * 
 * Provides authentication for the Evernode decentralized hosting network.
 * Evernode operates on top of the XRPL/Xahau ledger using the EVR token.
 * 
 * Supported networks:
 * - Mainnet: Production Evernode network
 * - Testnet: Testing environment for development
 * - Custom: User-defined endpoints for private networks
 */
export class EvernodeNetwork implements ICredentialType {
	name = 'evernodeNetwork';
	displayName = 'Evernode Network';
	documentationUrl = 'https://docs.evernode.org';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
					description: 'Evernode production network',
				},
				{
					name: 'Testnet',
					value: 'testnet',
					description: 'Evernode test network for development',
				},
				{
					name: 'Custom',
					value: 'custom',
					description: 'Custom network endpoint',
				},
			],
			default: 'mainnet',
			description: 'The Evernode network to connect to',
		},
		{
			displayName: 'XRPL WebSocket URL',
			name: 'xrplWsUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://xahau.network',
			description: 'WebSocket URL for the underlying XRPL/Xahau ledger',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Registry Address',
			name: 'registryAddress',
			type: 'string',
			default: '',
			placeholder: 'rHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			description: 'Evernode registry contract address',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Governor Address',
			name: 'governorAddress',
			type: 'string',
			default: '',
			placeholder: 'rGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			description: 'Evernode governor hook address',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Heartbeat Address',
			name: 'heartbeatAddress',
			type: 'string',
			default: '',
			placeholder: 'rHBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			description: 'Evernode heartbeat hook address',
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
			description: 'Your XRPL wallet seed (secret). Required for transactions.',
		},
		{
			displayName: 'Wallet Mnemonic',
			name: 'walletMnemonic',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'word1 word2 word3 ...',
			description: 'Optional: 12 or 24 word mnemonic phrase (alternative to seed)',
		},
		{
			displayName: 'Account Type',
			name: 'accountType',
			type: 'options',
			options: [
				{
					name: 'General',
					value: 'general',
					description: 'General account for queries and basic operations',
				},
				{
					name: 'Host',
					value: 'host',
					description: 'Host operator account providing compute resources',
				},
				{
					name: 'Tenant',
					value: 'tenant',
					description: 'Tenant account renting compute resources',
				},
			],
			default: 'general',
			description: 'The type of Evernode account',
		},
		{
			displayName: 'Host Account',
			name: 'hostAccount',
			type: 'string',
			default: '',
			placeholder: 'rHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			description: 'Host account address (for host-specific operations)',
			displayOptions: {
				show: {
					accountType: ['host'],
				},
			},
		},
		{
			displayName: 'Tenant Account',
			name: 'tenantAccount',
			type: 'string',
			default: '',
			placeholder: 'rTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			description: 'Tenant account address (for tenant-specific operations)',
			displayOptions: {
				show: {
					accountType: ['tenant'],
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://xahau.network" : $credentials.network === "testnet" ? "https://xahau-test.net" : $credentials.xrplWsUrl}}',
			url: '/',
			method: 'POST',
			body: {
				method: 'server_info',
				params: [{}],
			},
		},
	};
}
