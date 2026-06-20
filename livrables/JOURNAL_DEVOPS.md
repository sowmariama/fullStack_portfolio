# Journal DevOps — Mairam Baidy Sow
**Formation AWS re/Start — Orange Digital Center Dakar**  
**Projet fil rouge : Portfolio Full-Stack (React + Express + MongoDB Atlas)**  
**Repo : https://github.com/sowmariama/fullStack_portfolio**

---

> Ce document retrace chronologiquement tout ce qui a été fait sur le projet. Il sert à la fois de journal de bord, de support de révision et de base pour les livrables finaux.

---

## Environnement de travail

| Élément | Valeur |
|---|---|
| OS | Windows 11 + WSL2 |
| Distribution Linux | Ubuntu 24.04 |
| Shell | bash (WSL) |
| Éditeur | VS Code / Kiro |
| Docker | Docker Engine (installé dans WSL) |
| Git | Configuré avec sowmariama / sowmariame932@gmail.com |

---

## MODULE 1 — Docker ✅

### Ce qui a été fait

**Installation**
- Docker Engine installé sur WSL2/Ubuntu 24.04
- Utilisateur ajouté au groupe docker (`usermod -aG docker $USER`)

**Dockerfile Backend** (`portfolio/04-express-mongodb/Dockerfile`)
- Image de base : `node:20-alpine`
- Copie `package*.json` en premier pour optimiser le cache Docker
- `npm install --prefer-offline` pour éviter les erreurs réseau
- Démarrage avec `node app.js` sur le port 5000

**Dockerfile Frontend** (`portfolio/03-react/Dockerfile`)
- Multi-stage build :
  - Étape 1 `builder` : Node.js compile le code React → dossier `dist/`
  - Étape 2 : Nginx sert les fichiers statiques
- Image finale ~25Mo (au lieu de ~500Mo sans multi-stage)
- `nginx.conf` avec `try_files` pour le routing React (SPA)

**Docker Compose** (`docker-compose.yml`)
- Réseau personnalisé `portfolio-network` (bridge, DNS intégré)
- Backend sur port 5000, Frontend sur port 5173 (→ 80 dans le conteneur)
- Variable `MONGO_URI` injectée depuis `.env`
- `depends_on` : le frontend attend le backend

**Docker Hub**
- Images poussées :
  - `sowmariama/portfolio-backend:v1`
  - `sowmariama/portfolio-frontend:v1`

### Commandes clés utilisées

```bash
docker build -t sowmariama/portfolio-backend:v1 ./portfolio/04-express-mongodb
docker build -t sowmariama/portfolio-frontend:v1 ./portfolio/03-react
docker-compose up -d --build
docker-compose ps
docker push sowmariama/portfolio-backend:v1
docker push sowmariama/portfolio-frontend:v1
```

### Difficultés rencontrées

| Problème | Solution |
|---|---|
| Permission denied sur docker.sock | `sudo usermod -aG docker $USER && newgrp docker` |
| Image frontend trop lourde | Multi-stage build → image finale Nginx uniquement |
| Frontend ne trouve pas l'API | Réseau docker-compose personnalisé + DNS par nom de service |

---

## MODULE 2 — Jenkins ✅

### Ce qui a été fait

**Installation**
- Jenkins lancé dans un conteneur Docker sur le port 8080
- Technique Docker-outside-of-Docker (DooD) : montage du socket `/var/run/docker.sock`
- Jenkins tourne en `--user root` pour accéder au démon Docker

```bash
docker run -d \
  --name jenkins \
  --user root \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  jenkins/jenkins:lts
```

**Pipeline déclaratif** (`Jenkinsfile` à la racine)

Étapes du pipeline :
1. `Clone` — récupération du code GitHub
2. `SonarQube Backend` — analyse qualité du backend Node.js
3. `Wait for Quality Gate Backend` — bloque si le code ne passe pas
4. `SonarQube Frontend` — analyse qualité du frontend React
5. `Wait for Quality Gate Frontend`
6. `Build Backend` — `docker build` avec limite mémoire 1g
7. `Build Frontend` — `docker build` multi-stage
8. `Push to Docker Hub` — avec `retry(3)` pour la robustesse réseau
9. `Deploy` — `docker-compose down && up`

**Post-pipeline :**
- Email de succès / échec vers `mairosow91@gmail.com`
- `docker system prune -f` systématique pour libérer l'espace

**Credentials Jenkins**
- `docker-hub-credentials` (Username/Password) → Docker Hub
- `sonarqube-token` (Secret text) → SonarQube

