FROM node:20-alpine
# su-exec lets the entrypoint drop from root → node after fixing volume permissions
RUN apk add --no-cache su-exec
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install
COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && mkdir -p /app/data
# NOTE: no USER directive here — the entrypoint runs as root to chown /app/data
# (the named volume overrides the directory created at build time), then execs
# as the 'node' user via su-exec.
EXPOSE 3001
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
