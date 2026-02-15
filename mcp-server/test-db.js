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
await conn.end();
