# ================================
# Stage 1: Build
# ================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias.
# --legacy-peer-deps porque react-qr-reader@3.0.0-beta-1 declara react@^16||^17
# como peer y el proyecto usa react@18. Es un conflicto de declaracion, no
# de runtime; npm 7+ falla en estricto si no lo permitimos explicitamente.
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Argumento para la URL del API (se pasa en build time)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación
RUN npm run build

# ================================
# Stage 2: Production con Nginx
# ================================
FROM nginx:alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde el stage de build
COPY --from=builder /app/build /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]




