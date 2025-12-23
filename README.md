# n8n-nodes-evernode

[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

A comprehensive n8n community node package for interacting with the [Evernode](https://evernode.org) decentralized hosting network. This toolkit enables workflow automation for hosts, tenants, smart contract interactions, and the EVR token ecosystem.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Credentials](#credentials)
- [Nodes](#nodes)
- [Resources & Operations](#resources--operations)
- [Use Cases](#use-cases)
- [Development](#development)
- [Testing](#testing)
- [Licensing](#licensing)
- [Author](#author)

## Features

- **Account Management**: Query balances, trustlines, and transaction history
- **EVR Token Operations**: Check balances, token info, and issuer details
- **Host Operations**: Query host information, active hosts, and reputation
- **Tenant Operations**: Manage tenant accounts and leases
- **Lease Management**: Calculate costs, query lease info, and track active leases
- **Registry Queries**: Access network registry and moment information
- **Reputation System**: Query and analyze host reputation scores
- **Pricing Calculations**: Calculate lease costs with various parameters
- **Network Statistics**: Monitor network health and server info
- **Real-time Triggers**: React to network events like moment changes, leases, and EVR transfers

## Installation

### Via n8n Community Nodes

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-evernode`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-evernode

# Restart n8n
n8n start
```

### From Source

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-evernode.git
cd n8n-nodes-evernode

# Install dependencies
npm install

# Build the package
npm run build

# Link to n8n
npm link
cd ~/.n8n/custom
npm link n8n-nodes-evernode

# Restart n8n
n8n start
```

## Credentials

### Evernode Network

Primary credentials for Evernode operations:

| Field | Description |
|-------|-------------|
| Network | Mainnet, Testnet, or Custom |
| XRPL WebSocket URL | WebSocket URL (custom networks only) |
| Registry Address | Registry contract address (custom only) |
| Wallet Seed | Your wallet secret seed |
| Wallet Mnemonic | Optional mnemonic phrase |
| Account Type | General, Host, or Tenant |

### XRPL/Xahau Credentials

For direct ledger operations:

| Field | Description |
|-------|-------------|
| Network | Xahau Mainnet/Testnet, XRPL Mainnet/Testnet, Custom |
| WebSocket URL | Custom endpoint URL |
| Wallet Seed | Wallet secret seed |
| Regular Key | Optional regular key |

### HotPocket Credentials

For smart contract interactions:

| Field | Description |
|-------|-------------|
| Node URL | HotPocket WebSocket URL |
| User Private Key | ed25519 private key |
| User Public Key | ed25519 public key |
| Contract Address | Contract identifier |

## Nodes

### Evernode (Action Node)

The main action node for all Evernode operations.

### Evernode Trigger

Event-driven triggers for real-time automation:

- Host Registered/Deregistered
- Host Heartbeat
- Lease Acquired/Extended/Terminated
- Moment Changed
- Reward Claimed
- EVR Received/Sent

## Resources & Operations

### Account Resource

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve account details |
| Get XRP Balance | Get native token balance |
| Get EVR Balance | Get EVR token balance |
| Get Trustlines | List account trustlines |
| Get Transactions | Get transaction history |
| Validate Address | Validate XRPL address format |

### EVR Token Resource

| Operation | Description |
|-----------|-------------|
| Get Balance | Get EVR balance for address |
| Get Token Info | Get EVR token details |

### Host Resource

| Operation | Description |
|-----------|-------------|
| Get Host Info | Get host account details |
| Get Active Hosts | List active network hosts |

### Tenant Resource

| Operation | Description |
|-----------|-------------|
| Get Tenant Info | Get tenant account details |
| Get Tenant Leases | List tenant's active leases |

### Lease Resource

| Operation | Description |
|-----------|-------------|
| Get Lease Info | Get lease details by token ID |
| Calculate Cost | Calculate lease cost |

### Registry Resource

| Operation | Description |
|-----------|-------------|
| Get Registry Info | Get registry configuration |
| Get Moment Info | Get current moment details |

### Reputation Resource

| Operation | Description |
|-----------|-------------|
| Get Reputation Tier | Calculate reputation tier from score |

### Moment Resource

| Operation | Description |
|-----------|-------------|
| Get Current Moment | Get current network moment |

### Pricing Resource

| Operation | Description |
|-----------|-------------|
| Calculate Lease Price | Calculate total lease cost |

### Network Resource

| Operation | Description |
|-----------|-------------|
| Get Network Info | Get network configuration |
| Get Server Info | Get server status |

### Utility Resource

| Operation | Description |
|-----------|-------------|
| Validate Address | Validate XRPL address |
| Convert Units | Convert drops to XRP and vice versa |
| Get Ledger Info | Get current ledger information |

## Use Cases

### Monitor Host Performance

```javascript
// Workflow: Host Monitoring
// 1. Evernode Trigger (Moment Changed)
// 2. Evernode (Get Host Info)
// 3. IF (Reputation < 50)
// 4. Slack (Send Alert)
```

### Track EVR Payments

```javascript
// Workflow: EVR Payment Tracking
// 1. Evernode Trigger (EVR Received)
// 2. Evernode (Get Account Info)
// 3. Google Sheets (Log Transaction)
```

### Lease Cost Calculator

```javascript
// Workflow: Cost Estimation
// 1. Webhook (Receive Requirements)
// 2. Evernode (Calculate Lease Price)
// 3. Respond to Webhook
```

### Network Health Dashboard

```javascript
// Workflow: Health Check
// 1. Schedule Trigger (Every Hour)
// 2. Evernode (Get Network Info)
// 3. Evernode (Get Server Info)
// 4. InfluxDB (Store Metrics)
```

## Development

### Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- n8n installed locally

### Setup

```bash
# Clone repository
git clone https://github.com/Velocity-BPA/n8n-nodes-evernode.git
cd n8n-nodes-evernode

# Install dependencies
npm install

# Build
npm run build

# Development mode with watch
npm run build:watch
```

### Project Structure

```
n8n-nodes-evernode/
├── credentials/
│   ├── EvernodeNetwork.credentials.ts
│   ├── XrplCredentials.credentials.ts
│   └── HotPocket.credentials.ts
├── nodes/
│   └── Evernode/
│       ├── Evernode.node.ts
│       ├── EvernodeTrigger.node.ts
│       ├── evernode.svg
│       ├── constants/
│       ├── transport/
│       └── utils/
├── test/
├── package.json
├── tsconfig.json
├── LICENSE
├── COMMERCIAL_LICENSE.md
├── LICENSING_FAQ.md
└── README.md
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=utils

# Run integration tests (requires network)
RUN_NETWORK_TESTS=true npm test -- --testPathPattern=integration
```

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use

Permitted for personal, educational, research, and internal business use.

### Commercial Use

Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Author

**Velocity BPA**

- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Support

- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-evernode/issues)
- [Evernode Documentation](https://docs.evernode.org)
- [n8n Community](https://community.n8n.io)

## Acknowledgments

- [Evernode](https://evernode.org) - Decentralized hosting network
- [XRPL](https://xrpl.org) - XRP Ledger
- [n8n](https://n8n.io) - Workflow automation platform
