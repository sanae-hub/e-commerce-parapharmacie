# Guide de déploiement Docker

## Architecture

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Nginx (port 80)  — Reverse Proxy                   │
│  /api/*    → backend:5000                           │
│  /socket.io → backend:5000 (WebSocket)              │
│  /*        → frontend:80                            │
└──────────────┬──────────────────┬───────────────────┘
               │                  │
        ┌──────▼──────┐    ┌──────▼──────┐
        │   Backend   │    │  Frontend   │
        │  Node.js    │    │  Nginx+Vite │
        │  port 5000  │    │  port 80    │
        └──────┬──────┘    └─────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌───▼───┐
│  PG   │  │Redis │  │Uploads│
│ :5432 │  │:6379 │  │volume │
└───────┘  └──────┘  └───────┘
```

## Démarrage rapide

### 1. Prérequis
- Docker Desktop installé et démarré
- Git

### 2. Configuration
```bash
# Copier et éditer les variables
cp backend/.env.docker backend/.env.docker.local
# Modifier JWT_SECRET, POSTGRES_PASSWORD, etc.
```

### 3. Démarrer tous les services
```bash
docker compose up -d --build
```

### 4. Vérifier que tout tourne
```bash
docker compose ps
docker compose logs -f backend
```

### 5. Accéder à l'application
- Frontend : http://localhost
- API :      http://localhost/api/health
- Backend direct : http://localhost:5000/api/health

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Redémarrer un service
docker compose restart backend

# Rebuild après modification du code
docker compose up -d --build backend
docker compose up -d --build frontend

# Arrêter tout
docker compose down

# Arrêter et supprimer les volumes (ATTENTION: supprime la DB)
docker compose down -v

# Accéder à la DB PostgreSQL
docker compose exec postgres psql -U pguser -d parapharmacie

# Accéder au shell backend
docker compose exec backend sh

# Voir l'utilisation des ressources
docker stats
```

## Jenkins CI/CD

### Installation Jenkins (Docker)
```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### Configuration pipeline
1. Ouvrir http://localhost:8080
2. Nouveau projet → Pipeline
3. Pipeline from SCM → Git
4. Repository URL : URL de ton repo
5. Script Path : Jenkinsfile
6. Sauvegarder → Build Now

### Flux CI/CD
```
Push code → Jenkins détecte → Build images Docker
→ Tests unitaires → Tests intégration
→ Push registry → Deploy → Health check
```

## Variables d'environnement importantes

| Variable | Description | Défaut |
|---|---|---|
| POSTGRES_PASSWORD | Mot de passe DB | pgpass_CHANGE_ME |
| JWT_SECRET | Clé JWT | CHANGE_ME_IN_PRODUCTION |
| VITE_API_URL | URL API pour le frontend | http://localhost/api |
| DISABLE_RATE_LIMIT | Désactiver rate limit | false |
