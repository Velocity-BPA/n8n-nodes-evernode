/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Evernode } from '../nodes/Evernode/Evernode.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Evernode Node', () => {
  let node: Evernode;

  beforeAll(() => {
    node = new Evernode();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Evernode');
      expect(node.description.name).toBe('evernode');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Host Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.evernode.org/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get all hosts successfully', async () => {
    const mockResponse = { hosts: [], total: 0 };
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllHosts')
      .mockReturnValueOnce('active')
      .mockReturnValueOnce('us')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(0);
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeHostOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should get specific host successfully', async () => {
    const mockResponse = { hostAddress: 'rHost123', status: 'active' };
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getHost')
      .mockReturnValueOnce('rHost123');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeHostOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should register host successfully', async () => {
    const mockResponse = { success: true, hostAddress: 'rHost123' };
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('registerHost')
      .mockReturnValueOnce('rHost123')
      .mockReturnValueOnce('US')
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(8192)
      .mockReturnValueOnce(102400)
      .mockReturnValueOnce('Test host');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeHostOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should update host successfully', async () => {
    const mockResponse = { success: true, updated: true };
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateHost')
      .mockReturnValueOnce('rHost123')
      .mockReturnValueOnce(8)
      .mockReturnValueOnce(16384)
      .mockReturnValueOnce(204800)
      .mockReturnValueOnce('Updated host');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeHostOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should deregister host successfully', async () => {
    const mockResponse = { success: true, deregistered: true };
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('deregisterHost')
      .mockReturnValueOnce('rHost123');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeHostOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllHosts');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeHostOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });

  it('should continue on fail when configured', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllHosts');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeHostOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });
});

describe('Instance Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.evernode.org/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Evernode Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	test('getAllInstances should fetch all instances successfully', async () => {
		const mockResponse = {
			instances: [
				{ id: 'inst-1', status: 'running', hostAddress: 'host1' },
				{ id: 'inst-2', status: 'stopped', hostAddress: 'host2' },
			],
			total: 2,
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllInstances')
			.mockReturnValueOnce('running')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(50)
			.mockReturnValueOnce(0);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.evernode.org/v1/instances?status=running&limit=50&offset=0',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
	});

	test('getInstance should fetch specific instance successfully', async () => {
		const mockResponse = {
			id: 'inst-123',
			status: 'running',
			hostAddress: 'host1',
			memory: 512,
			storage: 10,
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getInstance')
			.mockReturnValueOnce('inst-123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.evernode.org/v1/instances/inst-123',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
	});

	test('createInstance should create new instance successfully', async () => {
		const mockResponse = {
			id: 'inst-new',
			status: 'deploying',
			hostAddress: 'host1',
			memory: 1024,
			storage: 20,
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createInstance')
			.mockReturnValueOnce('host1')
			.mockReturnValueOnce('contract-code-here')
			.mockReturnValueOnce(1024)
			.mockReturnValueOnce(20)
			.mockReturnValueOnce(48);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.evernode.org/v1/instances',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			body: {
				hostAddress: 'host1',
				contractCode: 'contract-code-here',
				memory: 1024,
				storage: 20,
				duration: 48,
			},
			json: true,
		});
	});

	test('updateInstance should update instance successfully', async () => {
		const mockResponse = {
			id: 'inst-123',
			status: 'running',
			memory: 2048,
			storage: 50,
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('updateInstance')
			.mockReturnValueOnce('inst-123')
			.mockReturnValueOnce(2048)
			.mockReturnValueOnce(50);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'PATCH',
			url: 'https://api.evernode.org/v1/instances/inst-123',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			body: {
				memory: 2048,
				storage: 50,
			},
			json: true,
		});
	});

	test('deleteInstance should delete instance successfully', async () => {
		const mockResponse = { message: 'Instance deleted successfully' };

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('deleteInstance')
			.mockReturnValueOnce('inst-123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'DELETE',
			url: 'https://api.evernode.org/v1/instances/inst-123',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
	});

	test('should handle API errors gracefully', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getInstance');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
	});

	test('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getInstance');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);

		await expect(executeInstanceOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
	});
});

