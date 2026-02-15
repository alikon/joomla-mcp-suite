import { spawn } from 'child_process';

const mcp = spawn('node', ['index.js']);

// Send MCP request
const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "db_leggi_articoli",
        arguments: { limit: 3 }
    }
};

mcp.stdin.write(JSON.stringify(request) + '\n');

mcp.stdout.on('data', (data) => {
    console.log('Response:', data.toString());
});

mcp.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
});

setTimeout(() => mcp.kill(), 2000);
