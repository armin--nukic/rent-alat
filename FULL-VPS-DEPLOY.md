# Full VPS Deployment — `rent-alat.ice.lol`

This guide deploys Rent-Alat BiH on `22.22.22.22` beside existing Docker websites such as `sala.ice.lol` and `hidzama.ice.lol`. It does not delete or restart other projects.

## 1. DNS and server prerequisites

Create this DNS record before SSL setup:

```text
Type: A
Host: rent-alat
Value: 22.22.22.22
```

Install Docker, Git, Nginx and Certbot once on the VPS:

```bash
sudo apt update
sudo apt install -y git nginx certbot python3-certbot-nginx
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in after the last command. Confirm with `docker --version` and `docker compose version`.

## 2. Clone from GitHub

Use a separate folder for this application:

```bash
sudo mkdir -p /opt/rent-alat
sudo chown -R $USER:$USER /opt/rent-alat
git clone https://github.com/YOUR-USERNAME/rent-alat-bih.git /opt/rent-alat
cd /opt/rent-alat
```

For a private repository, configure a GitHub SSH key or use a GitHub Personal Access Token. See [GITHUB.md](GITHUB.md).

## 3. Create the production `.env`

The tracked `.env.example` is a template. Create the private production file, which is ignored by Git:

```bash
cp .env.example .env
nano .env
```

Use values like these. Replace every `CHANGE_...` value with a unique secret; generate them with `openssl rand -hex 32`.

```env
NODE_ENV=production
POSTGRES_DB=rent_alat
POSTGRES_USER=rent_alat
POSTGRES_PASSWORD=CHANGE_TO_A_LONG_RANDOM_DATABASE_PASSWORD
POSTGRES_HOST_PORT=127.0.0.1:5544
JWT_SECRET=CHANGE_TO_A_LONG_RANDOM_JWT_SECRET
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_TO_A_STRONG_ADMIN_PASSWORD
BACKEND_HOST_PORT=127.0.0.1:8888
FRONTEND_HOST_PORT=127.0.0.1:7777
CORS_ORIGIN=https://rent-alat.ice.lol
CONTACT_RECIPIENT=arminnuk@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=arminnuk@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
SMTP_FROM=Rent Alat BiH <arminnuk@gmail.com>
PRISMA_STUDIO_HOST_PORT=127.0.0.1:6666
```

The public interface displays `info@rentalat.ba`. `CONTACT_RECIPIENT` is only a backend destination and never appears in the UI. For Gmail, create an App Password under Google Account → Security → 2-Step Verification → App passwords; never use the normal Gmail password.

## 4. Start the Docker stack

```bash
cd /opt/rent-alat
docker compose up -d --build
docker compose ps
docker compose logs --tail=80 backend
```

The backend automatically runs Prisma migrations and seed data. The frontend talks to the backend internally through Nginx `/api`; no frontend API URL needs changing. Product image uploads are written to the persistent `uploads_data` Docker volume and are automatically served through `/uploads` on the public domain.

## 5. Add the Nginx site

Create `/etc/nginx/sites-available/rent-alat.ice.lol`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name rent-alat.ice.lol;

    client_max_body_size 6m;

    location / {
        proxy_pass http://127.0.0.1:7777;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable only this host and validate Nginx. Existing domain files remain unchanged:

```bash
sudo ln -s /etc/nginx/sites-available/rent-alat.ice.lol /etc/nginx/sites-enabled/rent-alat.ice.lol
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Enable HTTPS

After DNS resolves to the VPS, issue the certificate:

```bash
sudo certbot --nginx -d rent-alat.ice.lol
```

Choose the option to redirect HTTP to HTTPS. Test in a browser: `https://rent-alat.ice.lol`.

## 7. Deploy future GitHub changes

Every subsequent deployment is limited to this folder and this Compose project:

```bash
cd /opt/rent-alat
git pull origin main
docker compose up -d --build
docker compose ps
```

Do not run `docker system prune`, `docker compose down -v`, or commands in another application directory unless you intend to affect other applications. `.env` is not changed by `git pull`; update it manually only when a newly documented variable is introduced.

## 8. Operations and troubleshooting

```bash
# Application and API logs
docker compose logs -f frontend
docker compose logs -f backend

# Local service tests from the VPS
curl http://127.0.0.1:7777
curl http://127.0.0.1:8888/health

# Restart only this project
docker compose restart
```

For a complete transfer of products, messages and uploaded images to another VPS, follow [DB-MIGRATE.md](DB-MIGRATE.md). Do not expose PostgreSQL, backend port 8888 or Prisma Studio directly to the public internet; the `127.0.0.1:` host bindings in the production `.env` keep them private.
