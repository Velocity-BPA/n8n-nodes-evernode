/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { getNetworkConfigFromCredentials, getAccountInfo, getAccountLines, getAccountTransactions, getServerInfo, getLedgerInfo, makeXrplRequest, isValidXrplAddress, formatEvrAmount } from './transport';
import { EVR_TOKEN } from './constants';
import { calculateLeaseCost, calculateLeaseDuration, validateLeaseParams, getReputationTier, calculateHourlyRate, formatPrice, dropsToXrp } from './utils';

export class Evernode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Evernode',
		name: 'evernode',
		icon: 'file:evernode.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Evernode decentralized hosting network',
		defaults: { name: 'Evernode' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'evernodeNetwork', required: true }],
		properties: [
			{ displayName: 'Resource', name: 'resource', type: 'options', noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' }, { name: 'EVR Token', value: 'evr' },
					{ name: 'Host', value: 'host' }, { name: 'Tenant', value: 'tenant' },
					{ name: 'Lease', value: 'lease' }, { name: 'Registry', value: 'registry' },
					{ name: 'Reputation', value: 'reputation' }, { name: 'Moment', value: 'moment' },
					{ name: 'Pricing', value: 'pricing' }, { name: 'Network', value: 'network' },
					{ name: 'Utility', value: 'utility' },
				], default: 'account' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{ name: 'Get Account Info', value: 'getAccountInfo', action: 'Get account info' },
					{ name: 'Get XRP Balance', value: 'getXrpBalance', action: 'Get XRP balance' },
					{ name: 'Get EVR Balance', value: 'getEvrBalance', action: 'Get EVR balance' },
					{ name: 'Get Trustlines', value: 'getTrustlines', action: 'Get trustlines' },
					{ name: 'Get Transactions', value: 'getTransactions', action: 'Get transactions' },
					{ name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
				], default: 'getAccountInfo' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['evr'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', action: 'Get EVR balance' },
					{ name: 'Get Token Info', value: 'getTokenInfo', action: 'Get token info' },
				], default: 'getBalance' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['host'] } },
				options: [
					{ name: 'Get Host Info', value: 'getHostInfo', action: 'Get host info' },
					{ name: 'Get Active Hosts', value: 'getActiveHosts', action: 'Get active hosts' },
				], default: 'getHostInfo' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['tenant'] } },
				options: [
					{ name: 'Get Tenant Info', value: 'getTenantInfo', action: 'Get tenant info' },
					{ name: 'Get Tenant Leases', value: 'getTenantLeases', action: 'Get tenant leases' },
				], default: 'getTenantInfo' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['lease'] } },
				options: [
					{ name: 'Get Lease Info', value: 'getLeaseInfo', action: 'Get lease info' },
					{ name: 'Calculate Cost', value: 'calculateCost', action: 'Calculate lease cost' },
				], default: 'getLeaseInfo' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['registry'] } },
				options: [
					{ name: 'Get Registry Info', value: 'getRegistryInfo', action: 'Get registry info' },
					{ name: 'Get Moment Info', value: 'getMomentInfo', action: 'Get moment info' },
				], default: 'getRegistryInfo' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['reputation'] } },
				options: [{ name: 'Get Reputation Tier', value: 'getReputationTier', action: 'Get reputation tier' }],
				default: 'getReputationTier' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['moment'] } },
				options: [{ name: 'Get Current Moment', value: 'getCurrentMoment', action: 'Get current moment' }],
				default: 'getCurrentMoment' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['pricing'] } },
				options: [{ name: 'Calculate Lease Price', value: 'calculateLeasePrice', action: 'Calculate lease price' }],
				default: 'calculateLeasePrice' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['network'] } },
				options: [
					{ name: 'Get Network Info', value: 'getNetworkInfo', action: 'Get network info' },
					{ name: 'Get Server Info', value: 'getServerInfo', action: 'Get server info' },
				], default: 'getNetworkInfo' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['utility'] } },
				options: [
					{ name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
					{ name: 'Convert Units', value: 'convertUnits', action: 'Convert units' },
					{ name: 'Get Ledger Info', value: 'getLedgerInfo', action: 'Get ledger info' },
				], default: 'validateAddress' },
			{ displayName: 'Address', name: 'address', type: 'string', default: '', placeholder: 'rXXXX...',
				displayOptions: { show: { resource: ['account', 'evr', 'host', 'tenant'], operation: ['getAccountInfo', 'getXrpBalance', 'getEvrBalance', 'getTrustlines', 'getTransactions', 'getBalance', 'getHostInfo', 'getTenantInfo', 'getTenantLeases'] } } },
			{ displayName: 'Token ID', name: 'tokenId', type: 'string', default: '',
				displayOptions: { show: { resource: ['lease'], operation: ['getLeaseInfo'] } } },
			{ displayName: 'Lease Amount (EVR)', name: 'leaseAmount', type: 'number', default: 1,
				displayOptions: { show: { resource: ['lease', 'pricing'], operation: ['calculateCost', 'calculateLeasePrice'] } } },
			{ displayName: 'Duration (Moments)', name: 'moments', type: 'number', default: 24,
				displayOptions: { show: { resource: ['lease', 'pricing'], operation: ['calculateCost', 'calculateLeasePrice'] } } },
			{ displayName: 'Instance Count', name: 'instanceCount', type: 'number', default: 1,
				displayOptions: { show: { resource: ['lease', 'pricing'], operation: ['calculateCost', 'calculateLeasePrice'] } } },
			{ displayName: 'Limit', name: 'limit', type: 'number', default: 20,
				displayOptions: { show: { resource: ['account'], operation: ['getTransactions'] } } },
			{ displayName: 'Address to Validate', name: 'addressToValidate', type: 'string', default: '',
				displayOptions: { show: { resource: ['account', 'utility'], operation: ['validateAddress'] } } },
			{ displayName: 'Amount', name: 'amount', type: 'string', default: '0',
				displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } } },
			{ displayName: 'Conversion Type', name: 'conversionType', type: 'options',
				options: [{ name: 'Drops to XRP', value: 'dropsToXrp' }, { name: 'XRP to Drops', value: 'xrpToDrops' }],
				default: 'dropsToXrp', displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } } },
			{ displayName: 'Reputation Score', name: 'reputationScore', type: 'number', default: 50,
				displayOptions: { show: { resource: ['reputation'], operation: ['getReputationTier'] } } },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('evernodeNetwork');
		const config = getNetworkConfigFromCredentials(credentials);

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any = { success: false };

				if (resource === 'account') {
					const address = operation !== 'validateAddress' ? this.getNodeParameter('address', i) as string : '';
					if (operation === 'getAccountInfo') {
						if (!isValidXrplAddress(address)) throw new NodeOperationError(this.getNode(), 'Invalid address', { itemIndex: i });
						result = { success: true, data: await getAccountInfo(this, config, address) };
					} else if (operation === 'getXrpBalance') {
						const info = await getAccountInfo(this, config, address) as any;
						result = { success: true, address, balance: dropsToXrp(info?.account_data?.Balance || '0'), currency: 'XAH' };
					} else if (operation === 'getEvrBalance') {
						const lines = await getAccountLines(this, config, address) as any;
						const evr = lines?.lines?.find((l: any) => l.currency === 'EVR' && l.account === config.evrIssuer);
						result = { success: true, address, balance: evr?.balance || '0', currency: 'EVR' };
					} else if (operation === 'getTrustlines') {
						const lines = await getAccountLines(this, config, address);
						result = { success: true, address, trustlines: (lines as any)?.lines || [] };
					} else if (operation === 'getTransactions') {
						const limit = this.getNodeParameter('limit', i) as number;
						const txs = await getAccountTransactions(this, config, address, limit);
						result = { success: true, address, transactions: (txs as any)?.transactions || [] };
					} else if (operation === 'validateAddress') {
						const addr = this.getNodeParameter('addressToValidate', i) as string;
						result = { success: true, address: addr, valid: isValidXrplAddress(addr) };
					}
				} else if (resource === 'evr') {
					const address = this.getNodeParameter('address', i) as string;
					if (operation === 'getBalance') {
						const lines = await getAccountLines(this, config, address) as any;
						const evr = lines?.lines?.find((l: any) => l.currency === 'EVR');
						result = { success: true, address, balance: evr?.balance || '0', formatted: formatEvrAmount(evr?.balance || '0') };
					} else if (operation === 'getTokenInfo') {
						result = { success: true, currency: 'EVR', issuer: config.evrIssuer, decimals: EVR_TOKEN.DECIMALS, totalSupply: EVR_TOKEN.TOTAL_SUPPLY };
					}
				} else if (resource === 'host') {
					if (operation === 'getHostInfo') {
						const address = this.getNodeParameter('address', i) as string;
						const info = await getAccountInfo(this, config, address);
						const objects = await makeXrplRequest(this, config, 'account_objects', [{ account: address, type: 'uri_token', ledger_index: 'validated' }]) as any;
						result = { success: true, address, accountInfo: info, uriTokens: objects?.account_objects || [] };
					} else if (operation === 'getActiveHosts') {
						result = { success: true, registryAddress: config.registryAddress, note: 'Query registry hook state for hosts' };
					}
				} else if (resource === 'tenant') {
					const address = this.getNodeParameter('address', i) as string;
					const objects = await makeXrplRequest(this, config, 'account_objects', [{ account: address, type: 'uri_token', ledger_index: 'validated' }]) as any;
					result = { success: true, address, leases: objects?.account_objects || [] };
				} else if (resource === 'lease') {
					if (operation === 'getLeaseInfo') {
						const tokenId = this.getNodeParameter('tokenId', i) as string;
						const entry = await makeXrplRequest(this, config, 'ledger_entry', [{ uri_token: tokenId, ledger_index: 'validated' }]);
						result = { success: true, tokenId, data: entry };
					} else if (operation === 'calculateCost') {
						const leaseAmount = this.getNodeParameter('leaseAmount', i) as number;
						const moments = this.getNodeParameter('moments', i) as number;
						const instanceCount = this.getNodeParameter('instanceCount', i) as number;
						const validation = validateLeaseParams({ moments, instanceCount });
						if (!validation.valid) throw new NodeOperationError(this.getNode(), validation.errors.join(', '), { itemIndex: i });
						result = { success: true, cost: calculateLeaseCost({ leaseAmount, moments, instanceCount }), duration: calculateLeaseDuration(moments) };
					}
				} else if (resource === 'registry') {
					if (operation === 'getRegistryInfo') {
						result = { success: true, network: config.name, registryAddress: config.registryAddress, governorAddress: config.governorAddress, serverInfo: await getServerInfo(this, config) };
					} else if (operation === 'getMomentInfo') {
						const ledger = await getLedgerInfo(this, config) as any;
						const idx = ledger?.ledger_index || 0;
						result = { success: true, currentLedger: idx, momentSize: 1800, currentMoment: Math.floor(idx / 1800) };
					}
				} else if (resource === 'reputation') {
					const score = this.getNodeParameter('reputationScore', i) as number;
					const tier = getReputationTier(score);
					result = { success: true, score, ...tier };
				} else if (resource === 'moment') {
					const ledger = await getLedgerInfo(this, config) as any;
					const idx = ledger?.ledger_index || 0;
					result = { success: true, currentLedger: idx, momentSize: 1800, currentMoment: Math.floor(idx / 1800), remainingLedgers: 1800 - (idx % 1800) };
				} else if (resource === 'pricing') {
					const leaseAmount = this.getNodeParameter('leaseAmount', i) as number;
					const moments = this.getNodeParameter('moments', i) as number;
					const instanceCount = this.getNodeParameter('instanceCount', i) as number;
					result = { success: true, cost: calculateLeaseCost({ leaseAmount, moments, instanceCount }), duration: calculateLeaseDuration(moments), hourlyRate: formatPrice(calculateHourlyRate(leaseAmount)) };
				} else if (resource === 'network') {
					if (operation === 'getNetworkInfo') {
						result = { success: true, network: config.name, xrplWsUrl: config.xrplWsUrl, registryAddress: config.registryAddress, evrIssuer: config.evrIssuer };
					} else if (operation === 'getServerInfo') {
						result = { success: true, serverInfo: await getServerInfo(this, config) };
					}
				} else if (resource === 'utility') {
					if (operation === 'validateAddress') {
						const addr = this.getNodeParameter('addressToValidate', i) as string;
						result = { success: true, address: addr, valid: isValidXrplAddress(addr) };
					} else if (operation === 'convertUnits') {
						const amount = this.getNodeParameter('amount', i) as string;
						const type = this.getNodeParameter('conversionType', i) as string;
						result = { success: true, input: amount, output: type === 'dropsToXrp' ? dropsToXrp(amount) : String(Math.floor(Number(amount) * 1000000)), conversionType: type };
					} else if (operation === 'getLedgerInfo') {
						result = { success: true, ledgerInfo: await getLedgerInfo(this, config) };
					}
				}

				returnData.push({ json: result });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
