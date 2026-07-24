# Produkcijsko postavljanje na VPS (`22.22.22.22`)

Ovaj vodič postavlja Rent Alat BiH na `rent-alat.ice.lol` bez prekida postojećih Docker aplikacija (`sala.ice.lol`, `hidzama.ice.lol` i ostalih). Ne uklanja postojeće kontejnere, mreže ili Nginx konfiguracije.

## 1. DNS

U DNS panelu dodajte A zapis:

```text
rent-alat.ice.lol  A  22.22.22.22
```

Sačekajte da se zapis propagira prije izdavanja SSL certifikata.

## 2. Kopiranje projekta i produkcijske tajne

Prijavite se na server, kreirajte odvojeni direktorij i kopirajte projekat u njega:

```bash
ssh root@22.22.22.22
mkdir -p /opt/rent-alat
cd /opt/rent-alat
```

U `docker-compose.yml` obavezno promijenite `POSTGRES_PASSWORD`, `JWT_SECRET` i `ADMIN_PASSWORD`. Ne koristite početne vrijednosti iz repozitorija.

Za automatsko prosljeđivanje kontakt upita na `arminnuk@gmail.com`, kreirajte `.env` u `/opt/rent-alat`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=arminnuk@gmail.com
SMTP_PASS=GMAIL_APP_PASSWORD
SMTP_FROM=Rent Alat BiH <arminnuk@gmail.com>
```

`GMAIL_APP_PASSWORD` je Google App Password, ne vaša obična Gmail lozinka. Uključite 2-Step Verification na Google računu, pa u Google Account > Security > App passwords generišite posebnu lozinku za aplikaciju.

Ako SMTP još nije postavljen, upiti se i dalje sigurno spremaju u PostgreSQL bazu; email obavijest će se aktivirati čim dodate ove varijable i ponovo podignete backend.

## 3. Pokretanje aplikacije

```bash
docker compose up -d --build
docker compose ps
```

Aplikacija sluša samo na lokalnom Docker portu `7777`; Nginx je izlaže javno. API (`8888`) i baza (`5544`) ne trebaju biti otvoreni na firewallu. Za dodatnu zaštitu uklonite njihova `ports` mapiranja iz produkcijskog compose fajla nakon početne provjere.

## 4. Nginx virtual host

Kreirajte `/etc/nginx/sites-available/rent-alat.ice.lol`:

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

Aktivirajte samo novi virtual host, bez izmjene postojećih domena:

```bash
ln -s /etc/nginx/sites-available/rent-alat.ice.lol /etc/nginx/sites-enabled/rent-alat.ice.lol
nginx -t
systemctl reload nginx
```

## 5. HTTPS certifikat

Ako Certbot nije instaliran: `apt update && apt install -y certbot python3-certbot-nginx`.

Zatim:

```bash
certbot --nginx -d rent-alat.ice.lol
```

Odaberite preusmjeravanje HTTP na HTTPS. Certbot automatski postavlja i obnovu certifikata.

## 6. Provjera i održavanje

```bash
curl -I https://rent-alat.ice.lol
docker compose logs -f backend
docker compose up -d --build
```

Zadnja komanda ažurira samo Rent Alat stack iz direktorija `/opt/rent-alat`; ostale Docker aplikacije ostaju netaknute. Napravite redovan backup PostgreSQL i `uploads_data` Docker volumena prije većih izmjena.
