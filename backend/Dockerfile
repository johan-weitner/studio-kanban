FROM node:20-alpine
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install
COPY . .
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3001
CMD ["npm", "run", "dev"]
