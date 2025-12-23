/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * EVR Token Constants
 * 
 * Constants related to the EVR (Evers) token which is the native
 * utility token of the Evernode network.
 */

/**
 * EVR token details
 */
export const EVR_TOKEN = {
	CURRENCY_CODE: 'EVR',
	ISSUER_MAINNET: 'rEvernodee8dJLaFsujS6q1EiXvZYmHXr8',
	ISSUER_TESTNET: 'rEvernodee8dJLaFsujS6q1EiXvZYmHXr8',
	DECIMALS: 6,
	TOTAL_SUPPLY: '72000000000', // 72 billion EVR
} as const;

/**
 * XRP/XAH constants
 */
export const NATIVE_TOKEN = {
	DROPS_PER_XRP: 1000000,
	CURRENCY_CODE: 'XAH',
	RESERVE_BASE: 10, // Base reserve in XAH
	RESERVE_INCREMENT: 2, // Reserve increment per object in XAH
} as const;

/**
 * Convert drops to XRP/XAH
 */
export function dropsToXrp(drops: string | number): number {
	return Number(drops) / NATIVE_TOKEN.DROPS_PER_XRP;
}

/**
 * Convert XRP/XAH to drops
 */
export function xrpToDrops(xrp: string | number): string {
	return String(Math.floor(Number(xrp) * NATIVE_TOKEN.DROPS_PER_XRP));
}

/**
 * Convert EVR amount to smallest unit
 */
export function evrToSmallest(evr: string | number): string {
	return String(Math.floor(Number(evr) * Math.pow(10, EVR_TOKEN.DECIMALS)));
}

/**
 * Convert smallest EVR unit to EVR
 */
export function smallestToEvr(smallest: string | number): number {
	return Number(smallest) / Math.pow(10, EVR_TOKEN.DECIMALS);
}

/**
 * Trustline settings for EVR
 */
export const EVR_TRUSTLINE = {
	LIMIT: '72000000000',
	QUALITY_IN: 0,
	QUALITY_OUT: 0,
	FLAGS: 131072, // tfSetNoRipple
} as const;

/**
 * Token amount formatting options
 */
export interface TokenAmount {
	currency: string;
	issuer?: string;
	value: string;
}

/**
 * Create an EVR token amount object
 */
export function createEvrAmount(value: string | number, network: 'mainnet' | 'testnet' = 'mainnet'): TokenAmount {
	return {
		currency: EVR_TOKEN.CURRENCY_CODE,
		issuer: network === 'mainnet' ? EVR_TOKEN.ISSUER_MAINNET : EVR_TOKEN.ISSUER_TESTNET,
		value: String(value),
	};
}
