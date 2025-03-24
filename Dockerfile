# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Run build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY tsconfig.json ./

# Create a non-root user
RUN addgroup -g 1001 nestjs && \
    adduser -S -u 1001 -G nestjs nestjs && \
    chown -R nestjs:nestjs /app

USER nestjs

# Expose application port
EXPOSE 4000

# Correct path to the compiled main.js
CMD ["node", "dist/src/main"]