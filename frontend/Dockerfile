# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app
# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build arguments
ARG GEMINI_API_KEY
ARG BACKEND_PORT
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV BACKEND_PORT=$BACKEND_PORT

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port $BACKEND_PORT
EXPOSE $BACKEND_PORT

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