describe('Contract Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.evernode.org/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getAllContracts', () => {
    it('should get all contracts successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllContracts')
        .mockReturnValueOnce('active')
        .mockReturnValueOnce('smart')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(0);

      const mockResponse = { contracts: [], total: 0 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.evernode.org/v1/contracts?status=active&type=smart&limit=50&offset=0',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getAllContracts error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllContracts');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getContract', () => {
    it('should get contract successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getContract')
        .mockReturnValueOnce('contract123');

      const mockResponse = { id: 'contract123', name: 'Test Contract' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deployContract', () => {
    it('should deploy contract successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deployContract')
        .mockReturnValueOnce('console.log("Hello World");')
        .mockReturnValueOnce('Test Contract')
        .mockReturnValueOnce('A test contract')
        .mockReturnValueOnce('{"timeout": 5000}');

      const mockResponse = { id: 'contract123', status: 'deploying' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle invalid JSON parameters', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deployContract')
        .mockReturnValueOnce('code')
        .mockReturnValueOnce('name')
        .mockReturnValueOnce('desc')
        .mockReturnValueOnce('invalid json');

      await expect(
        executeContractOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Invalid JSON in parameters');
    });
  });

  describe('updateContract', () => {
    it('should update contract successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateContract')
        .mockReturnValueOnce('contract123')
        .mockReturnValueOnce('updated code')
        .mockReturnValueOnce('{"newParam": true}');

      const mockResponse = { id: 'contract123', status: 'updating' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteContract', () => {
    it('should delete contract successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteContract')
        .mockReturnValueOnce('contract123');

      const mockResponse = { success: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Reputation Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.evernode.org/v1'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			},
		};
	});

	describe('getAllReputations', () => {
		it('should get all reputations successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllReputations')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(100)
				.mockReturnValueOnce(0);

			const mockResponse = { data: [{ hostAddress: 'host1', score: 85 }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 }
			}]);
		});

		it('should handle getAllReputations error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllReputations');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects.toThrow('API Error');
		});
	});

	describe('getReputation', () => {
		it('should get specific reputation successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getReputation')
				.mockReturnValueOnce('test-host-address');

			const mockResponse = { hostAddress: 'test-host-address', score: 92 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 }
			}]);
		});

		it('should handle getReputation error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getReputation');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Host not found'));

			await expect(executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects.toThrow('Host not found');
		});
	});

	describe('createReputationScore', () => {
		it('should create reputation score successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createReputationScore')
				.mockReturnValueOnce('test-host')
				.mockReturnValueOnce(85)
				.mockReturnValueOnce('{"uptime": 99.5}');

			const mockResponse = { id: 'score123', status: 'created' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 }
			}]);
		});

		it('should handle createReputationScore error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createReputationScore');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid score'));

			await expect(executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects.toThrow('Invalid score');
		});
	});

	describe('updateReputation', () => {
		it('should update reputation successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateReputation')
				.mockReturnValueOnce('test-host')
				.mockReturnValueOnce(90)
				.mockReturnValueOnce(99.9)
				.mockReturnValueOnce(88);

			const mockResponse = { hostAddress: 'test-host', updated: true };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 }
			}]);
		});

		it('should handle updateReputation error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('updateReputation');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Update failed'));

			await expect(executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects.toThrow('Update failed');
		});
	});

	describe('getReputationHistory', () => {
		it('should get reputation history successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getReputationHistory')
				.mockReturnValueOnce('test-host')
				.mockReturnValueOnce('2024-01-01')
				.mockReturnValueOnce('2024-01-31');

			const mockResponse = { history: [{ date: '2024-01-01', score: 85 }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 }
			}]);
		});

		it('should handle getReputationHistory error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getReputationHistory');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('History not found'));

			await expect(executeReputationOperations.call(mockExecuteFunctions, [{ json: {} }]))
				.rejects.toThrow('History not found');
		});
	});
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.evernode.org/v1'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Evernode Transaction Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getAllTransactions', () => {
    it('should get all transactions successfully', async () => {
      const mockResponse = {
        transactions: [
          { id: '1', amount: 100, status: 'confirmed', type: 'transfer' },
          { id: '2', amount: 50, status: 'pending', type: 'smart_contract' }
        ],
        total: 2
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllTransactions')
        .mockReturnValueOnce('all')
        .mockReturnValueOnce('all')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(0);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle getAllTransactions error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllTransactions');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValueOnce(true);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction by hash successfully', async () => {
      const mockResponse = {
        id: 'abc123',
        hash: 'tx_hash_123',
        amount: 100,
        status: 'confirmed',
        type: 'transfer'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransaction')
        .mockReturnValueOnce('tx_hash_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockResponse = {
        id: 'new_tx_123',
        hash: 'new_tx_hash',
        amount: 25.5,
        destination: 'rDestinationAddress',
        status: 'pending',
        type: 'transfer'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createTransaction')
        .mockReturnValueOnce(25.5)
        .mockReturnValueOnce('rDestinationAddress')
        .mockReturnValueOnce('Test transaction')
        .mockReturnValueOnce('transfer');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getBalance', () => {
    it('should get balance successfully', async () => {
      const mockResponse = {
        address: 'rTestAddress123',
        balance: 1000.5,
        currency: 'EVR',
        reserved: 20,
        available: 980.5
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getBalance')
        .mockReturnValueOnce('rTestAddress123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getTransactionHistory', () => {
    it('should get transaction history successfully', async () => {
      const mockResponse = {
        address: 'rTestAddress123',
        transactions: [
          { id: '1', amount: 100, type: 'received' },
          { id: '2', amount: 50, type: 'sent' }
        ],
        total: 2
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransactionHistory')
        .mockReturnValueOnce('rTestAddress123')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(0);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });
});
});
