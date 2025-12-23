/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Moment Constants
 * 
 * Moments are the time epochs used by Evernode for:
 * - Billing/payment cycles for leases
 * - Reward distribution periods
 * - Heartbeat intervals for host liveness
 * - Governance voting periods
 */

/**
 * Default moment configuration
 */
export const MOMENT_CONFIG = {
	/** Default moment size in ledger sequences */
	DEFAULT_SIZE: 1800, // Approximately 1 hour at ~2 second ledger close
	
	/** Minimum moment size */
	MIN_SIZE: 60,
	
	/** Maximum moment size */
	MAX_SIZE: 10800,
	
	/** Average ledger close time in seconds */
	AVG_LEDGER_CLOSE_TIME: 2,
} as const;

/**
 * Calculate moment duration in seconds
 */
export function getMomentDurationSeconds(momentSize: number = MOMENT_CONFIG.DEFAULT_SIZE): number {
	return momentSize * MOMENT_CONFIG.AVG_LEDGER_CLOSE_TIME;
}

/**
 * Calculate moment duration in minutes
 */
export function getMomentDurationMinutes(momentSize: number = MOMENT_CONFIG.DEFAULT_SIZE): number {
	return getMomentDurationSeconds(momentSize) / 60;
}

/**
 * Calculate moment duration in hours
 */
export function getMomentDurationHours(momentSize: number = MOMENT_CONFIG.DEFAULT_SIZE): number {
	return getMomentDurationMinutes(momentSize) / 60;
}

/**
 * Calculate approximate ledger sequence for a given moment
 */
export function momentToLedgerSeq(moment: number, baseIndex: number, momentSize: number): number {
	return baseIndex + (moment * momentSize);
}

/**
 * Calculate moment from ledger sequence
 */
export function ledgerSeqToMoment(ledgerSeq: number, baseIndex: number, momentSize: number): number {
	return Math.floor((ledgerSeq - baseIndex) / momentSize);
}

/**
 * Calculate remaining ledgers in current moment
 */
export function getRemainingLedgersInMoment(
	currentLedgerSeq: number,
	baseIndex: number,
	momentSize: number
): number {
	const position = (currentLedgerSeq - baseIndex) % momentSize;
	return momentSize - position;
}

/**
 * Moment transition events
 */
export const MOMENT_EVENTS = {
	MOMENT_CHANGED: 'momentChanged',
	MOMENT_STARTING: 'momentStarting',
	MOMENT_ENDING: 'momentEnding',
} as const;

/**
 * Heartbeat configuration
 */
export const HEARTBEAT_CONFIG = {
	/** Number of moments a host can miss heartbeats before being flagged */
	MAX_MISSED_MOMENTS: 3,
	
	/** Penalty for missing heartbeat (in reputation points) */
	MISSED_HEARTBEAT_PENALTY: 10,
	
	/** Required heartbeats per moment for full rewards */
	REQUIRED_HEARTBEATS_PER_MOMENT: 1,
} as const;
