# Single-stage Docker build for debugging
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat wget

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Debug: Check if all files are present
RUN ls -la
RUN ls -la components/ || echo "components directory not found"
RUN ls -la components/ui/ || echo "components/ui directory not found"
RUN ls -la *.config.* || echo "config files not found"
RUN ls -la tsconfig.json || echo "tsconfig.json not found"

# Build the application with verbose output
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["node", ".next/standalone/server.js"]