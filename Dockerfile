# =============================================================================
# MuzaLife Frontend — Dockerfile
#
# Multi-stage build:
#   Stage 1 (builder): Installs deps and runs `npm run build`
#   Stage 2 (nginx):   Serves the static bundle with Nginx
#
# Build:  docker build --build-arg VITE_API_URL=https://api.muzalife.com/api -t muzalife-frontend .
# Run:    docker run -p 80:80 -p 443:443 muzalife-frontend
# =============================================================================

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time arguments (Vite bakes these into the bundle)
ARG VITE_API_URL=https://localhost:5001/api
ARG VITE_APP_NAME=MuzaLife
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_FACEBOOK_APP_ID=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_FACEBOOK_APP_ID=$VITE_FACEBOOK_APP_ID

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ── Stage 2: Nginx ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx config for SPA (React Router)
RUN cat > /etc/nginx/conf.d/muzalife.conf <<'EOF'
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # React Router — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1
