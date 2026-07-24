# Uploading Rent-Alat BiH to GitHub

## 1. Create an empty repository

On GitHub, create a new private repository named `rent-alat-bih`. Do not initialize it with a README, `.gitignore` or license because this project already contains those files.

## 2. Protect secrets before pushing

Never commit `.env`, Gmail App Passwords, production JWT secrets or database passwords. The repository `.gitignore` already excludes `.env`, dependencies, build output and local uploads. Review `docker-compose.yml` and replace sample passwords with `${VARIABLE_NAME}` values before a public repository is created.

## 3. Push the project

In the project root, run:

```bash
git init
git add .
git commit -m "Initial Rent-Alat BiH application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/rent-alat-bih.git
git push -u origin main
```

If Git asks for authentication, use GitHub Desktop, a GitHub Personal Access Token or SSH keys. GitHub no longer accepts account passwords for Git over HTTPS.

## 4. Future updates

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

Before every push, run `docker compose up -d --build` locally and confirm the application works. On the VPS, pull the change and rebuild only this project:

```bash
git pull origin main
docker compose up -d --build
```
