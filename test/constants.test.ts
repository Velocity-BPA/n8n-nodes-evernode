import {
  getNetworkConfig,
  MAINNET_CONFIG,
  TESTNET_CONFIG,
  EVR_TOKEN,
  MOMENT_CONFIG,
  getMomentDurationHours,
  GOVERNANCE_MODES,
  HOST_STATUS,
} from '../nodes/Evernode/constants';

describe('Evernode Constants', () => {
  describe('Network Configuration', () => {
    test('getNetworkConfig returns mainnet config', () => {
      const config = getNetworkConfig('mainnet');
      
      expect(config.name).toBe('mainnet');
      expect(config.xrplWsUrl).toBe('wss://xahau.network');
      expect(config.registryAddress).toBeTruthy();
    });

    test('getNetworkConfig returns testnet config', () => {
      const config = getNetworkConfig('testnet');
      
      expect(config.name).toBe('testnet');
      expect(config.xrplWsUrl).toBe('wss://xahau-test.net');
    });

    test('getNetworkConfig throws for unknown network', () => {
      expect(() => getNetworkConfig('invalid')).toThrow('Unknown network');
    });

    test('MAINNET_CONFIG has required fields', () => {
      expect(MAINNET_CONFIG.governorAddress).toBeTruthy();
      expect(MAINNET_CONFIG.registryAddress).toBeTruthy();
      expect(MAINNET_CONFIG.heartbeatAddress).toBeTruthy();
      expect(MAINNET_CONFIG.evrIssuer).toBeTruthy();
    });

    test('TESTNET_CONFIG has required fields', () => {
      expect(TESTNET_CONFIG.governorAddress).toBeTruthy();
      expect(TESTNET_CONFIG.registryAddress).toBeTruthy();
    });
  });

  describe('EVR Token Constants', () => {
    test('EVR_TOKEN has correct values', () => {
      expect(EVR_TOKEN.CURRENCY_CODE).toBe('EVR');
      expect(EVR_TOKEN.DECIMALS).toBe(6);
      expect(EVR_TOKEN.ISSUER_MAINNET).toBe('rEvernodee8dJLaFsujS6q1EiXvZYmHXr8');
    });
  });

  describe('Moment Constants', () => {
    test('MOMENT_CONFIG has correct defaults', () => {
      expect(MOMENT_CONFIG.DEFAULT_SIZE).toBe(1800);
      expect(MOMENT_CONFIG.AVG_LEDGER_CLOSE_TIME).toBe(2);
    });

    test('getMomentDurationHours calculates correctly', () => {
      // 1800 ledgers * 2 seconds / 3600 seconds = 1 hour
      const hours = getMomentDurationHours(1800);
      expect(hours).toBe(1);
    });
  });

  describe('Governance Constants', () => {
    test('GOVERNANCE_MODES has expected values', () => {
      expect(GOVERNANCE_MODES.PILOTED).toBe(0);
      expect(GOVERNANCE_MODES.CO_PILOTED).toBe(1);
      expect(GOVERNANCE_MODES.AUTO_PILOTED).toBe(2);
    });
  });

  describe('Host Status Constants', () => {
    test('HOST_STATUS has expected values', () => {
      expect(HOST_STATUS.UNREGISTERED).toBe(0);
      expect(HOST_STATUS.REGISTERED).toBe(1);
      expect(HOST_STATUS.ACTIVE).toBe(2);
    });
  });
});
