import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "test-all-tools", version: "1.0.0" }, { capabilities: {} });

const transport = new StdioClientTransport({ 
    command: "node", 
    args: ["index.js"],
    env: process.env
});

await client.connect(transport);
console.log("✓ Connected to MCP server\n");

const results = { passed: 0, failed: 0, tests: [] };

// Test 1: List all tools
console.log("=== TEST 1: List Tools ===");
try {
    const tools = await client.listTools();
    console.log(`✓ Found ${tools.tools.length} tools`);
    tools.tools.forEach(t => console.log(`  - ${t.name}`));
    results.passed++;
    results.tests.push({ name: "List Tools", status: "PASS" });
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "List Tools", status: "FAIL", error: e.message });
}

// Test 2: db_leggi_articoli
console.log("\n=== TEST 2: db_leggi_articoli ===");
try {
    const result = await client.callTool({ name: "db_leggi_articoli", arguments: { limit: 3 } });
    console.log("✓ Success:", result.content[0].text.substring(0, 100) + "...");
    results.passed++;
    results.tests.push({ name: "db_leggi_articoli", status: "PASS" });
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "db_leggi_articoli", status: "FAIL", error: e.message });
}

// Test 3: db_crea_articolo
console.log("\n=== TEST 3: db_crea_articolo ===");
try {
    const result = await client.callTool({ 
        name: "db_crea_articolo", 
        arguments: { 
            title: "Test Article", 
            introtext: "This is a test article created by MCP",
            catid: 2
        } 
    });
    if (result.isError) {
        console.error("✗ Error:", result.content[0].text);
        results.failed++;
        results.tests.push({ name: "db_crea_articolo", status: "FAIL", error: result.content[0].text });
    } else {
        console.log("✓ Success:", result.content[0].text);
        results.passed++;
        results.tests.push({ name: "db_crea_articolo", status: "PASS" });
    }
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "db_crea_articolo", status: "FAIL", error: e.message });
}

// Test 4: file_leggi
console.log("\n=== TEST 4: file_leggi ===");
try {
    const result = await client.callTool({ 
        name: "file_leggi", 
        arguments: { relative_path: "configuration.php" } 
    });
    if (result.isError) {
        console.error("✗ Error:", result.content[0].text);
        results.failed++;
        results.tests.push({ name: "file_leggi", status: "FAIL", error: result.content[0].text });
    } else {
        console.log("✓ Success: Read", result.content[0].text.length, "bytes");
        results.passed++;
        results.tests.push({ name: "file_leggi", status: "PASS" });
    }
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "file_leggi", status: "FAIL", error: e.message });
}

// Test 5: file_scrivi
console.log("\n=== TEST 5: file_scrivi ===");
try {
    const result = await client.callTool({ 
        name: "file_scrivi", 
        arguments: { 
            relative_path: "test-mcp.txt",
            content: "Test file created by MCP at " + new Date().toISOString()
        } 
    });
    if (result.isError) {
        console.error("✗ Error:", result.content[0].text);
        results.failed++;
        results.tests.push({ name: "file_scrivi", status: "FAIL", error: result.content[0].text });
    } else {
        console.log("✓ Success:", result.content[0].text);
        results.passed++;
        results.tests.push({ name: "file_scrivi", status: "PASS" });
    }
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "file_scrivi", status: "FAIL", error: e.message });
}

// Test 6: api_lista_articoli
console.log("\n=== TEST 6: api_lista_articoli ===");
try {
    const result = await client.callTool({ name: "api_lista_articoli", arguments: {} });
    if (result.isError) {
        console.error("✗ Error:", result.content[0].text);
        results.failed++;
        results.tests.push({ name: "api_lista_articoli", status: "FAIL", error: result.content[0].text });
    } else {
        console.log("✓ Success:", result.content[0].text.substring(0, 100) + "...");
        results.passed++;
        results.tests.push({ name: "api_lista_articoli", status: "PASS" });
    }
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "api_lista_articoli", status: "FAIL", error: e.message });
}

// Test 7: api_crea_articolo
console.log("\n=== TEST 7: api_crea_articolo ===");
try {
    const result = await client.callTool({ 
        name: "api_crea_articolo", 
        arguments: { 
            title: "API Test Article",
            articletext: "This article was created via Joomla API",
            catid: 2
        } 
    });
    if (result.isError) {
        console.error("✗ Error:", result.content[0].text);
        results.failed++;
        results.tests.push({ name: "api_crea_articolo", status: "FAIL", error: result.content[0].text });
    } else {
        console.log("✓ Success:", result.content[0].text);
        results.passed++;
        results.tests.push({ name: "api_crea_articolo", status: "PASS" });
    }
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "api_crea_articolo", status: "FAIL", error: e.message });
}

// Test 8: api_modifica_articolo
console.log("\n=== TEST 8: api_modifica_articolo ===");
try {
    const result = await client.callTool({ 
        name: "api_modifica_articolo", 
        arguments: { 
            id: "1",
            title: "Updated Title",
            articletext: "Updated content"
        } 
    });
    if (result.isError) {
        console.error("✗ Error:", result.content[0].text);
        results.failed++;
        results.tests.push({ name: "api_modifica_articolo", status: "FAIL", error: result.content[0].text });
    } else {
        console.log("✓ Success:", result.content[0].text);
        results.passed++;
        results.tests.push({ name: "api_modifica_articolo", status: "PASS" });
    }
} catch (e) {
    console.error("✗ Error:", e.message);
    results.failed++;
    results.tests.push({ name: "api_modifica_articolo", status: "FAIL", error: e.message });
}

console.log("\n=== TEST SUMMARY ===");
console.log(`Total: ${results.passed + results.failed}`);
console.log(`✓ Passed: ${results.passed}`);
console.log(`✗ Failed: ${results.failed}`);
console.log("\nDetails:");
results.tests.forEach(t => {
    const icon = t.status === "PASS" ? "✓" : "✗";
    console.log(`  ${icon} ${t.name}: ${t.status}`);
    if (t.error) console.log(`    Error: ${t.error}`);
});

await client.close();
