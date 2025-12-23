# GitHub Setup Commands

## Initial Repository Setup

```bash
# Extract and navigate
unzip n8n-nodes-evernode.zip
cd n8n-nodes-evernode

# Initialize and push
git init
git add .
git commit -m "Initial commit: n8n Evernode blockchain community node

Features:
- Account: Get balance, account info, trustlines, transactions
- EVR Token: Get token info, balance, issuer details
- Host: Get host info, active hosts, reputation
- Tenant: Get tenant info, leases
- Lease: Calculate costs, get lease info
- Registry: Get registry info, moment info
- Reputation: Get reputation tier
- Pricing: Calculate lease prices
- Network: Get network info, server stats
- Utility: Validate address, unit conversion, ledger info
- Trigger: Real-time event monitoring for hosts, tenants, moments, EVR transfers

License: Business Source License 1.1 (BUSL-1.1)"

git remote add origin https://github.com/Velocity-BPA/n8n-nodes-evernode.git
git branch -M main
git push -u origin main
```

## Updating Existing Repository

```bash
cd n8n-nodes-evernode
git add .
git commit -m "Update: <description of changes>"
git push origin main
```

## Creating a Release

```bash
# Tag a release
git tag -a v1.0.0 -m "v1.0.0 - Initial release (BUSL-1.1)"
git push origin v1.0.0
```
