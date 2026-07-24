# Database and Image Migration

Use this guide when moving Rent-Alat BiH, including its admin-added products, contact messages and uploaded pictures, to another server.

## Before migration

1. On the old server, go to the project folder.
2. Stop writes during the backup window: tell administrators not to edit tools or submit important forms for a few minutes.
3. Record the Compose project name with `docker compose ps`.

## Export PostgreSQL

Create a SQL backup from the PostgreSQL container:

```bash
docker compose exec -T database pg_dump -U rent_alat -d rent_alat > rent-alat-backup.sql
```

Copy `rent-alat-backup.sql` to the new server using `scp`, SFTP or a secure backup provider. It contains tools, messages, users and all Prisma migration history.

## Export uploaded images

The `uploads_data` Docker volume holds the actual uploaded product pictures. Archive it without relying on host-specific volume paths:

```bash
docker run --rm -v rent-alat_uploads_data:/data -v "$PWD":/backup alpine tar czf /backup/rent-alat-uploads.tar.gz -C /data .
```

Copy `rent-alat-uploads.tar.gz` to the new server together with `rent-alat-backup.sql`.

## Restore on the new server

1. Copy the project source and create the production `.env`/Compose secrets.
2. Start only the database once: `docker compose up -d database`.
3. Restore the database:

```bash
Get-Content -Raw rent-alat-backup.sql | docker compose exec -T database psql -U rent_alat -d rent_alat
```

On Linux/macOS, use: `docker compose exec -T database psql -U rent_alat -d rent_alat < rent-alat-backup.sql`.

4. Restore the image archive:

```bash
docker run --rm -v rent-alat_uploads_data:/data -v "$PWD":/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/rent-alat-uploads.tar.gz -C /data"
```

5. Start all services: `docker compose up -d --build`.

## Important checks

- Open the admin panel and verify a recently uploaded product image.
- Verify catalogue and contact-message counts in Prisma Studio.
- Do not run destructive volume commands on the old server until the new site is fully verified.
- If only schema changes are being deployed—not moving data—do not export/import: use `docker compose up -d --build` and Prisma runs pending migrations automatically.
