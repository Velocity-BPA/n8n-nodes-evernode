/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Evernode Utilities
 * 
 * Helper functions for common Evernode operations.
 */

import { getMomentDurationHours, MOMENT_CONFIG } from '../constants';

// ============================================
// LEASE UTILITIES
// ============================================

export const LEASE_STATUS = {
	PENDING: 'pending',
	ACTIVE: 'active',
	EXPIRING: 'expiring',
	EXPIRED: 'expired',
	TERMINATED: 'terminated',
} as const;

export type LeaseStatus = typeof LEASE_STATUS[keyof typeof LEASE_STATUS];

export function calculateLeaseCost(params: {
	leaseAmount: string | number;
	moments: number;
	instanceCount?: number;
}): { totalCost: string; costPerMoment: string; costPerInstance: string } {
	const leaseAmount = Number(params.leaseAmount);
	const moments = params.moments;
	const instanceCount = params.instanceCount || 1;
	
	const costPerInstance = leaseAmount;
	const costPerMoment = costPerInstance * instanceCount;
	const totalCost = costPerMoment * moments;
	
	return {
		totalCost: totalCost.toFixed(6),
		costPerMoment: costPerMoment.toFixed(6),
		costPerInstance: costPerInstance.toFixed(6),
	};
}

export function calculateLeaseDuration(moments: number, momentSize?: number): {
	moments: number;
	hours: number;
	days: number;
	humanReadable: string;
} {
	const hours = getMomentDurationHours(momentSize) * moments;
	const days = hours / 24;
	
	let humanReadable: string;
	if (days >= 1) {
		humanReadable = `${days.toFixed(1)} days`;
	} else if (hours >= 1) {
		humanReadable = `${hours.toFixed(1)} hours`;
	} else {
		humanReadable = `${(hours * 60).toFixed(0)} minutes`;
	}
	
	return { moments, hours, days, humanReadable };
}

export function determineLeaseStatus(
	currentMoment: number,
	expiryMoment: number,
	warningMoments: number = 24
): LeaseStatus {
	if (currentMoment >= expiryMoment) return LEASE_STATUS.EXPIRED;
	if (currentMoment >= expiryMoment - warningMoments) return LEASE_STATUS.EXPIRING;
	return LEASE_STATUS.ACTIVE;
}

export function validateLeaseParams(params: {
	moments: number;
	instanceCount: number;
	hostAddress?: string;
}): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	if (params.moments < 1) errors.push('Lease duration must be at least 1 moment');
	if (params.moments > 43200) errors.push('Lease duration cannot exceed 30 days');
	if (params.instanceCount < 1) errors.push('Instance count must be at least 1');
	if (params.instanceCount > 100) errors.push('Instance count cannot exceed 100');
	if (params.hostAddress && !params.hostAddress.startsWith('r')) {
		errors.push('Invalid host address format');
	}
	
	return { valid: errors.length === 0, errors };
}

// ============================================
// REPUTATION UTILITIES
// ============================================

export const REPUTATION_TIERS = {
	EXCELLENT: { min: 90, max: 100, label: 'Excellent' },
	GOOD: { min: 70, max: 89, label: 'Good' },
	FAIR: { min: 50, max: 69, label: 'Fair' },
	POOR: { min: 20, max: 49, label: 'Poor' },
	CRITICAL: { min: 0, max: 19, label: 'Critical' },
} as const;

export function getReputationTier(score: number): { tier: string; label: string; color: string } {
	if (score >= 90) return { tier: 'EXCELLENT', label: 'Excellent', color: 'green' };
	if (score >= 70) return { tier: 'GOOD', label: 'Good', color: 'blue' };
	if (score >= 50) return { tier: 'FAIR', label: 'Fair', color: 'yellow' };
	if (score >= 20) return { tier: 'POOR', label: 'Poor', color: 'orange' };
	return { tier: 'CRITICAL', label: 'Critical', color: 'red' };
}

export function calculateUptimePercentage(totalMoments: number, activeMoments: number): number {
	if (totalMoments === 0) return 0;
	return Math.min(100, (activeMoments / totalMoments) * 100);
}

