/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * HotPocket Credentials
 * 
 * Provides authentication for HotPocket smart contract nodes.
 * HotPocket is the consensus engine that powers Evernode smart contracts.
 * 
 * Each HotPocket instance runs a deterministic contract that achieves
 * consensus across multiple nodes (UNL - Unique Node List).
 * 
 * Communication with HotPocket nodes uses WebSocket connections
 * and requires ed25519 key pairs for user authentication.
 */
export class HotPocket implements ICredentialType {
	name = 'hotPocket';
	displayName = 'HotPocket';
	documentationUrl = 'https://docs.evernode.org';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Node URL',
			name: 'nodeUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://your-hotpocket-node.com:8080',
			required: true,
			description: 'WebSocket URL of the HotPocket node',
		},
		{
			displayName: 'User Private Key',
			name: 'userPrivateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'ed25519 private key (hex or base64)',
			required: true,
			description: 'Your ed25519 private key for contract authentication',
		},
		{
			displayName: 'User Public Key',
			name: 'userPublicKey',
			type: 'string',
			default: '',
			placeholder: 'ed25519 public key (hex or base64)',
			required: true,
			description: 'Your ed25519 public key (must match private key)',
		},
		{
			displayName: 'Contract Address',
			name: 'contractAddress',
			type: 'string',
			default: '',
			placeholder: 'Contract identifier or address',
			description: 'The HotPocket contract address/identifier',
		},
		{
			displayName: 'Connection Timeout (ms)',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
		{
			displayName: 'Auto Reconnect',
			name: 'autoReconnect',
			type: 'boolean',
			default: true,
			description: 'Whether to automatically reconnect on connection loss',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
}
