/**
 * Integration Tests for Evernode Node
 * 
 * These tests require network connectivity to the Evernode network.
 * Run with: npm test -- --testPathPattern=integration
 * 
 * Note: Some tests are skipped by default as they require network access.
 */

import { MAINNET_CONFIG, TESTNET_CONFIG } from '../nodes/Evernode/constants';

describe('Evernode Integration Tests', () => {
  // Skip network tests by default
  const SKIP_NETWORK_TESTS = process.env.RUN_NETWORK_TESTS !== 'true';

  describe('Network Connectivity', () => {
    (SKIP_NETWORK_TESTS ? test.skip : test)('can connect to mainnet', async () => {
      const response = await fetch(MAINNET_CONFIG.xrplHttpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'server_info',
          params: [{}],
        }),
      });
      
      const data = await response.json() as any;
      expect(data.result?.info?.server_state).toBeTruthy();
    });

    (SKIP_NETWORK_TESTS ? test.skip : test)('can connect to testnet', async () => {
      const response = await fetch(TESTNET_CONFIG.xrplHttpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'server_info',
          params: [{}],
        }),
      });
      
      const data = await response.json() as any;
      expect(data.result?.info?.server_state).toBeTruthy();
    });
  });

  describe('Registry Queries', () => {
    (SKIP_NETWORK_TESTS ? test.skip : test)('can query registry account', async () => {
      const response = await fetch(MAINNET_CONFIG.xrplHttpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_info',
          params: [{
            account: MAINNET_CONFIG.registryAddress,
            ledger_index: 'validated',
          }],
        }),
      });
      
      const data = await response.json() as any;
      expect(data.result?.account_data?.Account).toBe(MAINNET_CONFIG.registryAddress);
    });
  });

  describe('EVR Token Queries', () => {
    (SKIP_NETWORK_TESTS ? test.skip : test)('can query EVR issuer', async () => {
      const response = await fetch(MAINNET_CONFIG.xrplHttpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_info',
          params: [{
            account: MAINNET_CONFIG.evrIssuer,
            ledger_index: 'validated',
          }],
        }),
      });
      
      const data = await response.json() as any;
      expect(data.result?.account_data?.Account).toBe(MAINNET_CONFIG.evrIssuer);
    });
  });

  describe('Ledger Queries', () => {
    (SKIP_NETWORK_TESTS ? test.skip : test)('can get current ledger', async () => {
      const response = await fetch(MAINNET_CONFIG.xrplHttpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'ledger',
          params: [{
            ledger_index: 'validated',
          }],
        }),
      });
      
      const data = await response.json() as any;
      expect(data.result?.ledger_index).toBeGreaterThan(0);
    });
  });
});
