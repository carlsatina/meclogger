# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MECLogger is a personal records tracker covering medical data, car maintenance, expenses, and a logbook. It is a monorepo where `frontend/` and `backend/` are independent git submodules, each with their own `package.json` and `.git`.

## Commands

### Backend (`cd backend`)
```bash
npm run dev          # development with nodemon + ts-node (no compile step)
npm run build        # prisma generate + tsc (for production)
npm start            # run compiled dist/index.js
npm run prisma:migrate:deploy  # run pending migrations in production
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Vite production build → dist/
npm run preview      # preview built dist/
```

Node >= 22 is required for the backend.

## Backend Architecture

**Entry point**: `index.ts` — sets up Express 5, CORS, Multer error handling, static file serving, Swagger docs at `/api-docs`, and mounts all routers.

**Request flow**: `index.ts` → `src/routes/*.ts` → `src/controller/*.ts` → Prisma client

Each router is a factory function `(dbClient, authenticateUser) => Router`, receiving the Prisma instance and JWT middleware injected from `index.ts`.

**Key modules**:
- `lib/prisma.ts` — singleton Prisma client
- `src/config/cors.ts` — CORS origins configurable via `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_SUFFIXES`, `CORS_ALLOW_ALL` env vars; defaults to `meclogger.com` and localhost
- `src/config/limits.ts` — request body and file size limits
- `src/services/blobStorage.ts` — unified file upload with waterfall: Vercel Blob → Cloudflare R2 → MinIO → local disk (`uploaded-images/`). Provider selection is automatic based on which env vars are present.
- `src/middlewares/` — Multer upload configs for logos, medical records, vehicle images

**Database**: PostgreSQL via Prisma. Schema in `prisma/schema.prisma`. `prisma.config.ts` loads `prisma/.env` first, then root `.env`. `DATABASE_URL` is required; `SHADOW_DATABASE_URL` is optional for migrations.

**Auth**: JWT in `Authorization: Bearer <token>` header. `authenticateUser` middleware in `index.ts` verifies against `ACCESS_TOKEN_SECRET`. Token payload includes `role` field.

**User roles** (enum `Role`): `GUEST` (pending approval), `USER`, `ADMIN`, `FAMILY`.

## Frontend Architecture

**Stack**: Vue 3 + TypeScript + Vite + Bootstrap 5 + Capacitor 7 (Android/iOS, app ID `com.arshii.meclogger`).

**Dual-UI pattern**: The app renders different components for mobile and web. `src/views/mobile/` contains mobile-optimized views and `src/views/web/` contains web views. Routes point to mobile components by default; web variants are served under `/web/*` paths.

**Auth & routing**: `src/router/index.ts` decodes the JWT from `localStorage` client-side to read `role` for route guards. Protected routes use `meta: { requiresAuth: true }`. Logbook routes require `ADMIN` or `FAMILY` role; admin routes require `ADMIN`.

**Global state**: `src/store/index.js` — a simple Vue `reactive()` object with methods; no Vuex or Pinia. Tracks login state, admin flag, and active profile.

**API calls**: Composables in `src/composables/` (e.g., `vitals/`, `auth/`, `medicalRecords.js`). The base API URL is set via `VITE_API_URL` env var.

**Aliases**: `@` resolves to `src/`.

## Environment Variables

Backend `.env` required keys:
- `PORT` — server port (default used: 3500)
- `DATABASE_URL` — PostgreSQL connection string
- `ACCESS_TOKEN_SECRET` — JWT signing secret
- `REFRESH_TOKEN_SECRET` — JWT refresh secret

Storage (pick one or none for local disk fallback):
- Vercel Blob: `BLOB_READ_WRITE_TOKEN` or `VERCEL_BLOB_READ_WRITE_TOKEN`
- Cloudflare R2: `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, optionally `R2_PUBLIC_URL`, `R2_ACCOUNT_ID`
- MinIO: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, optionally `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_PUBLIC_URL`

Frontend `.env`:
- `VITE_API_URL` — backend base URL
