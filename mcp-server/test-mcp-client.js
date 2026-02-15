import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

const transport = new StdioClientTransport({ 
    command: "node", 
    args: ["index.js"],
    env: process.env
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log("Available tools:", tools);

// Call a tool
try {
    const result = await client.callTool({ name: "db_leggi_articoli", arguments: { limit: 3 } });
    console.log("Result:", result);
} catch (e) {
    console.error("DB Error:", e.message);
}

// Test API call
try {
    const apiResult = await client.callTool({ name: "api_lista_articoli", arguments: {} });
    console.log("API Result:", apiResult);
} catch (e) {
    console.error("API Error:", e.message);
}

await client.close();
