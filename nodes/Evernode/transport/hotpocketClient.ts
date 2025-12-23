/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * HotPocket Client Transport
 * 
 * Handles communication with HotPocket smart contract nodes.
 * HotPocket is Evernode's consensus engine for running decentralized
 * applications with deterministic execution.
 */

import { IExecuteFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';

/**
 * HotPocket connection status
 */
export enum ConnectionStatus {
	DISCONNECTED = 'disconnected',
	CONNECTING = 'connecting',
	CONNECTED = 'connected',
	ERROR = 'error',
}

/**
 * HotPocket message types
 */
export const MESSAGE_TYPES = {
	USER_INPUT: 'user_input',
	USER_OUTPUT: 'user_output',
	CONTRACT_READ: 'contract_read',
	CONTRACT_READ_RESULT: 'contract_read_result',
	STAT: 'stat',
	ERROR: 'error',
} as const;

/**
 * HotPocket input result status
 */
export enum InputStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	REJECTED = 'rejected',
	EXECUTED = 'executed',
}

/**
 * HotPocket contract state
 */
export interface ContractState {
	ledgerSeq: number;
	round: number;
	timestamp: number;
	data?: unknown;
}

/**
 * HotPocket user output
 */
export interface UserOutput {
	outputId: string;
	data: unknown;
	timestamp: number;
	ledgerSeq: number;
}

/**
 * HotPocket node info
 */
export interface NodeInfo {
	publicKey: string;
	version: string;
	ledgerSeq: number;
	round: number;
	peers: number;
	unlCount: number;
	contractId?: string;
}

/**
 * Get HotPocket credentials
 */
export async function getHotPocketCredentials(
	context: IExecuteFunctions,
	credentialName: string = 'hotPocket'
): Promise<ICredentialDataDecryptedObject> {
	return context.getCredentials(credentialName);
}

/**
 * Format HotPocket user input message
 */
export function formatUserInput(
	publicKey: string,
	data: unknown,
	nonce?: string
): {
	type: string;
	publicKey: string;
	data: string;
	nonce: string;
	signature?: string;
} {
	const inputData = typeof data === 'string' ? data : JSON.stringify(data);
	const inputNonce = nonce || Date.now().toString();
	
	return {
		type: MESSAGE_TYPES.USER_INPUT,
		publicKey,
		data: Buffer.from(inputData).toString('base64'),
		nonce: inputNonce,
	};
}

/**
 * Parse HotPocket user output
 */
export function parseUserOutput(message: {
	type: string;
	data: string;
	outputId?: string;
	timestamp?: number;
	ledgerSeq?: number;
}): UserOutput {
	let data: unknown;
	try {
		const decoded = Buffer.from(message.data, 'base64').toString('utf8');
		data = JSON.parse(decoded);
	} catch {
		data = message.data;
	}
	
	return {
		outputId: message.outputId || '',
		data,
		timestamp: message.timestamp || Date.now(),
		ledgerSeq: message.ledgerSeq || 0,
	};
}

/**
 * Format contract read request
 */
export function formatContractReadRequest(
	key: string,
	options?: {
		prefix?: boolean;
		limit?: number;
	}
): {
	type: string;
	key: string;
	prefix?: boolean;
	limit?: number;
} {
	return {
		type: MESSAGE_TYPES.CONTRACT_READ,
		key,
		...options,
	};
}

/**
 * HotPocket connection configuration
 */
export interface HotPocketConfig {
	nodeUrl: string;
	userPrivateKey: string;
	userPublicKey: string;
	contractAddress?: string;
	timeout?: number;
	autoReconnect?: boolean;
}

/**
 * Get HotPocket config from credentials
 */
export function getHotPocketConfigFromCredentials(
	credentials: ICredentialDataDecryptedObject
): HotPocketConfig {
	return {
		nodeUrl: credentials.nodeUrl as string,
		userPrivateKey: credentials.userPrivateKey as string,
		userPublicKey: credentials.userPublicKey as string,
		contractAddress: credentials.contractAddress as string || undefined,
		timeout: (credentials.timeout as number) || 30000,
		autoReconnect: credentials.autoReconnect !== false,
	};
}

/**
 * NPL (Node Party Line) message format
 * NPL is used for node-to-node communication in HotPocket
 */
export interface NplMessage {
	type: 'npl';
	roundNumber: number;
	content: unknown;
	sender: string;
	timestamp: number;
}

/**
 * Format NPL message
 */
export function formatNplMessage(
	content: unknown,
	roundNumber: number,
	sender: string
): NplMessage {
	return {
		type: 'npl',
		roundNumber,
		content,
		sender,
		timestamp: Date.now(),
	};
}

/**
 * UNL (Unique Node List) info
 */
export interface UnlInfo {
	nodes: {
		publicKey: string;
		active: boolean;
		lastSeen: number;
	}[];
	quorum: number;
	totalNodes: number;
	activeNodes: number;
}

/**
 * Contract consensus info
 */
export interface ConsensusInfo {
	round: number;
	ledgerSeq: number;
	proposers: string[];
	validators: string[];
	status: 'proposing' | 'validating' | 'closing' | 'closed';
	timestamp: number;
}

/**
 * Validate ed25519 key format
 */
export function isValidEd25519Key(key: string): boolean {
	// Check if it's a valid hex string of correct length
	const hexRegex = /^[0-9a-fA-F]{64}$/;
	if (hexRegex.test(key)) {
		return true;
	}
	
	// Check if it's valid base64 of correct decoded length
	try {
		const decoded = Buffer.from(key, 'base64');
		return decoded.length === 32;
	} catch {
		return false;
	}
}

/**
 * Convert hex to base64
 */
export function hexToBase64(hex: string): string {
	return Buffer.from(hex, 'hex').toString('base64');
}

/**
 * Convert base64 to hex
 */
export function base64ToHex(base64: string): string {
	return Buffer.from(base64, 'base64').toString('hex');
}
