import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log("Connected to database!");
const [rows] = await conn.execute("SELECT 1 as test");
console.log("Query result:", rows);
// Test Joomla content table
try {
    const [contentRows] = await conn.execute("SELECT * FROM joos_content LIMIT 5");
    console.log("jos_content sample rows:", contentRows);
} catch (err) {
    console.error("Error querying jos_content:", err.message);
}

// Check if joos_content table exists
try {
    const [tableRows] = await conn.execute(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
        [process.env.DB_NAME, "joos_content"]
    );

    if (tableRows.length === 0) {
        console.log("Table 'joos_content' does NOT exist in database:", process.env.DB_NAME);
    } else {
        console.log("Table 'joos_content' exists.");

        // Test Joomla content table only if it exists
        const [contentRows] = await conn.execute("SELECT * FROM joos_content LIMIT 5");
        console.log("joos_content sample rows:", contentRows);
    }
} catch (err) {
    console.error("Error checking/querying joos_content:", err.message);
}

await conn.end();