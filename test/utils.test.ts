import {
  calculateLeaseCost,
  calculateLeaseDuration,
  validateLeaseParams,
  getReputationTier,
  isValidXrplAddress,
  dropsToXrp,
  xrpToDrops,
  formatPrice,
  calculateHourlyRate,
  meetsMinimumReputation,
} from '../nodes/Evernode/utils';

describe('Evernode Utilities', () => {
  describe('Lease Utilities', () => {
    test('calculateLeaseCost returns correct values', () => {
      const result = calculateLeaseCost({
        leaseAmount: 1,
        moments: 24,
        instanceCount: 2,
      });
      
      expect(result.totalCost).toBe('48.000000');
      expect(result.costPerMoment).toBe('2.000000');
      expect(result.costPerInstance).toBe('1.000000');
    });

    test('calculateLeaseDuration returns correct values', () => {
      const result = calculateLeaseDuration(24);
      
      expect(result.moments).toBe(24);
      expect(result.hours).toBe(24);
      expect(result.days).toBe(1);
      expect(result.humanReadable).toBe('1.0 days');
    });

    test('validateLeaseParams rejects invalid moments', () => {
      const result = validateLeaseParams({
        moments: 0,
        instanceCount: 1,
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Lease duration must be at least 1 moment');
    });

    test('validateLeaseParams accepts valid params', () => {
      const result = validateLeaseParams({
        moments: 24,
        instanceCount: 1,
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Reputation Utilities', () => {
    test('getReputationTier returns EXCELLENT for high scores', () => {
      const result = getReputationTier(95);
      
      expect(result.tier).toBe('EXCELLENT');
      expect(result.label).toBe('Excellent');
      expect(result.color).toBe('green');
    });

    test('getReputationTier returns CRITICAL for low scores', () => {
      const result = getReputationTier(10);
      
      expect(result.tier).toBe('CRITICAL');
      expect(result.label).toBe('Critical');
      expect(result.color).toBe('red');
    });

    test('meetsMinimumReputation checks threshold correctly', () => {
      expect(meetsMinimumReputation(50).meets).toBe(true);
      expect(meetsMinimumReputation(10).meets).toBe(false);
      expect(meetsMinimumReputation(10).deficit).toBe(10);
    });
  });

  describe('Validation Utilities', () => {
    test('isValidXrplAddress validates correct addresses', () => {
      expect(isValidXrplAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh')).toBe(true);
      expect(isValidXrplAddress('rEvernodee8dJLaFsujS6q1EiXvZYmHXr8')).toBe(true);
    });

    test('isValidXrplAddress rejects invalid addresses', () => {
      expect(isValidXrplAddress('')).toBe(false);
      expect(isValidXrplAddress('invalid')).toBe(false);
      expect(isValidXrplAddress('0x1234567890123456789012345678901234567890')).toBe(false);
    });
  });

  describe('Conversion Utilities', () => {
    test('dropsToXrp converts correctly', () => {
      expect(dropsToXrp('1000000')).toBe(1);
      expect(dropsToXrp('500000')).toBe(0.5);
      expect(dropsToXrp(10000000)).toBe(10);
    });

    test('xrpToDrops converts correctly', () => {
      expect(xrpToDrops(1)).toBe('1000000');
      expect(xrpToDrops('0.5')).toBe('500000');
      expect(xrpToDrops(10)).toBe('10000000');
    });
  });

  describe('Pricing Utilities', () => {
    test('formatPrice formats correctly', () => {
      expect(formatPrice(1.5, 'EVR')).toBe('1.500000 EVR');
      expect(formatPrice('2.123456', 'EVR', 2)).toBe('2.12 EVR');
    });

    test('calculateHourlyRate calculates correctly', () => {
      // Default moment size is 1800 ledgers ≈ 1 hour
      const hourlyRate = calculateHourlyRate(1);
      expect(hourlyRate).toBe(1);
    });
  });
});
