# Lokalno pokretanje nakon izmjena

## Preduvjet

Pokrenite Docker Desktop i otvorite terminal u folderu projekta.

## Pokretanje ili osvježavanje aplikacije

Ako ste mijenjali frontend, backend, Dockerfile ili `docker-compose.yml`, koristite:

```bash
docker compose up -d --build
```

Zatim otvorite [http://localhost:7777](http://localhost:7777).

## Provjera servisa

```bash
docker compose ps
docker compose logs -f backend
```

API health provjera je dostupna na `http://localhost:8888/health`. Prisma Studio se pokreće po potrebi:

```bash
docker compose --profile tools up prisma-studio
```

Nakon toga otvorite `http://localhost:6666`.

## Zaustavljanje

```bash
docker compose down
```

Podaci baze i uploadi ostaju sačuvani. Nemojte koristiti `docker compose down -v` osim ako namjerno želite obrisati lokalnu bazu i slike.

## Kontakt email lokalno

Kontakt forme se uvijek spremaju u bazu. Za test stvarnog slanja emaila dodajte SMTP varijable u `.env` prema [FULL-VPS-DEPLOY.md](FULL-VPS-DEPLOY.md), pa ponovo pokrenite `docker compose up -d --build`.
