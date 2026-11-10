# Dashboard image: build the Angular app, then serve it with nginx.
# nginx also proxies /api to the email-service backend (see nginx/).
#
#   docker build -t email-service-ng .
#   docker run -p 8080:80 -e API_UPSTREAM=http://host.docker.internal:3000 email-service-ng

# ---- Build -----------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx ng build --configuration production

# ---- Serve -----------------------------------------------------------------
FROM nginx:1.29-alpine

# Where /api is forwarded. The default matches the backend's Compose service
# when both run on the same Docker network.
ENV API_UPSTREAM=http://app:3000 \
    API_TIMEOUT=60s

# The official image runs envsubst on /etc/nginx/templates/*.template at start
# and writes the result to /etc/nginx/conf.d/. Only our variables are
# substituted, so nginx's own $variables are left alone.
ENV NGINX_ENVSUBST_FILTER="^API_"
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf

COPY --from=build /app/dist/email-service-ng/browser /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
