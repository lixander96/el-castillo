# El Castillo Barracas

Plataforma web para venta de entradas, gestion de eventos, artistas y cobros online.

## Estructura del repo

- `frontend/` — SPA en React + Vite + Tailwind (Radix UI). Es la app real que se sirve a los usuarios.
- `backend/` — API en NestJS + TypeORM + Postgres. Maneja auth (JWT + Google OAuth), eventos, ordenes, pagos (Mercado Pago), mailer y WhatsApp.
- `figma-design/` — **Maquetacion vieja, NO TOCAR.** Es solo un export estatico del diseño original de Figma, no forma parte de la app productiva. No correr build, no incluir en deploys, no usar como referencia de código actual (puede estar desactualizada respecto al frontend real).
- `docker-compose.yml` + `.env.example` — orquestacion para correr todo el stack (frontend + backend + Postgres) con Docker, listo para VPS.

## Arrancar en local con Docker

```bash
cp .env.example .env       # editar credenciales
docker compose up -d --build
```

- Frontend: http://localhost (puerto 80 por defecto, configurable via `FRONTEND_PORT`)
- Backend: solo accesible via la red interna de Docker, proxeado por nginx en `/api/`
- Postgres: solo accesible via la red interna (descomenta el `ports:` en `docker-compose.yml` si necesitas conectarte con psql/DBeaver)

Para apuntar al backend en local sin pasar por nginx, cambia `VITE_API_URL` en `.env` a `http://localhost:3000` y descomenta el publish del puerto del backend en `docker-compose.yml`.

## Deploy en VPS de Hostinger

1. Clonar el repo en el VPS y `cd` al root.
2. `cp .env.example .env` y completar **todos** los valores reales (DB password, JWT_SECRET, credenciales de Google/MP/SMTP/WhatsApp, URLs publicas con el dominio real).
3. Apuntar el dominio (Hostinger DNS) al IP del VPS.
4. Para HTTPS:
   - **Opcion A (recomendada):** poner nginx o Caddy del **host** delante del contenedor frontend. Setear `FRONTEND_PORT=8080` (o el que prefieras), y el reverse proxy del host termina TLS y proxea a `127.0.0.1:8080`. Certbot/Letsencrypt en el host.
   - **Opcion B:** Traefik como contenedor adicional (no incluido).
5. `docker compose up -d --build`
6. Verificar logs: `docker compose logs -f`

### Variables clave para prod

- `FRONTEND_URL`, `BACKEND_URL`, `BASE_PUBLIC_URL`: URLs publicas con el dominio real (https://).
- `VITE_API_URL=/api`: deja que el frontend llame al backend por el mismo dominio (nginx hace el proxy).
- `GOOGLE_CALLBACK_URL`: tiene que coincidir con lo que esta configurado en Google Cloud Console.
- `TYPEORM_SYNCHRONIZE=false` en prod si ya tenes el esquema estable; pasar a migrations con `npm run migration:run`.
- `POSTGRES_PASSWORD` y `JWT_SECRET`: regenerarlos antes de prod, **no usar los del ejemplo**.

### Onboarding de un nuevo cliente

Una vez levantada la instancia, un administrador entra a `/configuracion` (visible
en el nav solo con rol `ADMIN`) y carga desde la UI:

- Logo claro / oscuro, imagen hero, favicon, nombre del sitio y tagline.
- Access token de Mercado Pago + (opcional) webhook secret. La URL de webhook
  para pegar en el panel de MP esta visible en esa misma pantalla.

Las credenciales de MP **viven en la tabla `site_settings`** de la DB, no en
`.env`. Hasta que un admin no las cargue, los endpoints `POST /payments/checkout`
y `POST /payments/process` devuelven 503.

### Volumenes persistentes

- `postgres-data` — datos de Postgres.
- `backend-uploads` — archivos subidos por el backend (`/app/uploads`). Hacer backup periodico.

```bash
# Backup
docker compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql
docker run --rm -v el-castillo_backend-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .
```

## Comandos utiles

```bash
docker compose up -d --build      # construir y arrancar
docker compose down               # detener (no borra volumenes)
docker compose logs -f backend    # logs del back
docker compose exec backend sh    # shell dentro del contenedor backend
docker compose exec db psql -U $POSTGRES_USER $POSTGRES_DB   # acceso a la DB
```

## Notas tecnicas

- El backend compila a `dist/src/main.js` (no `dist/main.js`) porque Nest detecta `scripts/` como hermano de `src/` y preserva el árbol. El Dockerfile ya apunta ahí.
- `frontend/vite.config.ts` tiene aliases con sufijos de version (ej. `vaul@1.1.2 -> vaul`) — son artefactos del export de Figma; no remover sin antes verificar que ningun import los use.
- El backend expone Swagger en `/documentation` (visible una vez detras del proxy: `https://tu-dominio/api/documentation`).
