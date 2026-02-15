FROM node:18-slim
WORKDIR /app

COPY package.json ./
RUN npm install

COPY *.js ./

# Questo comando viene ignorato se nel docker-compose c'è "command: sleep infinity"
CMD ["node", "index.js"]