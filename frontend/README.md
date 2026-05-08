# Frontend App Guide

## Status
- React 18 + Vite application already connected to the El Castillo Barracas API.
- UI is built with Radix UI primitives, Tailwind utilities, and custom modules under `src/components`.
- Rol "Control de acceso" disponible para personal de entrada: mismo alcance que un visitante y acceso a escaneo/redencion de tickets.
- Routing relies on React Router v7; state is handled locally with React hooks and `react-hook-form`.

## Environment
- Ensure `frontend/.env` contains the API base URL and feature flags (this file is tracked for reference).
- Install dependencies with `npm install` (Node.js 18 recommended).
- Run `npm run dev` for development and `npm run build` to create the production bundle.

## Project layout
- `src/components/Navigation.tsx` and module folders under `src/components/modules/` drive most feature views.
- `src/pages/` or `src/routes/` (if present) define page-level wiring.
- Shared utilities and API helpers live in `src/lib/` or `src/services/`.
- Styling comes from Tailwind classes plus component-level CSS where required.

## Collaboration guardrails
- Limit edits to the component(s) explicitly called out in the user request. Ask before touching shared navigation, context, hooks, or theme layers.
- Do not restructure folders, rename routes, or change global providers without prior confirmation.
- Keep this README and any other context files up to date when changes are approved.
- Confirm with the user before adding packages or altering the Vite configuration.

## Helpful commands
- `npm run dev`: start the local dev server (usually on http://localhost:5173).
- `npm run build`: compile a production build to `dist/`.
- `npm run preview`: (if added) serve the built bundle locally.

## UI reference
- Design source: https://www.figma.com/design/lGEVkClNDcUQTKjUtA2Zjl/Frontend-App-ElCastilloBarracas.
- Consult `frontend/.env` and the backend README for required API endpoints.

