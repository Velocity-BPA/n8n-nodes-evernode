# n8n-nodes-evernode

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Evernode, a decentralized infrastructure platform. It includes 5 resources covering host management, instance operations, smart contracts, reputation tracking, and transaction monitoring capabilities for seamless Evernode automation.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Evernode](https://img.shields.io/badge/Evernode-Compatible-green)
![XRPL](https://img.shields.io/badge/XRPL-Integrated-orange)
![Decentralized](https://img.shields.io/badge/Infrastructure-Decentralized-purple)

## Features

- **Host Management** - Monitor and manage Evernode hosts including registration, updates, and status tracking
- **Instance Operations** - Create, deploy, scale, and terminate application instances across the Evernode network
- **Smart Contract Integration** - Execute and monitor smart contracts with full transaction lifecycle management
- **Reputation System** - Track host and instance reputation scores for optimal resource allocation
- **Transaction Monitoring** - Real-time transaction tracking with detailed status and confirmation handling
- **XRPL Integration** - Native XRPL ledger support for payments and asset transfers
- **Network Analytics** - Comprehensive network statistics and performance monitoring
- **Automated Scaling** - Dynamic resource allocation based on demand and performance metrics

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-evernode`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-evernode
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-evernode.git
cd n8n-nodes-evernode
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-evernode
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Evernode API access key | Yes |
| Environment | Production or Testnet environment | Yes |
| Wallet Secret | XRPL wallet secret for transaction signing | Yes |
| Base URL | Custom Evernode API endpoint (optional) | No |

## Resources & Operations

### 1. Host

| Operation | Description |
|-----------|-------------|
| Get | Retrieve host information and current status |
| List | Get all available hosts with filtering options |
| Register | Register a new host on the Evernode network |
| Update | Update host configuration and metadata |
| Deregister | Remove host from the network |
| Get Stats | Retrieve host performance statistics |
| Get Reputation | Get current host reputation score |

### 2. Instance

| Operation | Description |
|-----------|-------------|
| Create | Deploy a new application instance |
| Get | Retrieve instance details and status |
| List | Get all instances with filtering and pagination |
| Update | Modify instance configuration |
| Start | Start a stopped instance |
| Stop | Stop a running instance |
| Restart | Restart an existing instance |
| Delete | Permanently delete an instance |
| Get Logs | Retrieve instance execution logs |
| Scale | Scale instance resources up or down |

### 3. Contract

| Operation | Description |
|-----------|-------------|
| Deploy | Deploy a new smart contract |
| Execute | Execute contract functions |
| Get | Retrieve contract details and state |
| List | Get all deployed contracts |
| Update | Update contract parameters |
| Get State | Retrieve current contract state |
| Get History | Get contract execution history |
| Estimate Gas | Estimate execution costs |

### 4. Reputation

| Operation | Description |
|-----------|-------------|
| Get Host Score | Retrieve reputation score for a specific host |
| Get Instance Score | Get reputation metrics for an instance |
| List Rankings | Get reputation rankings across the network |
| Submit Rating | Submit a reputation rating |
| Get History | Retrieve reputation score history |
| Get Metrics | Get detailed reputation metrics |

### 5. Transaction

| Operation | Description |
|-----------|-------------|
| Submit | Submit a new transaction to the network |
| Get | Retrieve transaction details and status |
| List | Get transaction history with filtering |
| Get Status | Check current transaction status |
| Monitor | Monitor transaction confirmations |
| Get Receipt | Retrieve transaction receipt |
| Cancel | Cancel a pending transaction |
| Estimate Fee | Estimate transaction fees |

## Usage Examples

```javascript
// Deploy a new application instance
{
  "resource": "instance",
  "operation": "create",
  "hostId": "rDL8gqQJaJG9MvJzxERmKVZnkKMk7XgcXt",
  "config": {
    "image": "my-app:latest",
    "memory": 512,
    "cpu": 1,
    "environment": {
      "NODE_ENV": "production"
    }
  }
}
```

```javascript
// Monitor host reputation scores
{
  "resource": "reputation",
  "operation": "getHostScore",
  "hostId": "rDL8gqQJaJG9MvJzxERmKVZnkKMk7XgcXt",
  "timeframe": "30d"
}
```

```javascript
// Execute a smart contract function
{
  "resource": "contract",
  "operation": "execute",
  "contractId": "0x742d35Cc6669C542d46a44b2Bf68A7b448E7D60C",
  "function": "transfer",
  "parameters": {
    "to": "rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY",
    "amount": "100"
  }
}
```

```javascript
// Track transaction status
{
  "resource": "transaction",
  "operation": "getStatus",
  "transactionHash": "F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF",
  "includeDetails": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and active |
| Host Not Found | Specified host ID does not exist | Check host ID and ensure host is registered |
| Insufficient Funds | Not enough balance for transaction | Add funds to wallet or reduce transaction amount |
| Network Congestion | High network load causing delays | Retry with higher gas fees or wait for lower congestion |
| Contract Error | Smart contract execution failed | Check contract parameters and state requirements |
| Rate Limit Exceeded | Too many API requests in time window | Implement request throttling and retry logic |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-evernode/issues)
- **Evernode Documentation**: [docs.evernode.org](https://docs.evernode.org)
- **XRPL Developer Portal**: [xrpl.org/docs](https://xrpl.org/docs)