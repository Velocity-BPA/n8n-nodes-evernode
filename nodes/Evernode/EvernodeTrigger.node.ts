/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';

import { getNetworkConfigFromCredentials } from './transport';

export class EvernodeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Evernode Trigger',
		name: 'evernodeTrigger',
		icon: 'file:evernode.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger on Evernode network events',
		defaults: { name: 'Evernode Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'evernodeNetwork', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{ name: 'Host Registered', value: 'hostRegistered', description: 'Triggered when a new host registers' },
					{ name: 'Host Deregistered', value: 'hostDeregistered', description: 'Triggered when a host deregisters' },
					{ name: 'Host Heartbeat', value: 'hostHeartbeat', description: 'Triggered on host heartbeat' },
					{ name: 'Lease Acquired', value: 'leaseAcquired', description: 'Triggered when a lease is acquired' },
					{ name: 'Lease Extended', value: 'leaseExtended', description: 'Triggered when a lease is extended' },
					{ name: 'Lease Terminated', value: 'leaseTerminated', description: 'Triggered when a lease ends' },
					{ name: 'Moment Changed', value: 'momentChanged', description: 'Triggered on moment transition' },
					{ name: 'Reward Claimed', value: 'rewardClaimed', description: 'Triggered when rewards are claimed' },
					{ name: 'EVR Received', value: 'evrReceived', description: 'Triggered when EVR is received' },
					{ name: 'EVR Sent', value: 'evrSent', description: 'Triggered when EVR is sent' },
				],
				default: 'momentChanged',
				description: 'The event to trigger on',
			},
			{
				displayName: 'Filter Address',
				name: 'filterAddress',
				type: 'string',
				default: '',
				placeholder: 'rXXXX...',
				description: 'Optional: Only trigger for events related to this address',
			},
			{
				displayName: 'Polling Interval (Seconds)',
				name: 'pollingInterval',
				type: 'number',
				default: 60,
				description: 'How often to check for new events',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const event = this.getNodeParameter('event') as string;
		const filterAddress = this.getNodeParameter('filterAddress') as string;
		const pollingInterval = this.getNodeParameter('pollingInterval') as number;
		const credentials = await this.getCredentials('evernodeNetwork');
		const config = getNetworkConfigFromCredentials(credentials);

		let lastCheckedLedger = 0;

		const pollForEvents = async () => {
			try {
				// Get current ledger
				const response = await this.helpers.request({
					method: 'POST',
					url: config.xrplHttpUrl,
					body: { method: 'ledger', params: [{ ledger_index: 'validated' }] },
					json: true,
				});

				const currentLedger = response?.result?.ledger_index || 0;

				if (lastCheckedLedger === 0) {
					lastCheckedLedger = currentLedger;
					return;
				}

				// Check for events based on type
				const eventData: any = {
					event,
					network: config.name,
					ledgerRange: { from: lastCheckedLedger, to: currentLedger },
					timestamp: new Date().toISOString(),
				};

				if (event === 'momentChanged') {
					const momentSize = 1800;
					const prevMoment = Math.floor(lastCheckedLedger / momentSize);
					const currentMoment = Math.floor(currentLedger / momentSize);

					if (currentMoment > prevMoment) {
						eventData.previousMoment = prevMoment;
						eventData.currentMoment = currentMoment;
						this.emit([this.helpers.returnJsonArray([eventData])]);
					}
				} else if (['hostRegistered', 'hostDeregistered', 'hostHeartbeat', 'leaseAcquired', 'leaseExtended', 'leaseTerminated', 'rewardClaimed'].includes(event)) {
					// Query registry transactions
					const txResponse = await this.helpers.request({
						method: 'POST',
						url: config.xrplHttpUrl,
						body: {
							method: 'account_tx',
							params: [{
								account: config.registryAddress,
								ledger_index_min: lastCheckedLedger,
								ledger_index_max: currentLedger,
								limit: 100,
							}],
						},
						json: true,
					});

					const transactions = txResponse?.result?.transactions || [];
					
					for (const tx of transactions) {
						if (filterAddress && tx.tx?.Account !== filterAddress && tx.tx?.Destination !== filterAddress) {
							continue;
						}
						
						// Emit matching events
						const txEvent = {
							...eventData,
							transaction: tx,
						};
						this.emit([this.helpers.returnJsonArray([txEvent])]);
					}
				} else if (['evrReceived', 'evrSent'].includes(event) && filterAddress) {
					// Query account transactions for EVR movements
					const txResponse = await this.helpers.request({
						method: 'POST',
						url: config.xrplHttpUrl,
						body: {
							method: 'account_tx',
							params: [{
								account: filterAddress,
								ledger_index_min: lastCheckedLedger,
								ledger_index_max: currentLedger,
								limit: 100,
							}],
						},
						json: true,
					});

					const transactions = txResponse?.result?.transactions || [];
					
					for (const tx of transactions) {
						if (tx.tx?.TransactionType === 'Payment' && tx.tx?.Amount?.currency === 'EVR') {
							const isReceived = tx.tx?.Destination === filterAddress;
							if ((event === 'evrReceived' && isReceived) || (event === 'evrSent' && !isReceived)) {
								const txEvent = {
									...eventData,
									amount: tx.tx?.Amount?.value,
									from: tx.tx?.Account,
									to: tx.tx?.Destination,
									transaction: tx,
								};
								this.emit([this.helpers.returnJsonArray([txEvent])]);
							}
						}
					}
				}

				lastCheckedLedger = currentLedger;
			} catch (error) {
				console.error('Evernode Trigger polling error:', error);
			}
		};

		const intervalId = setInterval(pollForEvents, pollingInterval * 1000);

		// Initial poll
		await pollForEvents();

		const closeFunction = async () => {
			clearInterval(intervalId);
		};

		return { closeFunction };
	}
}
