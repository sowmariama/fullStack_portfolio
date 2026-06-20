# 🐳 Docker — Cheat Sheet
> Commandes essentielles — Projet Portfolio Full-Stack

---

## 📦 IMAGES

```bash
docker pull nginx:alpine          # Télécharger une image
docker images                     # Lister les images locales
docker rmi nginx:alpine           # Supprimer une image
docker inspect nginx              # Détails d'une image
docker history nginx              # Voir les couches d'une image
docker tag app:old app:new        # Renommer/tagger une image
```

---

## 🏃 CONTENEURS

```bash
docker run -d -p 8080:80 --name web nginx   # Lancer en fond
docker run -it ubuntu bash                   # Mode interactif
docker run -d -v /host:/app -e VAR=val nginx # Volume + var env

docker ps                    # Conteneurs actifs
docker ps -a                 # Tous les conteneurs
docker stop web              # Arrêter
docker start web             # Démarrer
docker restart web           # Redémarrer
docker rm web                # Supprimer
docker rm -f web             # Forcer la suppression
docker logs -f web           # Logs en temps réel
docker exec -it web bash     # Entrer dans le conteneur
docker inspect web           # Détails du conteneur
```

---

## 🔨 BUILD

```bash
docker build -t mon-app:v1 .              # Builder depuis Dockerfile
docker build -t mon-app:v1 -f Dockerfile.prod .  # Fichier spécifique
docker build --no-cache -t mon-app:v1 .  # Sans cache
docker build --memory="1g" -t mon-app .  # Limite mémoire
```

---

## 🌐 RÉSEAU

```bash
docker network ls                              # Lister les réseaux
docker network create mon-reseau              # Créer un réseau
docker network inspect mon-reseau             # Inspecter
docker network connect mon-reseau conteneur   # Connecter
docker network rm mon-reseau                  # Supprimer
```

---

## 💾 VOLUMES

```bash
docker volume create mon-vol       # Créer un volume
docker volume ls                   # Lister
docker volume inspect mon-vol      # Inspecter
docker volume rm mon-vol           # Supprimer
docker volume prune                # Supprimer les non-utilisés
```

---

## 🐙 DOCKER HUB

```bash
docker login                                     # Se connecter
docker tag app sowmariama/portfolio-backend:v1  # Tagger
docker push sowmariama/portfolio-backend:v1     # Pousser
docker pull sowmariama/portfolio-backend:v1     # Récupérer
docker logout                                    # Se déconnecter
```

---

## 🎼 DOCKER COMPOSE

```bash
docker-compose up -d              # Lancer en fond
docker-compose up -d --build      # Rebuild + lancer
docker-compose down               # Arrêter + supprimer
docker-compose down -v            # + supprimer volumes
docker-compose ps                 # État des services
docker-compose logs -f            # Logs en temps réel
docker-compose logs -f backend    # Logs d'un service
docker-compose exec backend bash  # Shell dans un service
docker-compose restart backend    # Redémarrer un service
docker-compose build              # Builder les images
```

---

## 🧹 NETTOYAGE

```bash
docker system prune -f          # Supprimer inutilisé (hors volumes)
docker system prune -f --volumes # Tout supprimer (attention !)
docker container prune          # Supprimer conteneurs arrêtés
docker image prune              # Supprimer images non-taguées
docker volume prune             # Supprimer volumes non-utilisés
```

---

## 📄 DOCKERFILE — Mots-clés essentiels

| Instruction | Rôle | Exemple |
|---|---|---|
| `FROM` | Image de base | `FROM node:20-alpine` |
| `WORKDIR` | Répertoire de travail | `WORKDIR /app` |
| `COPY` | Copier des fichiers | `COPY package*.json ./` |
| `RUN` | Exécuter une commande (build) | `RUN npm install` |
| `CMD` | Commande de démarrage | `CMD ["node", "app.js"]` |
| `EXPOSE` | Documenter le port | `EXPOSE 5000` |
| `ENV` | Variable d'environnement | `ENV NODE_ENV=production` |
| `ARG` | Argument de build | `ARG VERSION=1.0` |
| `VOLUME` | Point de montage | `VOLUME ["/data"]` |
| `AS` | Nommer une étape (multi-stage) | `FROM node AS builder` |

---

## ⚙️ VARIABLES DE NOTRE PROJET

```bash
BACKEND_IMAGE=sowmariama/portfolio-backend:v1
FRONTEND_IMAGE=sowmariama/portfolio-frontend:v1
BACKEND_PORT=5000
FRONTEND_PORT=5173  # → 80 dans le conteneur
NETWORK=portfolio-network
```

---

*Sources : [docs.docker.com](https://docs.docker.com) | [hub.docker.com](https://hub.docker.com)*
