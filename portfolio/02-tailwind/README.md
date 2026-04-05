# 02 - Tailwind CSS

Module Tailwind du projet fil rouge - Groupe 1 AWS re/Start

**Auteur :** Mairam Baidy Sow

##  Ce qui a été réalisé

- Refactorisation complète du portfolio avec Tailwind CSS (v4)
- Création d’un design moderne, responsive et professionnel
- Respect strict des exigences du professeur :
  - `lister-projets.html`
  - `detailler-projet.html`
  - `ajouter-projet.html`
  - `contact.html` (bonus)

##  Pages du projet

- **lister-projets.html** → Liste des projets en grille
- **detailler-projet.html** → Détail d’un projet (CI/CD)
- **ajouter-projet.html** → Formulaire d’ajout de projet
- **contact.html** → Page de contact

## Design

- Thème bleu professionnel
- Cartes avec effet hover
- Responsive (mobile + desktop)
- Utilisation de Tailwind v4

## Comment lancer le projet

1. Aller dans le dossier `02-tailwind`
2. Lancer Tailwind en mode watch :
   ```bash
   npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css --watch