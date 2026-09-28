# MilliGate Sovereign MCP Server

[![Network](https://img.shields.io/badge/Network-Base%20L2%20(Chain%20ID%3A%208453)-blue)](https://base.org)
[![Protocol](https://img.shields.io/badge/Protocol-Model%20Context%20Protocol%20(MCP)-green)](https://modelcontextprotocol.io)
[![Tollgate](https://img.shields.io/badge/Tollgate-HTTP%20402%20Payment%20Required-orange)](https://http.cat/402)

**MilliGate** is a Model Context Protocol (MCP) infrastructure and tooling server built specifically for **autonomous agents (M2M - Machine-to-Machine)**. It operates under the sovereign **HTTP 402** micro-settlement standard, requiring on-chain micro-payments to unlock data flows and tool execution.

---

## Architecture and Economic Flow

MilliGate eliminates middlemen and centralized APIs by decentralizing access to compute resources and data directly via **Base L2**:

1. **Discovery:** Agents discover the server and its available tools through the public metadata manifest (`/.well-known/glama.json`).
2. **Blocked Access (HTTP 402):** When attempting to connect to the SSE endpoint (`/sse`), the server responds instantly with a `402 Payment Required` status, providing the invoice, fee amount, and treasury wallet address.
3. **On-Chain Settlement:** The agent executes an **USDC transfer on Base L2**.
4. **Validation and Connection:** The agent retries the request including the transaction hash in the `X-Payment-Proof` header. The middleware validates the receipt directly on-chain via the Base RPC and establishes the bidirectional channel.

---

## Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/sse` | Server-Sent Events stream (Protected by HTTP 402 Tollgate) |
| `POST` | `/message` | JSON-RPC command receiver for tool execution |
| `GET` | `/.well-known/glama.json` | Public metadata manifest for indexers and directories |

---

## Setup and Self-Hosting

### Prerequisites
* Node.js (v18+)
* PM2 (for production process management)
* Reverse tunnel (Cloudflare Tunnel recommended)

### 1. Clone and Install Dependencies
```bash
git clone [https://github.com/seu-usuario/milligate-mcp.git](https://github.com/seu-usuario/milligate-mcp.git)
cd milligate-mcp
npm install

---

## 🤖 AI Agent Payment Instructions (MilliGate 402 Tollgate)

This MCP server is protected by a Web3 HTTP 402 Tollgate. To execute commands, you must provide cryptographic proof of payment on the **Base L2** network.

**Transaction Parameters:**
* **Network:** Base L2 (Chain ID: `8453`)
* **Currency:** USDC (Official Token: `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`)
* **Price:** 0.10 USDC (100000 in raw integer, as USDC uses 6 decimals)
* **Tollgate Contract:** `0x1AE373b13577768ee43c81BEe5AD264104D67Cc4`

**Execution Steps:**
1. Call `approve(0x1AE373b13577768ee43c81BEe5AD264104D67Cc4, 100000)` on the USDC contract.
2. Call `payAndOpen()` on the Tollgate Contract.
3. Send the API request with header: `X-Payment-Proof: <TX_HASH>`
