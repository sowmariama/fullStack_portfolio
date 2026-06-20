# Document de Synthèse — Module Docker
### Projet fil rouge : Portfolio Full-Stack (React + Express + MongoDB Atlas)
**Auteure :** Mariam Baidy Sow | **Formation :** Cloud/AWS — Orange Digital Center Dakar

---

## 2.1. Problématique (Pourquoi Docker ?)

### Le problème classique : "Ça marche chez moi !"

Imagine que tu développes une application Node.js sur ton PC Windows. Ton collègue l'installe sur son Mac, et ça ne fonctionne pas. Le serveur de production tourne sur Ubuntu, et là encore, c'est cassé. Pourquoi ?

- Les versions de Node.js diffèrent entre les machines
- Les variables d'environnement ne sont pas configurées pareil
- Les dépendances système (libc, openssl...) varient selon l'OS
- Les chemins de fichiers sont différents (Windows vs Linux)

**C'est le problème d'environnement.** Docker le résout en empaquetant l'application ET son environnement dans une seule unité portable : le **conteneur**.

> **Analogie :** Docker, c'est comme un container maritime. Peu importe si le bateau est japonais, brésilien ou sénégalais, le container s'ouvre toujours de la même façon et son contenu est intact.

---

## 2.2. Conteneurisation

### Conteneur vs Machine Virtuelle

