# Backend API Guide

## Status
- NestJS 10 application already wired with authentication, events, coupons, orders, payments, uploads, and whatsapp integrations.
- Nuevo rol ACCESO para control de ingreso: comparte capacidades de visitante y puede redimir tickets via `/tickets/redeem/:code`.
- TypeORM is configured for relational databases (MySQL/PostgreSQL) using the data source under `src/database/`.
- Mailer and file upload flows are live; preserve behaviour and side effects unless the user approves a change.

## Tech stack
- Node.js 18, NestJS, TypeORM, Passport (local, JWT, Google), class-validator/-transformer.
- Background jobs with `@nestjs/schedule` and messaging via WhatsApp service.
- Emails delivered through nodemailer; image operations handled by sharp.

## Environment
1. Copy `.env.example` to `.env`.
2. Provide database credentials, JWT secrets, mail transport, and external API keys.
3. `npm install` then `npm run start:dev` to boot the API on the configured port.

## Common scripts
- `npm run start:dev`: development server with live reload.
- `npm run build`: compile to `dist/`.
- `npm run test`, `test:e2e`, `test:cov`: run unit, e2e, and coverage suites.
- `npm run migration:run`: execute TypeORM migrations using `src/database/database.config.ts`.

## Module map
- `src/modules/auth`: authentication (local/JWT/Google) and guard utilities.
- `src/modules/user`: user CRUD and role management.
- `src/modules/events`: event catalogue and scheduling logic.
- `src/modules/coupons`: coupon issuance, validation, and tracking.
- `src/modules/orders`: order lifecycle and payment linking.
- `src/modules/payments`: MercadoPago bridge and payment notifications.
- `src/modules/uploads`: file storage helpers for tickets and assets.
- `src/modules/whatsapp`: outbound messaging through WhatsApp integration.

## Collaboration guardrails
- When implementing a feature, confine changes to the module that owns that feature. Do not touch other modules, shared entities, DTOs, controllers, or providers without explicit approval from the user.
- Configuration under `src/config/` and `src/database/` should remain untouched unless the user requests environment work.
- Ask before adding dependencies, altering application bootstrap (`main.ts`, `app.module.ts`), or restructuring folders.
- Keep this README and related context files in sync with any approved architectural change.

## Additional references
- Seed scripts live in `scripts/` (`npm run seed:sample`).
- Tests live beside their targets (e.g., `mailer.service.spec.ts`).
- File uploads are stored under `/uploads` (ensure paths remain consistent with production usage).


