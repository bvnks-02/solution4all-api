FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

# Initialize upload directories (not copied from host due to .dockerignore)
RUN mkdir -p uploads/products uploads/category

# Entryppoint runs seed then starts server
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Health check hits the root route
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
