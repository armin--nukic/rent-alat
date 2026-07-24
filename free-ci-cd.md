# Besplatan CI/CD bez ručnog `git pull`

Ovaj projekt je već podešen tako da nakon jednokratne pripreme VPS-a svaki naredni deployment radi automatski:

```text
git push origin main   # ili: git push origin master
        ↓
GitHub Actions builda frontend i backend
        ↓
Docker imageovi se objavljuju na GHCR
        ↓
GitHub Actions se spaja na VPS
        ↓
VPS automatski povlači imageove i pokreće novi stack
```

Na VPS-u poslije inicijalnog podešavanja **ne pokrećete** `git pull`, `npm install`, `docker build` niti ručni `docker compose up`.

## Da li je ovo stvarno besplatno?

CI/CD može raditi bez plaćene CI/CD platforme:

- GitHub Actions standardni runneri besplatni su za javne repozitorije;
- javni GHCR paketi su besplatni;
- ugrađeni `GITHUB_TOKEN` besplatno objavljuje imageove iz workflowa;
- za privatni repozitorij GitHub Free trenutno uključuje mjesečnu kvotu Actions minuta i prostora, nakon čega se izvršavanje blokira ili naplaćuje prema postavljenom budžetu;
- sam VPS nije dio GitHubove besplatne usluge i plaća se vašem hosting provideru.

Aktuelne uslove uvijek provjerite u službenoj dokumentaciji za [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) i [GitHub Packages billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages).

## Preporučena potpuno besplatna varijanta

Najjednostavniji način da CI/CD ostane bez dodatne naplate:

1. GitHub repozitorij postavite kao **Public**.
2. Nakon prvog workflowa otvorite oba paketa pod GitHub profilom → **Packages → Package settings → Change visibility → Public**.
3. Koristite postojeći standardni `ubuntu-latest` runner; nemojte uključivati larger runners.
4. U GitHub Billing postavite Actions i Packages budget na `0 USD` kako biste spriječili neočekivanu naplatu.
5. Povremeno obrišite vrlo stare `sha-*` image verzije ako želite uredniju listu paketa.

Izvorni kod može ostati privatan i koristiti uključenu GitHub Free kvotu, ali javni repozitorij i javni GHCR imageovi daju najjednostavniji model bez obračuna Actions minuta i package prostora.

## GitHub Secrets

U repozitoriju otvorite **Settings → Secrets and variables → Actions** i dodajte:

| Secret | Šta upisati |
|---|---|
| `VPS_HOST` | IP adresa ili domena VPS-a |
| `VPS_USER` | Linux korisnik za deployment |
| `VPS_SSH_KEY` | Privatni SSH deployment ključ |
| `GHCR_TOKEN` | Classic GitHub PAT sa `read:packages`, potreban za privatne imageove |

Za javne GHCR imageove `GHCR_TOKEN` tehnički nije potreban za anonimni pull, ali ga postojeći workflow podržava. Ako secret nije postavljen, workflow koristi kratkotrajni `GITHUB_TOKEN` tokom deploymenta.

## Jednokratna priprema VPS-a

Docker instalirate samo jednom. Zatim pripremite deployment direktorij:

```bash
sudo usermod -aG docker YOUR_VPS_USER
sudo mkdir -p /opt/rent-alat
sudo chown -R YOUR_VPS_USER:YOUR_VPS_USER /opt/rent-alat
```

U `/opt/rent-alat/.env` jednom postavite produkcijske vrijednosti:

```dotenv
NODE_ENV=production
POSTGRES_DB=rent_alat
POSTGRES_USER=rent_alat
POSTGRES_PASSWORD=CHANGE_TO_A_LONG_RANDOM_PASSWORD
JWT_SECRET=CHANGE_TO_A_LONG_RANDOM_SECRET
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_TO_A_STRONG_ADMIN_PASSWORD
FRONTEND_HOST_PORT=7777
CORS_ORIGIN=https://your-domain.example
CONTACT_RECIPIENT=info@rentalat.ba
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Rent Alat BiH <info@rentalat.ba>
```

Zaštitite datoteku:

```bash
chmod 600 /opt/rent-alat/.env
```

Ovo je posljednji obavezni ručni korak na VPS-u.

## Svaki naredni deployment

Lokalno napravite commit i push:

```bash
git add .
git commit -m "your change"
git push origin main
```

Postojeći [deployment workflow](.github/workflows/deploy.yml) automatski će:

- provjeriti frontend i backend;
- prekinuti deployment ako build ne prođe;
- izgraditi dva Docker imagea;
- poslati ih na `ghcr.io`;
- prenijeti production Compose datoteku na VPS;
- povući tačnu verziju trenutnog commita;
- sačekati database, backend i frontend healthcheckove;
- vratiti prethodnu verziju ako novi deployment ne postane zdrav;
- obrisati nekorištene lokalne image slojeve na VPS-u.

## Zašto VPS ne treba Git repozitorij?

VPS više ne gradi aplikaciju. On dobija gotove, provjerene Docker imageove iz GHCR-a. GitHub Actions automatski prenosi samo `docker-compose.prod.yml`, dok `.env`, baza i uploadovane slike ostaju trajno na serveru.

To znači:

- nema deploy SSH sesija;
- nema konflikata pri `git pull`;
- nema Node.js/npm instalacije na VPS-u;
- isti image koji je buildan u CI-u pokreće se u produkciji;
- povratak na prethodnu verziju je brz i automatski.

## Kako provjeriti deployment

Otvorite **GitHub → Actions → Build and deploy**. Zeleni workflow znači da su build, GHCR push, VPS deployment i završni `/healthz` test prošli.

Ako workflow ne prođe, otvorite neuspješni korak i pogledajte log. Ne popravljajte produkciju ručnim `git pull`; popravite kod ili konfiguraciju i ponovo pushajte na `main`.

## Kontakt

- Telefon: [+387 61 059 156](tel:+38761059156)
- Email: [info@rentalat.ba](mailto:info@rentalat.ba)
- Područje: Visoko, Sarajevo, Breza, Kakanj i okolina

Za napredne postavke, rollback, privatne pakete, reverse proxy i sigurnost pogledajte [puni CI/CD vodič](ci-cd.md).
