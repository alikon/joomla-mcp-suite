# Joomla MCP Suite

A Model Context Protocol (MCP) server that enables AI agents to safely interact with a Joomla site running in Docker.

## What is this?

This project provides a bridge between AI assistants (like Claude Desktop) and a local Joomla instance, allowing the AI to:

- Read and list Joomla articles from the database
- Create and modify articles via Joomla's REST API
- Read and write files in the Joomla installation
- Execute safe database queries
- Manage Joomla content through controlled MCP tools

## Architecture

The project consists of three Docker services:

- **db**: MySQL 8.0 database for Joomla
- **joomla**: Official Joomla container (accessible at http://localhost:8080)
- **mcp-server**: Node.js MCP server that connects to both the database and Joomla API

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local testing)
- A compatible MCP client (e.g., Claude Desktop)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd joomla-mcp-suite
```

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
echo "JOOMLA_API_TOKEN=your_token_here" > .env
```

(You'll update this with a real token after Joomla installation)

### 3. Start the Docker Stack

```bash
docker compose up -d
```

This will start:
- MySQL database on internal network
- Joomla site on http://localhost:8080
- MCP server container

### 4. Install Joomla

1. Open your browser at http://localhost:8080
2. Complete the Joomla installation wizard:
   - Set site name, admin username, and password
   - Database configuration (should auto-fill):
     - Host: `db`
     - Database: `joomla_db`
     - Username: `joomla_user`
     - Password: `joomla_password`
3. Complete the installation

### 5. Generate Joomla API Token

1. Log in to Joomla admin: http://localhost:8080/administrator
2. Navigate to **System → Manage → API Tokens** (or User profile → API Token)
3. Create a new API token
4. Copy the generated token

### 6. Update Environment File

Edit `.env` with your real API token:

```bash
JOOMLA_API_TOKEN=your_actual_token_here
```

Restart the MCP server to load the new token:

```bash
docker compose restart mcp-server
```

## Available MCP Tools

The server exposes the following tools:

### Database Tools

- **db_leggi_articoli**: Read articles from database
  - Parameters: `limit` (number, default: 5)
  
- **db_crea_articolo**: Create article via direct database insert
  - Parameters: `title` (string), `introtext` (string), `alias` (optional), `catid` (number, default: 2)

### File System Tools

- **file_leggi**: Read a file from Joomla installation
  - Parameters: `relative_path` (string)
  
- **file_scrivi**: Write/overwrite a file in Joomla installation
  - Parameters: `relative_path` (string), `content` (string)

### API Tools

- **api_lista_articoli**: List articles using Joomla REST API
  - Parameters: none
  
- **api_crea_articolo**: Create article via Joomla REST API
  - Parameters: `title` (string), `articletext` (string), `catid` (number, default: 2), `language` (string, default: "*")
  
- **api_modifica_articolo**: Update an existing article
  - Parameters: `id` (string), `title` (string), `articletext` (string)

## Testing the MCP Server

### Run All Tests

```bash
docker exec -it joomla_mcp node test-all-tools.js
```

This will test all available tools and display a summary report.

### Test Individual Components

Test database connection:
```bash
docker exec -it joomla_mcp node test-db.js
```

Test API connection:
```bash
docker exec -it joomla_mcp node test-api.js
```

Test MCP client:
```bash
docker exec -it joomla_mcp node test-mcp-client.js
```

## Connecting to Claude Desktop

Add this configuration to your Claude Desktop config file:

**Linux/macOS**: `~/.config/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "joomla-master": {
      "command": "docker",
      "args": ["exec", "-i", "joomla_mcp", "node", "index.js"]
    }
  }
}
```

Restart Claude Desktop to load the MCP server.

## Using with GitHub Codespaces

The project includes a `.devcontainer` configuration for GitHub Codespaces:

1. Open the repository in Codespaces
2. The environment will automatically set up
3. Access Joomla via the forwarded port 8080
4. Follow steps 4-6 from the setup instructions

## Project Structure

```
joomla-mcp-suite/
├── .devcontainer/          # Codespaces configuration
│   ├── devcontainer.json
│   └── docker-compose.yaml
├── mcp-server/             # MCP server implementation
│   ├── Dockerfile
│   ├── index.js            # Main MCP server
│   ├── package.json
│   ├── test-all-tools.js   # Comprehensive test suite
│   ├── test-api.js         # API connectivity test
│   ├── test-db.js          # Database connectivity test
│   └── test-mcp-client.js  # MCP client test
├── scripts/
│   └── auto_install.sh     # Joomla auto-install script
├── docker-compose.yml      # Main Docker configuration
├── .env                    # Environment variables (create this)
├── .gitignore
└── README.md
```

## Environment Variables

The MCP server uses these environment variables:

- `DB_HOST`: Database host (default: `db`)
- `DB_USER`: Database user (default: `joomla_user`)
- `DB_PASSWORD`: Database password (default: `joomla_password`)
- `DB_NAME`: Database name (default: `joomla_db`)
- `DB_PREFIX`: Table prefix (default: `joos_`)
- `JOOMLA_API_TOKEN`: Your Joomla API token
- `JOOMLA_API_BASE`: API base URL (default: `http://joomla/api/index.php/v1`)

## Troubleshooting

### Port 8080 already in use

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Use 8081 instead
```

### MCP server can't connect to database

Check if all containers are running:
```bash
docker ps
```

Restart the stack:
```bash
docker compose down
docker compose up -d
```

### API calls fail

1. Verify the API token is set correctly in `.env`
2. Check that Joomla API is enabled in Joomla admin
3. Restart the MCP server after updating the token

### Test failures

View detailed logs:
```bash
docker logs joomla_mcp
docker logs joomla_site
docker logs joomla_db
```

## Development

### Rebuild MCP Server

After making changes to the MCP server code:

```bash
docker compose up -d --build mcp-server
```

### Access Container Shell

```bash
docker exec -it joomla_mcp sh
```

### View Logs

```bash
docker compose logs -f mcp-server
```

## Security Notes

- The `.env` file contains sensitive information and is excluded from git
- API tokens should be kept secure and rotated regularly
- The MCP server has full access to the Joomla database and files
- Only use this setup in development environments

## License

[Your License Here]

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
