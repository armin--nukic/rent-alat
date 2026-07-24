# Rent Alat BiH — CI/CD deployment guide

Ovaj dokument opisuje jednokratnu pripremu GitHuba i VPS-a te potpuno automatski deployment nakon svakog pusha na `main` granu.

```text
git push origin main
        ↓
GitHub Actions validira i builda aplikaciju
        ↓
Frontend i backend Docker imageovi odlaze na GHCR
        ↓
Production Compose datoteka prenosi se na VPS
        ↓
VPS povlači tačno označene imageove i pokreće healthcheckove
        ↓
Aplikacija je dostupna; neuspješan deploy vraća prethodne imageove
```

## 1. Šta pipeline radi

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) pokreće se automatski na svaki `push` u `main` ili postojeću zadanu `master` granu, a može se pokrenuti i ručno kroz **Actions → Build and deploy → Run workflow**.

Pipeline ima tri faze:

1. **Validate application**
   - instalira zaključane npm zavisnosti pomoću `npm ci`;
   - gradi React frontend;
   - provjerava sintaksu backend i seed datoteka;
   - prekida proces prije deploya ako validacija ne prođe.
2. **Build images**
   - paralelno gradi frontend i backend image;
   - koristi GitHub Actions BuildKit cache;
   - objavljuje nepromjenjivi `sha-<commit>` tag i praktični `latest` tag;
   - šalje imageove u GitHub Container Registry:
     - `ghcr.io/armin--nukic/rent-alat-frontend`
     - `ghcr.io/armin--nukic/rent-alat-backend`
3. **Deploy production**
   - prenosi `docker-compose.prod.yml` na VPS bez kloniranja repozitorija;
   - prijavljuje VPS na GHCR;
   - povlači imageove tačno vezane za trenutni commit;
   - pokreće kontejnere i čeka njihove healthcheckove;
   - provjerava javni Nginx `/healthz` endpoint;
   - automatski vraća prethodne imageove ako novi deployment ne postane zdrav;
   - briše nekorištene Docker imageove.

Istovremeni produkcijski deployi nisu dozvoljeni. Novi workflow čeka da aktivni deployment završi, čime se izbjegavaju race condition problemi.

## 2. GitHub podešavanje

### Potrebni Actions secrets

Otvorite repozitorij i idite na **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Vrijednost | Obavezno |
|---|---|:---:|
| `VPS_HOST` | IP adresa ili DNS ime VPS-a, npr. `203.0.113.10` | ✅ |
| `VPS_USER` | Linux korisnik koji ima pristup Dockeru i `/opt/rent-alat` | ✅ |
| `VPS_SSH_KEY` | Cijeli privatni SSH ključ, uključujući `BEGIN` i `END` linije | ✅ |
| `GHCR_TOKEN` | GitHub token s najmanje `read:packages` dozvolom za privatne GHCR pakete | Preporučeno |

Workflow koristi ugrađeni `GITHUB_TOKEN` za build i push imageova. Ako `GHCR_TOKEN` nije postavljen, isti kratkotrajni `GITHUB_TOKEN` koristi se i za povlačenje imageova tokom tog deploymenta. Zaseban `GHCR_TOKEN` je pouzdaniji izbor za privatne pakete.

> [!IMPORTANT]
> Tokene, SSH ključeve, `.env` sadržaj i lozinke nikada ne upisujte u workflow, Compose datoteku ili Git historiju.

### GitHub Actions dozvole

U **Settings → Actions → General → Workflow permissions** uključite **Read and write permissions**. Workflow dodatno eksplicitno traži samo:

- `contents: read`
- `packages: write`

Opcionalno kreirajte GitHub Environment pod nazivom `production` i dodajte approval pravila ili ograničenje na `main` granu.

### Kreiranje deployment SSH ključa

Na sigurnom lokalnom računaru:

```bash
ssh-keygen -t ed25519 -C "github-actions-rent-alat" -f rent-alat-deploy
```

