# Portfolio Full-Stack — Mairam Baidy Sow

Application web full-stack développée dans le cadre de la formation **AWS re/Start** à Orange Digital Center Dakar.

## Présentation

Ce portfolio me permet de présenter mes réalisations techniques. Il est construit avec React côté client, Express + MongoDB Atlas côté serveur, et déployé via une pipeline CI/CD complète avec Docker et Jenkins.

## Stack technique

**Frontend**
- React 19 avec Vite
- Tailwind CSS 4
- React Router DOM 7
- Axios

**Backend**
- Node.js / Express 5
- MongoDB Atlas via Mongoose
- API REST (CRUD complet)

**DevOps**
- Docker (multi-stage build pour le frontend)
- Docker Compose
- Jenkins (pipeline CI/CD déclaratif)
- SonarQube (analyse qualité du code)
- Images publiées sur Docker Hub : `sowmariama/portfolio-frontend` et `sowmariama/portfolio-backend`

## Fonctionnalités

- Affichage de mes projets avec image, description et technologies
- Ajout, modification et suppression de projets
- Upload d'image depuis la machine ou par URL
- Page de contact avec formulaire fonctionnel
- Design responsive (mobile, tablette, desktop)

## Lancer le projet en local

### Prérequis
- Docker et Docker Compose installés
- Un fichier `.env` à la racine avec `MONGO_URI=...`

### Démarrage

```bash
# À la racine du repo
docker-compose up -d --build
```

- Frontend : http://localhost:5173
- Backend API : http://localhost:5000/api/projets

### Sans Docker (développement)

```bash
# Backend
cd portfolio/04-express-mongodb
npm install
npm run dev

# Frontend
cd portfolio/03-react
npm install
npm run dev
```

## Structure du projet

```
portfolio/
├── 03-react/               # Application React (frontend)
│   ├── src/
│   │   ├── components/     # Navbar, Hero, Footer
│   │   ├── pages/          # ListeProjets, DetailProjet, AjouterProjet, Contact
│   │   └── services/       # Appels API (projetService.js)
│   ├── Dockerfile          # Multi-stage build : Node builder + Nginx
│   └── nginx.conf          # Config Nginx pour SPA React Router
│
└── 04-express-mongodb/     # API Express (backend)
    ├── controllers/        # Logique métier
    ├── models/             # Schéma Mongoose
    ├── routes/             # Endpoints REST
    └── Dockerfile          # Image Node.js alpine
```

## Pipeline CI/CD

Le `Jenkinsfile` à la racine définit le pipeline suivant :

```
git push → Jenkins (webhook via ngrok)
    ├── Analyse SonarQube (backend + frontend)
    ├── Quality Gate check
    ├── Docker build (backend + frontend)
    ├── Docker push → Docker Hub
    └── Déploiement docker-compose
         └── Notification email (succès / échec)
```

## Auteure

**Mairam Baidy Sow** — Formation Cloud AWS, Orange Digital Center Dakar  
[GitHub](https://github.com/sowmariama) · [LinkedIn](https://www.linkedin.com/in/mairam-baidy-sow-94918025a)
