# Rent Alat Visoko

Kompletna aplikacija za iznajmljivanje profesionalnog alata: React 19 frontend, Express REST API, PostgreSQL i Prisma ORM.

## Pokretanje

Potrebni su Docker i Docker Compose. Iz glavnog direktorija pokrenite:

```bash
docker compose up --build
```

Nakon pokretanja otvorite `http://localhost:7777`. API koristi port `8888`, PostgreSQL `5544`, a Prisma Studio (`docker compose --profile tools up prisma-studio`) port `6666`.

Migracije i seed se izvršavaju automatski pri startu API servisa. Početni administrator je `admin`, a lozinka `AdminRentAlat2026!`. Prije javnog postavljanja promijenite `JWT_SECRET`, `ADMIN_PASSWORD` i PostgreSQL lozinku u `docker-compose.yml`.

## API

- `GET /tools`, `GET /tools/:id`
- `POST /contact`
- `POST /login`
- `POST /tools`, `PUT /tools/:id`, `DELETE /tools/:id` (JWT)
- `POST /upload` (JWT, JPG/PNG/WebP)

Frontend `/api/*` zahtjeve prosljeđuje backendu preko Nginx proxyja. Uploadi su trajni u Docker volumenu. Javna kontakt adresa je `info@rentalat.ba`; za stvarnu email obavijest popunite SMTP varijable opisane u [FULL-VPS-DEPLOY.md](FULL-VPS-DEPLOY.md). Za lokalno pokretanje nakon izmjena pogledajte [LOCAL.md](LOCAL.md), za migraciju [DB-MIGRATE.md](DB-MIGRATE.md), a za GitHub [GITHUB.md](GITHUB.md).
