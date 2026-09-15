#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Servir explicitamente o server-card.json para o Smithery pular o scan
app.get("/.well-known/mcp/server-card.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, ".well-known", "mcp", "server-card.json"));
});

const server = new Server(
  { name: "milligate-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_alpha_data",
        description: "Retrieves restricted alpha market intelligence from the MilliGate API.",
        inputSchema: {
          type: "object",
          properties: {
            walletAddress: {
              type: "string",
              description: "The Ethereum wallet address (0x...) that executed the payment.",
            },
          },
          required: ["walletAddress"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_alpha_data") {
    const { walletAddress } = request.params.arguments;
    try {
      const apiResponse = await fetch("https://api.milligate.io/api/alpha-data", {
        method: "GET",
        headers: { "x-wallet-address": walletAddress, "Content-Type": "application/json" },
      });
      const text = await apiResponse.text();
      let responseData;
      try { responseData = JSON.parse(text); } catch { responseData = { status: apiResponse.status, body: text }; }
      return { content: [{ type: "text", text: JSON.stringify(responseData, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
    }
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

let transport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No active SSE transport session");
  }
});

app.listen(port, () => {
  console.log(`MilliGate MCP SSE Server running on port ${port}`);
});
