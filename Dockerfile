# ---------- Builder (Vite) ----------
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN node --max-old-space-size=1536 ./node_modules/vite/bin/vite.js build

# ---------- Runtime (Nginx) ----------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]