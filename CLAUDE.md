# El Castillo Barracas

Plataforma web para venta de entradas, gestion de eventos, artistas y cobros online.

## Estructura del repo

- `frontend/` — SPA en React + Vite + Tailwind (Radix UI). Es la app real que se sirve a los usuarios.
- `backend/` — API en NestJS + TypeORM + Postgres. Maneja auth (JWT + Google OAuth), eventos, ordenes, pagos (Mercado Pago), mailer y WhatsApp. **En produccion tambien sirve la SPA y los uploads** (ver Arquitectura).
- `figma-design/` — **Maquetacion vieja, NO TOCAR.** Es solo un export estatico del diseño original de Figma, no forma parte de la app productiva. No correr build, no incluir en deploys, no usar como referencia de código actual (puede estar desactualizada respecto al frontend real).
- `Dockerfile` (raiz) — imagen unica multi-stage: buildea el frontend, buildea el backend y arma un runtime donde NestJS sirve API + SPA + uploads. Contexto de build = raiz del repo.
- `docker-compose.yml` + `.env.example` — orquestacion del stack (app + Postgres) detras de **Traefik** (TLS/Let's Encrypt), listo para VPS multi-cliente.
- `docker-compose.local.yml` — variante standalone para correr en local sin Traefik (publica el puerto al host).

## Arquitectura (un solo contenedor)

No hay nginx ni contenedor de frontend aparte. **Un unico contenedor de app
(NestJS)** sirve todo en un solo dominio:

- **SPA** (`index.html` + assets del build de Vite) en la raiz `/`.
- **API** bajo el prefijo **`/api`** (`app.setGlobalPrefix('api')` en `main.ts`).
- **Uploads** (imagenes) en **`/api/uploads`** (ServeStaticModule).
- **`/evento/:slug`** lo maneja `OgController` (excluido del prefijo `/api`):
  devuelve HTML con meta tags Open Graph a los bots sociales (WhatsApp, etc.)
  y la SPA al resto.

Como front y API comparten dominio: **no hay CORS** y el front llama a `/api`
relativo (`VITE_API_URL=/api`, horneado en el `Dockerfile`). La misma imagen
sirve para cualquier dominio/cliente.

## Arrancar en local con Docker

```bash
cp .env.example .env       # editar credenciales
docker compose -f docker-compose.local.yml up -d --build
```

- App (SPA + API): http://localhost:3000 (configurable via `APP_PORT`)
- Postgres: solo accesible via la red interna (descomenta el `ports:` en `docker-compose.local.yml` si necesitas conectarte con psql/DBeaver)

El compose local fuerza `FRONTEND_URL`/`BACKEND_URL` a `localhost` para que
todo funcione sin tocar el `.env` de prod.

## Deploy en VPS detras de Traefik

El `docker-compose.yml` principal asume que ya tenes un contenedor **Traefik**
corriendo aparte, con un entrypoint `websecure`, un certresolver `letsencrypt`
y una red externa llamada `traefik-proxy`. El stack se conecta a esa red y se
publica por labels (no expone puertos al host).

Todo sale por un unico dominio: `https://${TRAEFIK_HOST}` (SPA en `/`, API en
`/api`, uploads en `/api/uploads`, Swagger en `/api/documentation`).

Pasos:

1. Clonar el repo en el VPS y `cd` al root.
2. `cp .env.example .env` y completar **todos** los valores reales. Clave:
   `COMPOSE_PROJECT_NAME` (unico por cliente), `TRAEFIK_HOST` (el dominio),
   DB password, JWT_SECRET, creds Google/MP/SMTP/WhatsApp.
3. Apuntar `${TRAEFIK_HOST}` al IP del VPS (un registro A). **No hace falta
   subdominio `api.*`.**
4. Asegurarte de que la red externa exista: `docker network create traefik-proxy`
   (si no la creo ya el stack de Traefik).
5. `docker compose up -d --build`
6. Verificar logs: `docker compose logs -f`

### Variables clave para prod

- `COMPOSE_PROJECT_NAME`: nombre del stack. Define el prefijo de los contenedores
  (`<nombre>-db|app`), la red interna (`<nombre>-net`) y el router de Traefik.
  Unico por cliente para no colisionar.
- `TRAEFIK_HOST`: dominio publico unico. Todo (SPA + API) sale por aca.
- `FRONTEND_URL=https://${TRAEFIK_HOST}` y `BACKEND_URL=BASE_PUBLIC_URL=https://${TRAEFIK_HOST}/api`.
- `GOOGLE_CALLBACK_URL=https://${TRAEFIK_HOST}/api/auth/google/callback`: tiene que
  coincidir con lo configurado en Google Cloud Console (**con** `/api`).
- `TYPEORM_SYNCHRONIZE=false` en prod si ya tenes el esquema estable; pasar a migrations con `npm run migration:run`.
- `POSTGRES_PASSWORD` y `JWT_SECRET`: regenerarlos antes de prod, **no usar los del ejemplo**.
- `VITE_API_URL` ya **no** se setea en `.env`: se hornea a `/api` en el `Dockerfile`.

### Mercado Pago: app OAuth global + connect por cliente

La plataforma usa **una sola app** de Mercado Pago, registrada por vos como
operador. El Client ID y Secret van en el `.env` de cada deployment y son
los mismos para todos tus clientes. El cliente (admin de la instancia)
nunca los ve: solo clickea "Conectar con Mercado Pago" en `/configuracion`
y autoriza con su mail/pass de MP (personal o de negocio, da igual).

**Setup unico de la plataforma (vos):**

1. Crear UNA app en https://www.mercadopago.com.ar/developers/panel/app.
2. En "URIs de redireccion" agregar la URL de cada deployment que tengas:
   `${BACKEND_URL}/payments/mp/oauth/callback`. Se pueden registrar varias.
3. En "Webhooks" no hace falta configurar nada a nivel app: cada
   preferencia que el backend crea ya manda `notification_url` apuntando
   a `${BACKEND_URL}/mercadopago/webhook` del propio deployment.
4. Copiar Client ID y Secret al `.env` de cada deployment:
   `MP_OAUTH_CLIENT_ID` y `MP_OAUTH_CLIENT_SECRET`.

**Por cada cliente nuevo que clones:**

1. Deploy de la app con `.env` propio (DB, JWT, etc) + las creds OAuth de
   arriba (las mismas para todos).
2. Agregar el callback URL del nuevo deployment a la app de MP developers.
3. El admin entra a `/configuracion`, clickea "Conectar con Mercado Pago",
   se loguea en MP con la cuenta donde quiere recibir los pagos, y listo.

El backend guarda `access_token`, `refresh_token`, `user_id`, `email` y
`nickname` de la cuenta en `site_settings`. Antes de cada llamada al SDK,
si el token esta por vencer (< 5min), se refresca automaticamente.

Los webhooks que entran a `${BACKEND_URL}/mercadopago/webhook` se filtran
por `collector_id` contra el `mpUserId` guardado: cualquier notificacion
que no sea para la cuenta conectada en esa instancia se descarta.

Hasta que el cliente no conecte una cuenta, `POST /payments/checkout` y
`POST /payments/process` devuelven 503.

### Volumenes persistentes

- `postgres-data` — datos de Postgres.
- `backend-uploads` — archivos subidos por la app (`/app/uploads`). Hacer backup periodico.

```bash
# Backup. El volumen de uploads se llama <COMPOSE_PROJECT_NAME>_backend-uploads
# (var con `docker volume ls`).
docker compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql
docker run --rm -v <COMPOSE_PROJECT_NAME>_backend-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .
```

## Comandos utiles

```bash
docker compose up -d --build      # construir y arrancar
docker compose down               # detener (no borra volumenes)
docker compose logs -f app        # logs de la app (NestJS)
docker compose exec app sh        # shell dentro del contenedor de la app
docker compose exec db psql -U $POSTGRES_USER $POSTGRES_DB   # acceso a la DB
```

## Notas tecnicas

- El backend compila a `dist/src/main.js` (no `dist/main.js`) porque Nest detecta `scripts/` como hermano de `src/` y preserva el árbol. El `Dockerfile` ya apunta ahí.
- La API va bajo el prefijo `/api` (`setGlobalPrefix`), excepto `GET /evento/:slug` (OG, lo sirve `OgController` en la raiz). Si agregas rutas publicas sin `/api`, sumalas al `exclude` del prefijo global.
- El build del frontend se copia a `/app/client` en la imagen; NestJS lo sirve con `ServeStaticModule` (catch-all con `exclude: ['/api/(.*)']`).
- `frontend/vite.config.ts` tiene aliases con sufijos de version (ej. `vaul@1.1.2 -> vaul`) — son artefactos del export de Figma; no remover sin antes verificar que ningun import los use.
- Swagger queda en `https://${TRAEFIK_HOST}/api/documentation`.