- sadržaj `rent-alat-deploy` ide u `VPS_SSH_KEY`;
- sadržaj `rent-alat-deploy.pub` dodaje se u `~/.ssh/authorized_keys` VPS korisnika;
- privatni ključ se ne kopira na VPS i ne commituje.

## 3. Jednokratna priprema VPS-a

Ovo je jedina ručna priprema servera. Nakon nje budući deploymenti ne zahtijevaju SSH, `git pull`, `npm install` ili ručno pokretanje Compose komandi.

### Minimalni zahtjevi

- Linux VPS s Docker Engineom;
- Docker Compose v2 s podrškom za `docker compose up --wait`;
- `curl`;
- korisnik s Docker pristupom;
- otvoren port koji koristi frontend, podrazumijevano `7777`, ili reverse proxy prema tom portu.

Instalirajte Docker prema [službenoj Docker dokumentaciji](https://docs.docker.com/engine/install/), zatim omogućite korisniku Docker pristup:

```bash
sudo usermod -aG docker YOUR_VPS_USER
sudo mkdir -p /opt/rent-alat
sudo chown -R YOUR_VPS_USER:YOUR_VPS_USER /opt/rent-alat
```

Odjavite se i ponovo prijavite kako bi članstvo u `docker` grupi postalo aktivno.

### Production `.env`

Jednom kreirajte `/opt/rent-alat/.env`. Koristite `.env.example` kao referencu, ali postavite različite i sigurne produkcijske vrijednosti:

```dotenv
NODE_ENV=production

POSTGRES_DB=rent_alat
POSTGRES_USER=rent_alat
POSTGRES_PASSWORD=CHANGE_TO_A_LONG_RANDOM_DATABASE_PASSWORD

JWT_SECRET=CHANGE_TO_A_LONG_RANDOM_JWT_SECRET
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_TO_A_STRONG_ADMIN_PASSWORD

FRONTEND_HOST_PORT=7777
CORS_ORIGIN=https://your-domain.example

CONTACT_RECIPIENT=info@rentalat.ba
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=Rent Alat BiH <info@rentalat.ba>
```

Zaštitite datoteku:

```bash
chmod 600 /opt/rent-alat/.env
```

`DATABASE_URL` se automatski sastavlja unutar production Compose konfiguracije i ne mora se ručno postavljati.

## 4. Prvi i svaki naredni deployment

Nakon što su Secrets i VPS pripremljeni, deployment pokreće običan push:

```bash
git push origin main
```

Status pratite na GitHubu pod **Actions → Build and deploy**. VPS ne treba imati Git repozitorij. Workflow svaki put automatski prenosi novu production Compose datoteku i povlači odgovarajuće GHCR imageove.

## 5. Minimalni downtime i rollback

PostgreSQL se ne restartuje kada mu se konfiguracija nije promijenila. Compose prvo povlači nove imageove, zatim rekreira samo promijenjene servise. Frontend se pokreće tek nakon zdravog backenda, a deployment završava tek kada su svi healthcheckovi uspješni.

Aktivni image tagovi čuvaju se na VPS-u u `/opt/rent-alat/images.env`. Prije deploymenta pipeline pravi privremenu kopiju. Ako novi stack ne postane zdrav unutar 180 sekundi, workflow ponovo pokreće posljednje poznate ispravne frontend i backend imageove i označava GitHub Actions run kao neuspješan.

Ovo pruža minimalan prekid na jednom VPS-u. Potpuni zero-downtime zahtijeva najmanje dvije aplikacijske replike i reverse proxy/load balancer koji prebacuje promet tek nakon healthchecka.

## 6. Healthcheckovi

| Servis | Provjera | Namjena |
|---|---|---|
| PostgreSQL | `pg_isready` | Baza prihvata konekcije |
| Backend | `GET /health` | Node/Express proces odgovara |
| Frontend | `GET /healthz` | Nginx servira aplikaciju |
| Deployment | `curl http://127.0.0.1:7777/healthz` | Krajnja provjera dostupnog web servisa |

Ako healthcheck ne prođe, `docker compose up --wait` vraća grešku i aktivira rollback.

## 7. Environment varijable i trajni podaci

Produkcijske tajne ostaju isključivo u `/opt/rent-alat/.env`. Workflow šalje samo imena i tagove imageova. Docker named volumeni čuvaju podatke između deploymenta:

- `rent-alat_postgres_data` — PostgreSQL podaci;
- `rent-alat_uploads_data` — slike koje administrator uploada kroz aplikaciju.

Deployment ne briše volumene. Komanda `docker image prune -f` uklanja samo nekorištene image slojeve, ne bazu i ne uploadovane datoteke.

## 8. GHCR paketi

Nakon prvog uspješnog builda imageovi se vide u GitHub profilu pod **Packages**. Mogu ostati privatni ako VPS koristi `GHCR_TOKEN`. Ako ih učinite javnim, VPS ih može povući bez trajne autentifikacije, ali workflow se i dalje sigurno prijavljuje prije pulla.

Za zaseban token otvorite GitHub **Settings → Developer settings → Personal access tokens** i dodijelite najmanje `read:packages`. Nemojte davati `write:packages` ili `repo` ako nisu potrebni.

## 9. Reverse proxy i HTTPS

Production Compose izlaže samo frontend na `${FRONTEND_HOST_PORT:-7777}`. Backend i PostgreSQL ostaju na privatnoj Docker mreži. Preporučeno je koristiti Caddy, Traefik ili host Nginx za HTTPS:

```nginx
location / {
    proxy_pass http://127.0.0.1:7777;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

TLS certifikate držite na reverse proxy sloju, izvan aplikacijskih kontejnera.

## 10. Rješavanje problema

### Workflow stane na SSH konekciji

- provjerite `VPS_HOST`, `VPS_USER` i format `VPS_SSH_KEY` secreta;
- provjerite da javni ključ postoji u `authorized_keys`;
- provjerite firewall i SSH port;
- potvrdite da VPS korisnik može pisati u `/opt/rent-alat`.

### GHCR vraća `unauthorized`

- provjerite da `GHCR_TOKEN` ima `read:packages`;
- omogućite tokenu pristup organizaciji ako repozitorij pripada organizaciji;
- provjerite da paket nasljeđuje pristup ovog repozitorija.

### Kontejner nije zdrav

Na VPS se prijavite samo za dijagnostiku i pogledajte status/logove:

```bash
cd /opt/rent-alat
. ./images.env
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200 backend frontend
```

Ručno pokretanje deploymenta nije potrebno; popravku pushajte na `main`, nakon čega će pipeline ponoviti cijeli proces.

### Promjena VPS arhitekture

Workflow trenutno gradi `linux/amd64`. Za ARM64 VPS promijenite `platforms` u workflowu na `linux/arm64`, ili koristite `linux/amd64,linux/arm64` za multi-platform imageove.

## 11. Operativna sigurnost

- redovno rotirajte SSH ključ, GHCR token, administratorsku lozinku i JWT tajnu;
- pravite automatizovane PostgreSQL i upload backup kopije izvan VPS-a;
- ograničite SSH pristup firewallom i isključite password login;
- uključite Dependabot i GitHub branch protection za `main`;
- ne pokrećite `docker compose down -v` jer `-v` briše trajne podatke;
- pratite neuspješne GitHub Actions runove i raspoloživ prostor na VPS-u.

## Kontakt

Za upite o najmu opreme i usluzi:

- Telefon: [+387 61 059 156](tel:+38761059156)
- Email: [info@rentalat.ba](mailto:info@rentalat.ba)
- Web: [rent-alat.ice.lol](https://rent-alat.ice.lol/)
