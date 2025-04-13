# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm install -g typescript

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY knexfile.ts ./
COPY wait-for-it.sh /wait-for-it.sh

# Install postgresql-client and necessary tools
RUN apk add --no-cache postgresql-client bash curl openssl

# Make wait script executable
RUN chmod +x /wait-for-it.sh

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command - use a more resilient approach
CMD ["/bin/bash", "-c", "/wait-for-it.sh postgres 5432 -- node dist/app.js || node dist/app.js"]