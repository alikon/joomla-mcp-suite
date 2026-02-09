import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    prefix: process.env.DB_PREFIX || "jos_"
};

const server = new Server(
    { name: "joomla-full-access", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

const pool = mysql.createPool(dbConfig);
const JOOMLA_ROOT = "/var/www/html";

// 1. LISTA DEI TOOLS
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "db_leggi_articoli",
            description: "Ottiene gli ultimi articoli dal database",
            inputSchema: { type: "object", properties: { limit: { type: "number", default: 5 } } }
        },
        {
            name: "db_crea_articolo",
            description: "Crea un nuovo articolo nel database di Joomla",
            inputSchema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    alias: { type: "string" },
                    introtext: { type: "string" },
                    catid: { type: "number", default: 2 }
                },
                required: ["title", "introtext"]
            }
        },
        {
            name: "file_leggi",
            description: "Legge un file (CSS, PHP, JS) dalla cartella di Joomla",
            inputSchema: {
                type: "object",
                properties: { relative_path: { type: "string" } },
                required: ["relative_path"]
            }
        },
        {
            name: "file_scrivi",
            description: "Scrive o sovrascrive un file nella cartella di Joomla (es. per CSS personalizzato)",
            inputSchema: {
                type: "object",
                properties: {
                    relative_path: { type: "string" },
                    content: { type: "string" }
                },
                required: ["relative_path", "content"]
            }
        }
    ]
}));

// 2. LOGICA DEI TOOLS
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const prefix = dbConfig.prefix;

    try {
        switch (name) {
            case "db_leggi_articoli":
                const [articles] = await pool.execute(`SELECT id, title, created FROM ${prefix}content ORDER BY created DESC LIMIT ?`, [String(args.limit || 5)]);
                return { content: [{ type: "text", text: JSON.stringify(articles, null, 2) }] };

            case "db_crea_articolo":
                const sql = `INSERT INTO ${prefix}content (title, alias, introtext, catid, state, language, created) VALUES (?, ?, ?, ?, 1, '*', NOW())`;
                const [res] = await pool.execute(sql, [args.title, args.alias || args.title.toLowerCase().replace(/ /g, '-'), args.introtext, String(args.catid)]);
                return { content: [{ type: "text", text: `Articolo creato con ID: ${res.insertId}` }] };

            case "file_leggi":
                const readPath = path.join(JOOMLA_ROOT, args.relative_path.replace(/^(\.\.[\/\\])+/, ''));
                const data = await fs.readFile(readPath, "utf-8");
                return { content: [{ type: "text", text: data }] };

            case "file_scrivi":
                const writePath = path.join(JOOMLA_ROOT, args.relative_path.replace(/^(\.\.[\/\\])+/, ''));
                await fs.writeFile(writePath, args.content, "utf-8");
                return { content: [{ type: "text", text: `File ${args.relative_path} aggiornato con successo.` }] };

            default:
                throw new Error("Tool non trovato");
        }
    } catch (error) {
        return { content: [{ type: "text", text: `Errore: ${error.message}` }], isError: true };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
