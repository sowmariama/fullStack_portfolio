# Description Textuelle de la Démo Docker
### Projet Portfolio Full-Stack — Mariam Baidy Sow

---

## Contexte
Cette démo montre la conteneurisation complète de l'application portfolio full-stack (React + Express + MongoDB Atlas) en utilisant Docker sur WSL2/Ubuntu 24.04.

---

## Ce qu'on voit à l'écran — Étape par étape

### Étape 1 : Vérification de l'installation Docker

**Ce qu'on fait :**
```bash
docker --version
docker-compose --version
docker run hello-world
```

**Ce qu'on voit à l'écran :**
- La version Docker installée (ex: `Docker version 24.x.x`)
- Le message "Hello from Docker!" qui confirme que Docker tourne correctement sur WSL2
- Docker explique qu'il a téléchargé l'image `hello-world`, créé un conteneur, exécuté le programme, puis arrêté le conteneur

---

### Étape 2 : Examen des Dockerfiles

**Ce qu'on fait :** On ouvre et on explique les deux Dockerfiles

**Dockerfile Backend (`portfolio/04-express-mongodb/Dockerfile`) :**
- Image de base `node:20-alpine` (légère)
- Copie de `package.json` en premier pour optimiser le cache
- Installation des dépendances avec `npm install`
- Démarrage avec `node app.js` sur le port 5000

**Dockerfile Frontend (`portfolio/03-react/Dockerfile`) :**
- **Étape 1 (builder)** : Node.js construit les fichiers React (`npm run build` → dossier `dist/`)
- **Étape 2 (serve)** : Nginx sert ces fichiers statiques
- L'image finale ne contient pas Node.js → très légère (~25Mo)

---

### Étape 3 : Build des images Docker

**Ce qu'on fait :**
```bash
cd fullStack_portfolio

# Build image backend
docker build -t sowmariama/portfolio-backend:v1 ./portfolio/04-express-mongodb

# Build image frontend
docker build -t sowmariama/portfolio-frontend:v1 ./portfolio/03-react
```

**Ce qu'on voit à l'écran :**
- Docker affiche chaque étape du build (Step 1/7, Step 2/7, etc.)
- Pour le backend : `Successfully built [hash]` et `Successfully tagged sowmariama/portfolio-backend:v1`
- Pour le frontend : On voit les **deux étapes** du multi-stage build (d'abord "builder" avec Node, ensuite Nginx)
- Le frontend prend plus de temps car il compile le code React

---

### Étape 4 : Vérification des images créées

**Ce qu'on fait :**
```bash
docker images | grep portfolio
```

**Ce qu'on voit à l'écran :**
```
REPOSITORY                        TAG    IMAGE ID       SIZE
sowmariama/portfolio-backend      v1     abc123...      ~180MB
sowmariama/portfolio-frontend     v1     def456...      ~25MB
```
- On constate que le frontend est **beaucoup plus léger** grâce au multi-stage build

---

### Étape 5 : Lancement avec Docker Compose

**Ce qu'on fait :**
```bash
# Vérifier que le fichier .env existe avec MONGO_URI
cat .env

# Lancer l'application complète
docker-compose up -d
```

**Ce qu'on voit à l'écran :**
```
[+] Running 2/2
 ✔ Container portfolio-backend   Started
 ✔ Container portfolio-frontend  Started
```
- Docker Compose crée d'abord le réseau `portfolio-network`
- Lance le backend en premier
- Lance le frontend ensuite (grâce à `depends_on`)

---

### Étape 6 : Vérification de l'état des conteneurs

**Ce qu'on fait :**
```bash
docker-compose ps
docker ps
```

**Ce qu'on voit à l'écran :**
```
NAME                  STATUS      PORTS
portfolio-backend     running     0.0.0.0:5000->5000/tcp
portfolio-frontend    running     0.0.0.0:5173->80/tcp
```
- Les deux conteneurs sont en état "running"
- Les ports sont correctement mappés

---

### Étape 7 : Test de l'API Backend

**Ce qu'on fait :**
```bash
curl http://localhost:5000/
curl http://localhost:5000/api/projets
```

**Ce qu'on voit à l'écran :**
- Réponse de la route `/` : `"API Portfolio - Mairam Baidy Sow est en ligne !"`
- Réponse de `/api/projets` : Liste des projets en JSON depuis MongoDB Atlas

---

### Étape 8 : Test du Frontend dans le navigateur

**Ce qu'on fait :** Ouvrir `http://localhost:5173` dans le navigateur

**Ce qu'on voit à l'écran :**
- L'interface React du portfolio s'affiche
- Les projets sont listés (chargés depuis l'API Express)
- La navigation entre les pages fonctionne (grâce à la config Nginx `try_files`)

---

### Étape 9 : Observation des logs

**Ce qu'on fait :**
```bash
docker-compose logs -f backend
```

**Ce qu'on voit à l'écran :**
```
portfolio-backend  | Serveur démarré sur http://localhost:5000
portfolio-backend  | Connecté à MongoDB
portfolio-backend  | GET /api/projets 200 12ms
```

---

### Étape 10 : Push vers Docker Hub

**Ce qu'on fait :**
```bash
docker login
docker push sowmariama/portfolio-backend:v1
docker push sowmariama/portfolio-frontend:v1
```

**Ce qu'on voit à l'écran :**
- Progression du push (layer by layer)
- Confirmation : `v1: digest: sha256:... size: ...`
- Sur hub.docker.com : les deux images apparaissent dans le dépôt `sowmariama`

---

### Étape 11 : Simulation d'une autre machine (pull + run)

**Ce qu'on fait :** On supprime les images locales et on les retélécharge depuis Hub
```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer les images locales
docker rmi sowmariama/portfolio-backend:v1
docker rmi sowmariama/portfolio-frontend:v1

# Relancer : Docker va automatiquement pull depuis Hub
docker-compose up -d
```

**Ce qu'on voit à l'écran :**
- Docker télécharge les images depuis Docker Hub
- L'application redémarre identiquement → preuve de la **portabilité**

---

## Difficultés rencontrées et solutions

| Problème | Solution |
|---|---|
| `permission denied` sur Docker socket | `sudo usermod -aG docker $USER && newgrp docker` |
| Build trop lent (npm install à chaque fois) | Copier `package*.json` AVANT le reste du code |
| Frontend ne trouve pas l'API | Vérifier le réseau docker-compose et l'URL de l'API dans le code React |
| `MONGO_URI` non défini | Créer le fichier `.env` avec la vraie URI avant `docker-compose up` |
| Image trop lourde (frontend ~500Mo) | Utiliser le multi-stage build → ~25Mo |

---

## Résumé de ce qui a été accompli
- ✅ Docker Engine installé sur WSL2/Ubuntu 24.04
- ✅ Dockerfile backend (node:20-alpine, single-stage)
- ✅ Dockerfile frontend (multi-stage : builder + nginx)
- ✅ Configuration Nginx pour React Router (SPA)
- ✅ docker-compose.yml avec réseau personnalisé
- ✅ Images poussées sur Docker Hub (sowmariama/portfolio-backend:v1 et sowmariama/portfolio-frontend:v1)
- ✅ Application accessible en local sur http://localhost:5173
