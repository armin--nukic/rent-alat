# Rent-Alat BiH — Code Guide

This guide describes the production code in English so a developer can safely maintain the project.

## Runtime architecture

`frontend` is a React 19 single-page application served by Nginx. Nginx proxies every `/api/*` request to the Express backend and `/uploads/*` to the persisted image folder. `backend` is an Express REST API using Prisma. `database` is PostgreSQL. Docker Compose connects all services on one isolated network.

## Frontend

### `frontend/src/main.jsx`

This is the application entry point and contains the current UI components.

- `copy` holds every public Bosnian and English UI string. Add a matching key in both language objects for new translated content.
- `categories` and `categoryIcons` define the product browsing filters and their visual category markers.
- `Layout` owns navigation, language preference and the persisted dark/light theme switch.
- `ToolCard` is the reusable animated product card. It reads the correct translated product fields based on the selected language.
- `Home`, `Tools`, `About`, `Delivery` and `Contact` are public routes. `Tools` supports category filtering and text search.
- `Admin` and `ToolForm` manage JWT login, product CRUD and image uploads.
- `App` fetches the catalogue once, handles the loading state and registers all React Router routes.

Client state is intentionally local: `localStorage` retains only language, theme and the short-lived JWT. Persistent business data always goes through the API.

### `frontend/src/styles.css`

This file contains the responsive industrial design system: CSS variables, dark/light theme overrides, the grid motion, cards, buttons, responsive breakpoints and custom form styles. New colors should use existing variables such as `--bg`, `--text`, `--yellow` and `--line` so both themes remain consistent.

### `frontend/nginx.conf`

Nginx serves the Vite build, makes SPA routes work with `try_files`, and prevents the browser from needing to know the internal backend hostname.

## Backend

### `backend/src/server.js`

The server source is fully commented in English. Its main responsibilities are:

- configure JSON parsing, CORS, static image delivery and protected uploads;
- validate JWTs before privileged tool operations;
- whitelist and normalize tool payloads with `cleanTool`;
- expose public catalogue, contact and health endpoints;
- implement authenticated product CRUD and image uploads;
- save every contact message to PostgreSQL, then optionally email a configured recipient through SMTP;
- return safe client errors while logging operational diagnostics on the server.

### `backend/prisma/schema.prisma`

Defines three PostgreSQL models: `Tool`, `Message` and `User`. It is the source of truth for Prisma migrations.

### `backend/prisma/seed.js`

Creates/updates the initial administrator and inserts only missing catalogue products. It is idempotent: restarting Docker does not delete user-created products, messages or uploaded images.

## Security notes

JWT signing, the administrator password, database password and SMTP credentials are runtime environment variables. Never put real credentials in Git. Uploads accept only JPEG, PNG and WebP files and have a 5 MB limit. Change all default credentials before public deployment.

## API reference

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/tools` | public | List catalogue tools |
| GET | `/tools/:id` | public | Read one tool |
| POST | `/contact` | public | Store contact message and optionally email it |
| POST | `/login` | public | Receive administrator JWT |
| POST | `/tools` | JWT | Create tool |
| PUT | `/tools/:id` | JWT | Update tool |
| DELETE | `/tools/:id` | JWT | Delete tool |
| POST | `/upload` | JWT | Upload a product image |
