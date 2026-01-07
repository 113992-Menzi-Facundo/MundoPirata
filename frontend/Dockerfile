# Multi-stage build for Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG API_URL=http://localhost:8080
ARG MERCADOPAGO_PUBLIC_KEY=APP_USR-7455f78f-5166-463f-b145-cf2fc137b34f

# Set environment variables for the build
ENV API_URL=${API_URL}
ENV MERCADOPAGO_PUBLIC_KEY=${MERCADOPAGO_PUBLIC_KEY}

# Replace environment variables in production environment file using Node script
RUN node replace-env.js

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/mundo-pirata/browser /usr/share/nginx/html

# Copy nginx configuration (optional, for SPA routing)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

