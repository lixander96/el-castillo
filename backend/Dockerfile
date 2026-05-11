# ================================
# Stage 1: Build
# ================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:18-alpine AS production

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar package.json para instalar solo dependencias de producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el código compilado desde el stage de build
COPY --from=builder /app/dist ./dist

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

# Cambiar a usuario no-root
USER nestjs

# Exponer el puerto de la aplicación
EXPOSE 3000

# Variable de entorno para producción
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "dist/src/main.js"]
