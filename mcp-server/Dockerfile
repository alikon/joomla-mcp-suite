FROM node:18-slim
WORKDIR /app

# Copiamo i file indicando il percorso relativo al "context" (la root del progetto)
COPY mcp-server/package.json ./
RUN npm install

# Copiamo l'index correggendo il percorso
COPY mcp-server/index.js ./

# Questo comando viene ignorato se nel docker-compose c'è "command: sleep infinity"
CMD ["node", "index.js"]