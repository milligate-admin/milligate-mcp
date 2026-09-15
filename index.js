#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MilliGate MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