**Webhook GitHub + ngrok**
- ngrok crée un tunnel public vers `localhost:8080`
- Webhook GitHub pointe vers `https://xxx.ngrok.io/github-webhook/`
- Chaque `git push` déclenche automatiquement le pipeline

**Notifications email**
- SMTP Gmail configuré (mot de passe d'application Google)
- Email envoyé sur succès et sur échec

### Difficultés rencontrées

| Problème | Solution |
|---|---|
| docker-compose non trouvé dans Jenkins | Vérifier que `docker compose` (v2) est disponible |
| Credentials non trouvés | Vérifier l'ID exact dans Manage Jenkins → Credentials |
| Webhook ne se déclenche pas | ngrok pour exposer Jenkins sur internet |
| OOM killed pendant le build frontend | `--memory="1g" --memory-swap="2g"` dans docker build |

---

## MODULE 3 — SonarQube ✅

### État actuel
- SonarQube `community` tourne sur le port 9000
- 2 projets analysés et **passés** : `portfolio-backend` et `portfolio-frontend`
- Connexion Jenkins ↔ SonarQube déjà configurée (credential `sonarqube-token`)

### Problème identifié et corrigé
Les builds Jenkins #5 et #7 échouaient sur le `waitForQualityGate` malgré un Quality Gate "Passé" dans SonarQube. Cause : message "branche principale vide" dans SonarQube Community Edition.

**Corrections apportées au Jenkinsfile :**
- `-Dsonar.login` remplacé par `-Dsonar.token` (paramètre déprécié dans les nouvelles versions)
- Ajout `-Dsonar.scm.disabled=true` — désactive la détection de branche SCM (non supportée en Community)
- Ajout `-Dsonar.qualitygate.wait=true` — le scanner attend lui-même le résultat du Quality Gate
- Suppression des stages `Wait for Quality Gate` séparés (devenus redondants)

### Architecture SonarQube dans le pipeline

```
Jenkins stage SonarQube Backend
    └── docker run sonarsource/sonar-scanner-cli
            ├── Analyse le code Node.js (portfolio/04-express-mongodb)
            ├── Envoie les résultats à SonarQube (localhost:9000)
            ├── Attend le Quality Gate (sonar.qualitygate.wait=true)
            └── Si KO → pipeline bloqué / Si OK → étape suivante

Jenkins stage SonarQube Frontend
    └── docker run sonarsource/sonar-scanner-cli
            ├── Analyse le code React (portfolio/03-react)
            └── Même logique Quality Gate
```

### Commit correspondant
```
fix(jenkins): correction Quality Gate SonarQube Community Edition
```

---

## MODULE 4 — Kubernetes 🔜

### Prochaines étapes planifiées
- Installation Minikube sur WSL2 (driver Docker)
- Création des manifests YAML (Deployment + Service backend et frontend)
- ConfigMap pour les variables d'environnement
- Secret pour MONGO_URI
- Intégration dans le pipeline Jenkins (remplacer `docker-compose` par `kubectl apply`)

---

## Améliorations Frontend — Juin 2026 ✅

### Ce qui a été corrigé

| Fichier | Changement |
|---|---|
| `App.css` | Suppression du CSS mort du template Vite (~100 lignes inutiles) |
| `Hero.jsx` | Focus Cloud/AWS/DevOps, retrait mention crypto/blockchain |
| `Contact.jsx` | Formulaire fonctionnel via `mailto:`, validation des champs, suppression émoji, ajout email direct |
| `DetailProjet.jsx` | `console.error` limité au mode DEV, lint warning justifié |
| `ListeProjets.jsx` | `console.error` limité au mode DEV, hover image adouci (scale-105) |
| `AjouterProjet.jsx` | Message d'erreur utilisateur amélioré, `console.error` en DEV uniquement |
| `package.json` | `json-server` déplacé de `dependencies` vers `devDependencies` |
| `README.md` | README complet rédigé (stack, installation, structure, pipeline) |

### Commit correspondant
```
refactor(frontend): amélioration qualité code et Hero section
```

---

## État des services (dernière vérification)

```
portfolio-frontend   Up   0.0.0.0:5173->80/tcp
portfolio-backend    Up   0.0.0.0:5000->5000/tcp
jenkins              Up   0.0.0.0:8080->8080/tcp
sonarqube            Up   0.0.0.0:9000->9000/tcp  ✅
```

**SonarQube projets :**
- `portfolio-backend` (Interface d'administration) → Quality Gate : Passé ✅
- `portfolio-frontend` (Interface utilisateur) → Quality Gate : Passé ✅

---

*Dernière mise à jour : Juin 2026*
