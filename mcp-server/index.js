import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

const API_TOKEN = process.env.JOOMLA_API_TOKEN;
const API_BASE = process.env.JOOMLA_API_BASE;
const JOOMLA_ROOT = "/var/www/html";

const server = new Server(
    { name: "joomla-hybrid-mcp", version: "1.2.0" },
    { capabilities: { tools: {} } }
);

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    prefix: process.env.DB_PREFIX || "jos_"
};

// Helper per le chiamate API
async function joomlaApi(endpoint, method = 'GET', body = null) {
    const headers = {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json'
    };
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.errors?.[0]?.title || response.statusText);
    }
    return await response.json();
}



const pool = mysql.createPool(dbConfig);

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
        },
        // --- NUOVI TOOLS (API WEB SERVICES) ---
        {
            name: "api_lista_articoli",
            description: "Elenca articoli usando le API native (più sicuro del DB)",
            inputSchema: { type: "object", properties: {} }
        },
        {
            name: "api_crea_articolo",
            description: "Crea un articolo tramite API (gestisce alias e categorie)",
            inputSchema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    articletext: { type: "string" },
                    catid: { type: "number", default: 2 },
                    language: { type: "string", default: "*" }
                },
                required: ["title", "articletext"]
            }
        },
        {
            name: "api_modifica_articolo",
            description: "Aggiorna il contenuto di un articolo esistente tramite ID",
            inputSchema: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    articletext: { type: "string" }
                },
                required: ["id"]
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

            case "api_lista_articoli":
                const list = await joomlaApi("/content/articles");
                const simplified = list.data.map(a => ({ id: a.id, title: a.attributes.title, state: a.attributes.state }));
                return { content: [{ type: "text", text: JSON.stringify(simplified, null, 2) }] };

            case "api_crea_articolo":
                const newArt = await joomlaApi("/content/articles", "POST", {
                    title: args.title,
                    articletext: args.articletext,
                    catid: args.catid,
                    language: args.language,
                    state: 1
                });
                return { content: [{ type: "text", text: `Articolo creato con successo! ID: ${newArt.data.id}` }] };

            case "api_modifica_articolo":
                await joomlaApi(`/content/articles/${args.id}`, "PATCH", {
                    title: args.title,
                    articletext: args.articletext
                });
                return { content: [{ type: "text", text: `Articolo ${args.id} aggiornato.` }] };

            default:
                throw new Error("Tool non trovato");
        }
    } catch (error) {
        return { content: [{ type: "text", text: `Errore: ${error.message}` }], isError: true };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
