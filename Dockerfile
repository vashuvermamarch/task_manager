# Build stage for React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production stage for Express Backend & serving static frontend
FROM node:18-alpine
WORKDIR /app

# Copy server package details and install production dependencies
COPY server/package*.json ./server/
RUN npm install --prefix server --only=production

# Copy server files
COPY server/ ./server/

# Copy built frontend assets from the frontend-builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port and configure environment
EXPOSE 8888
ENV PORT=8888
ENV NODE_ENV=production

# Start the application
CMD ["node", "server/server.js"]
