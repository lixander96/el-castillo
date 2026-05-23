# ============================================================
# Imagen unica: el backend NestJS sirve la API (/api), la SPA del
# frontend y los archivos subidos (/api/uploads). No hay nginx ni
# contenedor de frontend aparte.
# Contexto de build = raiz del repo (necesita frontend/ y backend/).
# ============================================================

# ---- Stage 1: build del frontend (SPA) ----
FROM node:18-alpine AS frontend
WORKDIR /front
COPY frontend/package*.json ./
# --legacy-peer-deps: react-qr-reader declara react 16/17 como peer y el
# proyecto usa react 18 (conflicto de declaracion, no de runtime).
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
# Path-based: el front llama a /api (mismo dominio que la SPA).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: build del backend ----
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ---- Stage 3: runtime ----
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app

# Solo dependencias de produccion del backend.
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Codigo compilado del backend + build del frontend (servido como SPA).
COPY --from=backend /app/dist ./dist
COPY --from=frontend /front/build ./client

# Carpeta de uploads (volumen persistente en runtime).
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads /app/client

USER nestjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/src/main.js"]