| Critère | Machine Virtuelle (VM) | Conteneur Docker |
|---|---|---|
| Taille | Plusieurs Go (OS complet) | Quelques Mo (juste l'app) |
| Démarrage | Minutes | Secondes |
| Isolation | OS complet | Processus isolé |
| Performance | Moins bonne | Proche du natif |
| Portabilité | Moins portable | Très portable |

### Concept clé : l'image et le conteneur

- **Image Docker** = La recette (lecture seule, figée)
- **Conteneur** = Le plat cuisiné à partir de la recette (en cours d'exécution)

Une image peut créer autant de conteneurs qu'on veut, tous identiques.

---

## 2.3. Installation de Docker (sur WSL2 / Ubuntu 24.04)

### Étape 1 : Prérequis WSL2
```bash
# Sur Windows PowerShell (en admin)
wsl --install
wsl --set-default-version 2
```

### Étape 2 : Installation de Docker Engine sur Ubuntu 24.04
```bash
# Mettre à jour les paquets
sudo apt-get update

# Installer les dépendances
sudo apt-get install -y ca-certificates curl gnupg

# Ajouter la clé GPG officielle de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Ajouter le dépôt Docker
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Ajouter l'utilisateur au groupe docker (évite sudo à chaque commande)
sudo usermod -aG docker $USER
newgrp docker

# Vérifier l'installation
docker --version
docker run hello-world
```

---

## 2.4. Commandes Docker de base

### Gestion des images

| Commande | Explication |
|---|---|
| `docker pull nginx` | Télécharge l'image nginx depuis Docker Hub |
| `docker images` | Liste toutes les images locales |
| `docker rmi nginx` | Supprime l'image nginx |
| `docker inspect nginx` | Affiche les détails techniques de l'image |

### Gestion des conteneurs

```bash
# Lancer un conteneur interactif (i=interactif, t=terminal)
docker run -it ubuntu bash
# Analogie : ouvrir un terminal dans une "mini-machine" Ubuntu

# Lancer en arrière-plan (d=détaché/daemon)
docker run -d nginx
# Analogie : démarrer un service en fond comme systemctl start nginx

# Mapper les ports (port_hôte:port_conteneur)
docker run -d -p 8080:80 nginx
# Accès : http://localhost:8080 → port 80 du conteneur

# Monter un volume (dossier_hôte:dossier_conteneur)
docker run -d -v /mon/dossier:/app/data nginx

# Lister les conteneurs en cours
docker ps

# Lister TOUS les conteneurs (même arrêtés)
docker ps -a

# Arrêter un conteneur
docker stop mon-conteneur

# Supprimer un conteneur
docker rm mon-conteneur

# Voir les logs d'un conteneur
docker logs -f mon-conteneur   # -f = follow (en temps réel)

# Exécuter une commande dans un conteneur actif
docker exec -it mon-conteneur bash
# Analogie : "entrer" dans la machine en cours de fonctionnement
```

---

## 2.5. Réseaux sur Docker

### Réseau par défaut (bridge)
Quand tu lances un conteneur sans préciser de réseau, Docker crée automatiquement un réseau `bridge`. Les conteneurs sur le même bridge peuvent communiquer par IP, mais pas par nom.

```bash
# Lister les réseaux
docker network ls

# Inspecter le réseau bridge
docker network inspect bridge
```

### Réseau personnalisé (avec DNS intégré)
```bash
# Créer un réseau personnalisé
docker network create portfolio-network

# Sur un réseau personnalisé, les conteneurs se parlent PAR NOM
# Ex: le frontend peut appeler http://backend:5000 directement
docker run -d --name backend --network portfolio-network mon-backend
docker run -d --name frontend --network portfolio-network mon-frontend
```

> **Pourquoi c'est important pour notre projet ?** Le frontend React doit appeler l'API Express. Avec un réseau personnalisé, il peut faire `http://backend:5000/api/projets` au lieu d'utiliser une adresse IP qui peut changer.

### Pilotes de réseau disponibles
| Pilote | Usage |
|---|---|
| `bridge` | Par défaut, conteneurs sur la même machine |
| `host` | Le conteneur utilise directement le réseau de l'hôte |
| `none` | Aucune connexion réseau (isolation totale) |
| `overlay` | Pour Kubernetes/Swarm (multi-machines) |

---

## 2.6. Images Docker — Dockerfile détaillé

### Structure en couches d'une image
Une image Docker est construite en **couches empilées** (comme des calques Photoshop). Chaque instruction dans le Dockerfile crée une couche. Docker met en cache les couches non modifiées, ce qui accélère les builds.

```
Couche 5 : COPY . .          ← change souvent → pas de cache
Couche 4 : RUN npm install   ← cache si package.json n'a pas changé
Couche 3 : COPY package*.json
Couche 2 : WORKDIR /app
Couche 1 : FROM node:20-alpine  ← image de base
```

**Bonne pratique :** Copier `package.json` AVANT le code source pour profiter du cache npm.

---

### Dockerfile Backend — Explication ligne par ligne

```dockerfile
# On part de l'image officielle Node.js version 20, variante "alpine"
# alpine = version ultra-légère basée sur Alpine Linux (~5Mo vs ~300Mo pour debian)
FROM node:20-alpine

# On définit le répertoire de travail dans le conteneur
# Toutes les commandes suivantes s'exécutent dans /app
WORKDIR /app

# On copie UNIQUEMENT les fichiers de dépendances en premier
# Pourquoi ? Pour profiter du cache Docker : si le code change mais pas
# les dépendances, Docker réutilise la couche npm install → plus rapide
COPY package*.json ./

# On nettoie le cache npm et on installe les dépendances
# --prefer-offline : utilise le cache local si disponible (évite les erreurs réseau)
RUN npm cache clean --force && \
    npm install --prefer-offline

# On copie tout le reste du code source
COPY . .

# On indique que le conteneur écoute sur le port 5000
# (information documentaire, ne publie pas réellement le port)
EXPOSE 5000

# Commande de démarrage de l'application
CMD ["node", "app.js"]
```

---

### Dockerfile Frontend — Multi-stage build expliqué

Le **multi-stage build** est une technique avancée qui utilise plusieurs étapes dans un seul Dockerfile. C'est comme une chaîne de fabrication : une étape pour construire, une autre pour livrer.

```dockerfile
# ============= ÉTAPE 1 : BUILD =============
# On nomme cette étape "builder" pour y faire référence plus tard
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances (optimisation du cache)
COPY package*.json ./

# Nettoyage et installation des dépendances
RUN npm cache clean --force
RUN npm install --prefer-offline

# Copie du code source
COPY . .

# Build de production : génère les fichiers statiques dans /app/dist
# (index.html, bundle.js, etc.)
RUN npm run build

# ============= ÉTAPE 2 : SERVE =============
# On part d'une image Nginx (serveur web ultra-léger)
# Cette image finale ne contient PAS Node.js, juste Nginx + les fichiers
FROM nginx:alpine

# On copie UNIQUEMENT les fichiers compilés depuis l'étape "builder"
# Le reste (node_modules, code source) est éliminé → image finale très légère
COPY --from=builder /app/dist /usr/share/nginx/html

# On copie notre configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx écoute sur le port 80
EXPOSE 80

# Démarrage de Nginx en mode "foreground" (pas en daemon)
# Docker a besoin que le processus reste au premier plan
CMD ["nginx", "-g", "daemon off;"]
```

**Avantage du multi-stage :** L'image finale fait ~25Mo au lieu de ~500Mo car elle ne contient pas Node.js ni les `node_modules`.

---

### Configuration Nginx — nginx.conf expliquée

```nginx
server {
   # Nginx écoute sur le port 80 (HTTP standard)
   listen 80;
   
   # Nom du serveur (localhost en développement)
   server_name localhost;

   # Dossier racine où se trouvent les fichiers statiques React
   root /usr/share/nginx/html;
   
   # Fichier par défaut à servir
   index index.html;

   location / {
      # try_files est CRUCIAL pour React Router (SPA)
      # Il essaie : 1) le fichier exact ($uri)
      #             2) un dossier avec ce nom ($uri/)
      #             3) sinon, renvoie index.html (pour que React Router gère la route)
      # Sans ça, un refresh sur /projets/1 donnerait une erreur 404 Nginx
      try_files $uri $uri/ /index.html;
   }
}
```

---

## 2.7. Docker Hub

Docker Hub est le **registre public** de Docker. C'est comme GitHub, mais pour les images Docker.

### Workflow Docker Hub

```bash
# 1. Se connecter à Docker Hub
docker login
# Saisir username: sowmariama
# Saisir password (ou token)

# 2. Tagger une image avec ton username/nom:version
docker tag portfolio-backend sowmariama/portfolio-backend:v1

# 3. Pousser l'image vers Docker Hub
docker push sowmariama/portfolio-backend:v1

# 4. N'importe qui peut maintenant télécharger ton image
docker pull sowmariama/portfolio-backend:v1
```

**Images poussées pour ce projet :**
- `sowmariama/portfolio-backend:v1`
- `sowmariama/portfolio-frontend:v1`

---

## 2.8. Stockage sur Docker

### Problème : les conteneurs sont éphémères
Quand un conteneur s'arrête, toutes ses données sont perdues. Pour persister des données, on utilise des volumes.

### Types de stockage

| Type | Description | Usage |
|---|---|---|
| **Volume** | Géré par Docker, stocké dans `/var/lib/docker/volumes/` | Bases de données, données persistantes |
| **Bind mount** | Lie un dossier de l'hôte au conteneur | Développement (hot-reload) |
| **tmpfs** | En mémoire, temporaire | Données sensibles temporaires |

```bash
# Créer un volume nommé
docker volume create mon-volume

# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect mon-volume

# Utiliser un volume dans un conteneur
docker run -d -v mon-volume:/data mongo

# Supprimer un volume
docker volume rm mon-volume
```

---

## 2.9. Docker Compose — docker-compose.yml expliqué

Docker Compose permet de **définir et lancer plusieurs conteneurs** avec un seul fichier YAML.

> **Analogie :** Si Docker est un musicien, Docker Compose est le chef d'orchestre qui coordonne tous les musiciens.

### Notre docker-compose.yml ligne par ligne

```yaml
services:

  # ---- Service Backend ----
  backend:
    # Docker va builder l'image depuis ce chemin (Dockerfile inclus)
    build: ./portfolio/04-express-mongodb
    
    # Nom du conteneur créé (plus facile à identifier)
    container_name: portfolio-backend
    
    # Exposition des ports : port 5000 de l'hôte → port 5000 du conteneur
    ports:
      - "5000:5000"
    
    # Variables d'environnement injectées dans le conteneur
    # MONGO_URI vient du fichier .env (ne jamais committer ce fichier !)
    environment:
      - MONGO_URI=${MONGO_URI}
      - PORT=5000
    
    # Si le conteneur plante, Docker le redémarre (sauf si arrêt manuel)
    restart: unless-stopped
    
    # Réseau auquel ce service appartient
    networks:
      - portfolio-network

  # ---- Service Frontend ----
  frontend:
    build: ./portfolio/03-react
    container_name: portfolio-frontend
    
    # Le frontend est accessible sur le port 5173 de la machine hôte
    # mais dans le conteneur, Nginx écoute sur le port 80
    ports:
      - "5173:80"
    
    # Le frontend ne démarre qu'après le backend
    depends_on:
      - backend
    
    restart: unless-stopped
    networks:
      - portfolio-network

# ---- Réseau personnalisé ----
networks:
  portfolio-network:
    # Le pilote bridge permet la communication inter-conteneurs
    # + DNS intégré (frontend peut appeler "backend" par son nom)
    driver: bridge
```

### Commandes Docker Compose essentielles

```bash
# Lancer tous les services (en arrière-plan)
docker-compose up -d

# Reconstruire les images ET lancer
docker-compose up -d --build

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer + volumes
docker-compose down -v

# Voir l'état des services
docker-compose ps

# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend

# Exécuter une commande dans un service
docker-compose exec backend bash
```

---

## 2.10. Démo — Intégration dans le projet fil rouge

### Architecture finale Docker du projet

```
┌─────────────────────────────────────────────────────┐
│                    Machine Hôte (WSL2)               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │          Réseau: portfolio-network (bridge)   │   │
│  │                                              │   │
│  │  ┌─────────────────┐    ┌─────────────────┐  │   │
│  │  │    Frontend     │    │    Backend      │  │   │
│  │  │  nginx:alpine   │───▶│  node:20-alpine │  │   │
│  │  │   Port: 80      │    │   Port: 5000    │  │   │
│  │  └────────┬────────┘    └────────┬────────┘  │   │
│  │           │                      │           │   │
│  └───────────┼──────────────────────┼───────────┘   │
│              │                      │               │
│         Port 5173                Port 5000           │
│              │                      │               │
│    http://localhost:5173    http://localhost:5000     │
│                                      │               │
│                              ┌───────▼────────┐      │
│                              │  MongoDB Atlas  │      │
│                              │   (cloud)       │      │
│                              └────────────────┘      │
└─────────────────────────────────────────────────────┘
```

### Étapes de la démo

```bash
# 1. Cloner le projet
git clone https://github.com/sowmariama/fullStack_portfolio.git
cd fullStack_portfolio

# 2. Créer le fichier .env (ne pas committer !)
echo "MONGO_URI=mongodb+srv://..." > .env

# 3. Builder et lancer l'application
docker-compose up -d --build

# 4. Vérifier que tout tourne
docker-compose ps
# Output attendu:
# portfolio-backend    running   0.0.0.0:5000->5000/tcp
# portfolio-frontend   running   0.0.0.0:5173->80/tcp

# 5. Tester l'API
curl http://localhost:5000/api/projets

# 6. Ouvrir le frontend
# → http://localhost:5173

# 7. Pousser sur Docker Hub
docker login
docker push sowmariama/portfolio-backend:v1
docker push sowmariama/portfolio-frontend:v1
```

---

## 2.11. Références

- [Documentation officielle Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Best practices Dockerfile](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose reference](https://docs.docker.com/compose/compose-file/)
- [Play with Docker (lab interactif)](https://labs.play-with-docker.com/)
- [Docker networking overview](https://docs.docker.com/network/)
