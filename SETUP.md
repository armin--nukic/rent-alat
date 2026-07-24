# Lokalni setup

1. Instalirajte i pokrenite Docker Desktop.
2. U korijenu projekta pokrenite `docker compose up --build`.
3. Otvorite `http://localhost:7777`.

Administratorski panel je na `/admin`. Za bazu koristite `docker compose --profile tools up prisma-studio`. Za gašenje: `docker compose down`; podaci ostaju u Docker volumenima.
