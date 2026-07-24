# VPS instalacija: `rent-alat.ice.lol`

Instalirajte Docker Engine, Docker Compose plugin i Nginx na VPS. DNS A zapis za `rent-alat.ice.lol` mora pokazivati na IP VPS-a. Kopirajte projekat na server i prije pokretanja promijenite `POSTGRES_PASSWORD`, `JWT_SECRET` i `ADMIN_PASSWORD` u `docker-compose.yml`.

```bash
docker compose up -d --build
```

Kreirajte `/etc/nginx/sites-available/rent-alat.ice.lol`:

```nginx
server {
  listen 80;
  server_name rent-alat.ice.lol;
  location / {
    proxy_pass http://127.0.0.1:7777;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Aktivirajte konfiguraciju i HTTPS:

```bash
sudo ln -s /etc/nginx/sites-available/rent-alat.ice.lol /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d rent-alat.ice.lol
```

Za produkciju uklonite javna mapiranja portova 8888, 5544 i 6666. Ne izlažite Prisma Studio javno. Nakon izmjena koristite `docker compose up -d --build`; logovi API-ja su dostupni kroz `docker compose logs -f backend`.