export function meetsMinimumReputation(score: number, minimumScore: number = 20): {
	meets: boolean;
	deficit: number;
} {
	return {
		meets: score >= minimumScore,
		deficit: Math.max(0, minimumScore - score),
	};
}

// ============================================
// PRICING UTILITIES
// ============================================

export interface HostPricing {
	address: string;
	leaseAmount: string;
	currency: string;
	cpuCount: number;
	ramMb: number;
	diskMb: number;
	countryCode: string;
}

export function calculateHourlyRate(leaseAmount: string | number, momentSize?: number): number {
	const amount = parseFloat(String(leaseAmount));
	const hoursPerMoment = getMomentDurationHours(momentSize);
	return amount / hoursPerMoment;
}

export function calculateDailyRate(leaseAmount: string | number, momentSize?: number): number {
	return calculateHourlyRate(leaseAmount, momentSize) * 24;
}

export function calculateMonthlyRate(leaseAmount: string | number, momentSize?: number): number {
	return calculateDailyRate(leaseAmount, momentSize) * 30;
}

export function compareHostPrices(hosts: HostPricing[], sortBy: 'price' | 'pricePerCpu' = 'price'): HostPricing[] {
	return [...hosts].sort((a, b) => {
		if (sortBy === 'pricePerCpu') {
			return (parseFloat(a.leaseAmount) / a.cpuCount) - (parseFloat(b.leaseAmount) / b.cpuCount);
		}
		return parseFloat(a.leaseAmount) - parseFloat(b.leaseAmount);
	});
}

export function formatPrice(amount: string | number, currency: string = 'EVR', decimals: number = 6): string {
	const num = parseFloat(String(amount));
	return `${num.toFixed(decimals)} ${currency}`;
}

// ============================================
// MOMENT UTILITIES
// ============================================

export function getCurrentMomentFromLedger(
	currentLedger: number,
	baseIndex: number,
	momentSize: number
): number {
	return Math.floor((currentLedger - baseIndex) / momentSize);
}

export function getRemainingLedgersInMoment(
	currentLedger: number,
	baseIndex: number,
	momentSize: number
): number {
	const position = (currentLedger - baseIndex) % momentSize;
	return momentSize - position;
}

export function momentToLedgerSeq(moment: number, baseIndex: number, momentSize: number): number {
	return baseIndex + (moment * momentSize);
}

// ============================================
// CONSENSUS UTILITIES
// ============================================

export function calculateQuorum(totalNodes: number, quorumPercentage: number = 80): number {
	return Math.ceil((totalNodes * quorumPercentage) / 100);
}

export function hasQuorum(agreementCount: number, totalNodes: number, quorumPercentage: number = 80): boolean {
	return agreementCount >= calculateQuorum(totalNodes, quorumPercentage);
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidXrplAddress(address: string): boolean {
	if (!address || !address.startsWith('r')) return false;
	const base58Regex = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;
	return base58Regex.test(address);
}

export function isValidEd25519Key(key: string): boolean {
	const hexRegex = /^[0-9a-fA-F]{64}$/;
	if (hexRegex.test(key)) return true;
	try {
		const decoded = Buffer.from(key, 'base64');
		return decoded.length === 32;
	} catch {
		return false;
	}
}

export function validateHostSpecs(specs: {
	cpuCount: number;
	ramMb: number;
	diskMb: number;
}): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (specs.cpuCount < 1) errors.push('CPU count must be at least 1');
	if (specs.ramMb < 512) errors.push('RAM must be at least 512 MB');
	if (specs.diskMb < 1024) errors.push('Disk space must be at least 1024 MB');
	return { valid: errors.length === 0, errors };
}

// ============================================
// CONVERSION UTILITIES
// ============================================

export function dropsToXrp(drops: string | number): number {
	return Number(drops) / 1000000;
}

export function xrpToDrops(xrp: string | number): string {
	return String(Math.floor(Number(xrp) * 1000000));
}

export function hexToBase64(hex: string): string {
	return Buffer.from(hex, 'hex').toString('base64');
}

export function base64ToHex(base64: string): string {
	return Buffer.from(base64, 'base64').toString('hex');
}

export function formatEvrAmount(amount: string, decimals: number = 6): string {
	const num = parseFloat(amount);
	return num.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals,
	});
}
