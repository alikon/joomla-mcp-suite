# joomla-mcp-suite
joomla mcp tools
Here’s an overview of what this MCP does and how to use it.

What this MCP is
This project is a Joomla MCP (Model Context Protocol) server that lets an AI agent safely interact with a Joomla site running in Docker.

In practice, it:

Spins up a Joomla site (joomla service) with a MySQL DB.
Spins up a backend service (mcp-server) that:
Connects to the Joomla database.
Reads/writes your Joomla codebase (via the ./joomla_html volume).
Calls Joomla’s web API (/api/index.php/v1) using an API token.
Exposes MCP tools so an AI client (like a compatible IDE / LLM environment) can:
Inspect Joomla configuration, database, users, content.
Read and modify PHP / template / plugin files.
Trigger Joomla API operations (CRUD on articles, users, etc.).
Do all that through a controlled interface, instead of arbitrary remote code execution.
Think of it as a bridge between an AI and your local Joomla instance.

How it works (high level)
Docker services (from docker-compose.yml):

db: MySQL container holding the Joomla database.
joomla: Official Joomla container:
Uses ./joomla_html as document root.
Exposes port 8080 → http://localhost:8080.
mcp-server: Custom container:
Built from ./mcp-server.
Uses DB credentials to access Joomla DB.
Mounts the same ./joomla_html folder so it can read/write Joomla files.
Uses:
JOOMLA_API_TOKEN to authenticate to Joomla REST API.
JOOMLA_API_BASE (default http://localhost:8080/api/index.php/v1) for API calls.
How to set it up and run it
1. Create .env with a temporary token value
In the project root (/home/alikon/Desktop/joomla-mcp/joomla-mcp-suite), create .env:

JOOMLA_API_TOKEN=PLACEHOLDER
You will replace this with a real token later; this just removes the warning and lets containers start.

Make sure your .gitignore ignores .env if you don’t want to commit secrets.

2. Start the stack
From the root folder:

docker compose up -d
This will start:

MySQL (joomla_db)
Joomla (joomla_site on port 8080)
MCP server (joomla_mcp)
3. Install Joomla
Open your browser at:

http://localhost:8080
Go through the normal Joomla installer:

Site name, admin user, password, etc.
DB settings should already be correct if using the default docker-compose.yml:
Host: db
DB: joomla_db
User: joomla_user
Password: joomla_password
Once the installation is finished, you have a working Joomla site.

4. Generate a Joomla API token
Depending on your Joomla version and setup, you typically:

Log in to the Joomla admin: http://localhost:8080/administrator
Go to the section where you can generate API tokens, e.g.:
For Joomla 4 core web services:
User profile → “API Token” tab (or similar).
Or any plugin/extension you’ve installed that issues API tokens.
Generate an API token and copy it.
5. Update .env with the real token
Edit .env:

JOOMLA_API_TOKEN=THE_REAL_TOKEN_YOU_JUST_GENERATED
Then restart only the MCP server so it loads the new token:

docker compose up -d mcp-server
How to use the MCP from an AI client
The exact steps depend on your AI client (IDE plugin, CLI, or LLM environment) and how it integrates MCP servers, but conceptually:

Configure the client to connect to the mcp-server (usually via a URL or local port exposed by the container).
The client discovers MCP tools exposed by the server, e.g.:
joomla.listArticles
joomla.getArticle
joomla.updateFile (for editing PHP/template files in joomla_html)
joomla.runQuery (for safe DB queries)
In your AI client, you can then ask things like:
“List all published articles.”
“Create a new article in category X.”
“Edit the index.php of the current template to add a custom header.”
“Check why this plugin is failing and fix the error.”
The AI will call these MCP tools under the hood, using:

The Joomla REST API (secured by JOOMLA_API_TOKEN).
Direct DB access (with the DB env vars).
File system access via the ./joomla_html volume.
Typical workflow example
Start everything:

docker compose up -d
Install Joomla and generate API token.

Put the token into .env and restart mcp-server.

Connect your AI client to the MCP server.

Ask the AI to:

Inspect Joomla content.
Propose code changes (e.g. create a module, modify a plugin).
Apply those changes through MCP tools (the AI edits files and uses the Joomla API safely).
If you tell me which AI client/tool you plan to use (e.g. specific IDE extension or LLM interface), I can give you concrete configuration steps for connecting it to this MCP server.

