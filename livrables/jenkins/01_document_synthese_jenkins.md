# Document de Synthèse — Module Jenkins
### Projet fil rouge : Portfolio Full-Stack (React + Express + MongoDB Atlas)
**Auteure :** Mariam Baidy Sow | **Formation :** Cloud/AWS — Orange Digital Center Dakar

---

## 3.1. Problématique (Pourquoi Jenkins ?)

### Sans CI/CD : le chaos du déploiement manuel

Voici ce qui se passe sans automatisation :
1. Une développeuse modifie le code et fait `git push`
2. Quelqu'un doit **manuellement** se connecter au serveur
3. Faire un `git pull` pour récupérer les changements
4. Relancer `npm install`, `npm run build`
5. Rebuild les images Docker
6. Redéployer avec `docker-compose`
7. Vérifier que tout fonctionne
8. En cas d'erreur... déboguer manuellement

Ce processus est **lent**, **source d'erreurs**, **non reproductible** et **bloquant**.

### Avec Jenkins : l'automatisation totale

Dès qu'on fait `git push` sur GitHub :
- Jenkins détecte automatiquement le changement (webhook)
- Lance le pipeline : test du code → build Docker → push Hub → déploiement
- Envoie un email de succès ou d'échec
- Tout cela **sans intervention humaine**

> **Analogie :** Jenkins est comme une chaîne de montage automobile. Dès que tu pousses une pièce (git push), la chaîne s'enclenche : contrôle qualité, assemblage, livraison — tout automatiquement.

---

## 3.2. Présentation — Qu'est-ce que Jenkins ?

**Jenkins** est un serveur d'automatisation open source écrit en Java. Il permet de créer des pipelines CI/CD (Intégration Continue / Déploiement Continu).

- **CI (Continuous Integration)** : Chaque push déclenche automatiquement build et tests
- **CD (Continuous Deployment/Delivery)** : Le déploiement est aussi automatisé

**Caractéristiques :**
- Gratuit et open source
- +1800 plugins disponibles
- Interface web intuitive
- Supporte tout : Java, Node.js, Python, Docker, Kubernetes...
- Peut tourner dans Docker (comme dans notre projet)

---

## 3.3. Installation — Jenkins dans Docker

### Pourquoi Jenkins dans Docker ?
Au lieu d'installer Jenkins directement sur la machine (Java, dépendances...), on le fait tourner dans un conteneur. C'est plus propre, portable et facile à supprimer.

### Commande de lancement

```bash
docker run -d \
  --name jenkins \
  --user root \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  jenkins/jenkins:lts-jdk17
```

**Explication de chaque option :**

| Option | Explication |
|---|---|
| `-d` | Lancer en arrière-plan (détaché) |
| `--name jenkins` | Nom du conteneur |
| `--user root` | Nécessaire pour accéder au socket Docker |
| `-p 8080:8080` | Interface web Jenkins accessible sur localhost:8080 |
| `-p 50000:50000` | Port pour les agents Jenkins distribués |
| `-v jenkins_home:/var/jenkins_home` | Volume pour persister la config Jenkins |
| `-v /var/run/docker.sock:/var/run/docker.sock` | Donne accès au démon Docker de l'hôte (Docker-in-Docker) |
| `-v $(which docker):/usr/bin/docker` | Rend la commande docker disponible dans Jenkins |
| `jenkins/jenkins:lts-jdk17` | Image Jenkins stable avec Java 17 |

> **Pourquoi monter le socket Docker ?** C'est la technique "Docker outside of Docker" (DooD). Jenkins a besoin de lancer des commandes Docker (build, push, etc.) depuis l'intérieur de son conteneur. En montant le socket, il utilise le Docker du système hôte.

### Récupérer le mot de passe initial

```bash
# Le mot de passe admin est dans ce fichier
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Accès à l'interface
Ouvrir `http://localhost:8080` dans le navigateur.

---

## 3.4. Configuration

### Installation des plugins essentiels
Après le premier démarrage, Jenkins propose d'installer les plugins suggérés. Accepter, puis ajouter :

- **Docker Pipeline** : Pour utiliser Docker dans les pipelines
- **Git** : Intégration GitHub
- **Email Extension Plugin** : Notifications email avancées
- **SonarQube Scanner** : Analyse de code (utilisé dans notre Jenkinsfile)

### Configuration du serveur email (SMTP Gmail)
`Manage Jenkins` → `System` → Section `E-mail Notification` :
```
SMTP Server: smtp.gmail.com
Port: 465
Authentification: nom@gmail.com + mot_de_passe_application
SSL: activé
```

> **Important :** Utiliser un "mot de passe d'application" Google (pas le mot de passe du compte). Aller sur myaccount.google.com → Sécurité → Mots de passe des applications.

---

## 3.5. Gestion des plugins

Les plugins étendent les fonctionnalités de Jenkins.

```
Manage Jenkins → Plugins → Available plugins
```

**Plugins utilisés dans ce projet :**

| Plugin | Rôle |
|---|---|
| Docker Pipeline | Utiliser Docker dans les étapes du pipeline |
| Git | Cloner des dépôts GitHub |
| Credentials | Gérer les secrets (Docker Hub, tokens) |
| Pipeline | Créer des pipelines déclaratifs (Jenkinsfile) |
| SonarQube Scanner | Intégration analyse de code |
| Email Extension | Notifications email configurables |

---

## 3.6. Pipelines — Le Jenkinsfile expliqué

Un **pipeline Jenkins déclaratif** est défini dans un fichier `Jenkinsfile` à la racine du projet. C'est du code (Groovy) qui décrit toutes les étapes d'automatisation.

### Structure générale d'un pipeline déclaratif

```groovy
pipeline {
    agent any          // Sur quel agent exécuter (any = premier disponible)
    
    environment {      // Variables d'environnement
        MA_VAR = 'valeur'
    }
    
    stages {           // Les grandes étapes du pipeline
        stage('Nom Étape') {
            steps {    // Les actions dans l'étape
                sh 'commande bash'
                echo 'Message'
            }
        }
    }
    
    post {             // Actions après le pipeline
        success { }    // Si succès
        failure { }    // Si échec
        always { }     // Dans tous les cas
    }
}
```

---

### Notre Jenkinsfile — Explication complète

```groovy
pipeline {
    // Jenkins peut utiliser n'importe quel nœud disponible
    agent any

    environment {
        // Récupère les credentials Docker Hub stockés dans Jenkins
        // Crée automatiquement DOCKER_HUB_CREDS_USR et DOCKER_HUB_CREDS_PSW
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        
        // Noms des images Docker Hub
        BACKEND_IMAGE = 'sowmariama/portfolio-backend'
        FRONTEND_IMAGE = 'sowmariama/portfolio-frontend'
        
        // Tag de version
        VERSION = 'v1'
    }

    stages {
        // ---- ÉTAPE 1 : CLONE ----
        stage('Clone') {
            steps {
                echo 'Clonage du depot GitHub...'
                // Récupère le code depuis GitHub
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git',
                    branch: 'main'
            }
        }

        // ---- ÉTAPE 2 : ANALYSE SONARQUBE BACKEND ----
        stage('SonarQube Backend') {
            steps {
                // withSonarQubeEnv : injecte les variables SonarQube configurées dans Jenkins
                withSonarQubeEnv('SonarQube') {
                    // withCredentials : récupère le token SonarQube stocké dans Jenkins
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            # Lance le scanner SonarQube dans un conteneur Docker
                            # --rm : supprime le conteneur après l'analyse
                            # --network=host : accède au SonarQube sur localhost:9000
                            # -v : monte le code source du backend dans le scanner
                            docker run --rm \
                              --network=host \
                              -v $(pwd)/portfolio/04-express-mongodb:/usr/src \
                              sonarsource/sonar-scanner-cli \
                              -Dsonar.projectKey=portfolio-backend \
                              -Dsonar.projectName="Portfolio Backend" \
                              -Dsonar.sources=. \
                              -Dsonar.exclusions="**/node_modules/**,**/dist/**" \
                              -Dsonar.host.url=http://localhost:9000 \
                              -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        // ---- ÉTAPE 3 : ATTENTE QUALITY GATE BACKEND ----
        stage('Wait for Quality Gate Backend') {
            steps {
                // Attend le résultat de l'analyse SonarQube (max 10 minutes)
                // Si le Quality Gate échoue (ex: trop de bugs), le pipeline s'arrête
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ---- ÉTAPES 4-5 : SONARQUBE FRONTEND + QUALITY GATE ----
        // Mêmes étapes que pour le backend, sur le code React
        stage('SonarQube Frontend') { /* ... voir fichier complet */ }
        stage('Wait for Quality Gate Frontend') { /* ... */ }

        // ---- ÉTAPE 6 : BUILD IMAGE BACKEND ----
        stage('Build Backend') {
            steps {
                echo 'Construction image Docker Backend...'
                sh '''
                    # --memory et --memory-swap : limite la RAM utilisée pendant le build
                    # Évite les crashes sur les machines avec peu de RAM
                    docker build \
                        --memory="1g" \
                        --memory-swap="2g" \
                        -t ${BACKEND_IMAGE}:${VERSION} \
                        ./portfolio/04-express-mongodb
                '''
            }
        }

        // ---- ÉTAPE 7 : BUILD IMAGE FRONTEND ----
        stage('Build Frontend') {
            steps {
                echo 'Construction image Docker Frontend...'
                sh '''
                    docker build \
                        --memory="1g" \
                        --memory-swap="2g" \
                        -t ${FRONTEND_IMAGE}:${VERSION} \
                        ./portfolio/03-react
                '''
            }
        }

        // ---- ÉTAPE 8 : PUSH VERS DOCKER HUB ----
        stage('Push to Docker Hub') {
            steps {
                echo 'Push des images vers Docker Hub...'
                // retry(3) : réessaie 3 fois en cas d'échec réseau
                retry(3) {
                    sh '''
                        # Se connecter à Docker Hub avec les credentials Jenkins
                        # $DOCKER_HUB_CREDS_PSW : le mot de passe (créé par credentials())
                        # $DOCKER_HUB_CREDS_USR : le nom d'utilisateur
                        # --password-stdin : plus sécurisé que de passer le mdp en argument
                        echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin
                        
                        docker push ${BACKEND_IMAGE}:${VERSION}
                        docker push ${FRONTEND_IMAGE}:${VERSION}
                        
                        # Toujours se déconnecter après
                        docker logout
                    '''
                }
            }
        }

        // ---- ÉTAPE 9 : DÉPLOIEMENT ----
        stage('Deploy') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                sh '''
                    # Arrêter les anciens conteneurs (|| true : ne pas échouer si déjà arrêtés)
                    docker-compose -f ./docker-compose.yml down --remove-orphans || true
                    
                    # Lancer les nouveaux conteneurs en arrière-plan
                    docker-compose -f ./docker-compose.yml up -d
                    
                    # Afficher l'état pour vérification
                    docker-compose -f ./docker-compose.yml ps
                '''
            }
        }
    }

    post {
        // Si tout s'est bien passé → email de succès
        success {
            echo 'Pipeline execute avec succes !'
            mail(
                to: 'mairosow91@gmail.com',
                subject: "SUCCES: ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Pipeline execute avec succes. Details: ${env.BUILD_URL}"
            )
        }
        
        // Si une étape a échoué → email d'erreur
        failure {
            echo 'Pipeline echoue.'
            mail(
                to: 'mairosow91@gmail.com',
                subject: "ECHEC: ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Erreur dans le pipeline. Logs: ${env.BUILD_URL}"
            )
        }
        
        // Toujours exécuté (succès ou échec) → nettoyage Docker
        always {
            // Supprime les images/conteneurs non-utilisés pour libérer l'espace disque
            sh 'docker system prune -f || true'
        }
    }
}
```

---

## 3.7. Intégration d'un dépôt Git

### Création du job Pipeline dans Jenkins

1. `New Item` → Nom : `portfolio-pipeline` → Type : `Pipeline`
2. Dans la configuration du job :
   - Section **Pipeline** → **Pipeline script from SCM**
   - **SCM** : Git
   - **Repository URL** : `https://github.com/sowmariama/fullStack_portfolio.git`
   - **Branch** : `*/main`
   - **Script Path** : `Jenkinsfile`
3. Sauvegarder

---

## 3.8. Utilisation de Docker dans Jenkins

### Technique : Docker outside of Docker (DooD)

Jenkins tourne dans un conteneur mais doit lancer des commandes Docker. La solution :
- Monter le socket Docker de l'hôte : `-v /var/run/docker.sock:/var/run/docker.sock`
- Monter le binaire Docker : `-v $(which docker):/usr/bin/docker`
- Lancer Jenkins en root : `--user root`

Ainsi, quand Jenkins exécute `docker build`, il utilise le Docker de la machine hôte.

---

## 3.9. Gestion des Credentials

Les secrets (mots de passe, tokens) ne doivent **jamais** être en clair dans le Jenkinsfile.

### Créer des credentials dans Jenkins
`Manage Jenkins` → `Credentials` → `Global` → `Add Credentials`

**Types de credentials utilisés :**

| ID Credential | Type | Usage |
|---|---|---|
| `docker-hub-credentials` | Username/Password | Login Docker Hub |
| `sonarqube-token` | Secret text | Token SonarQube |

### Utilisation dans le Jenkinsfile

```groovy
// Type Username/Password → crée deux variables
environment {
    DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    // Génère automatiquement :
    // DOCKER_HUB_CREDS_USR = "sowmariama"
    // DOCKER_HUB_CREDS_PSW = "le_token_secret"
}

// Type Secret text → une variable directe
withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
    sh 'curl -H "Authorization: Bearer $SONAR_TOKEN" ...'
}
```

---

## 3.10. Webhook GitHub + ngrok

### Problème
GitHub doit notifier Jenkins à chaque `git push`. Mais Jenkins tourne en local (pas d'IP publique). **ngrok** crée un tunnel sécurisé qui expose Jenkins sur internet temporairement.

### Configuration ngrok

```bash
# Installer ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Authentifier
ngrok authtoken VOTRE_TOKEN

# Créer le tunnel vers Jenkins
ngrok http 8080
```

**Ce qu'on voit :** une URL publique comme `https://abc123.ngrok.io`

### Configuration du Webhook GitHub

1. Sur GitHub : `Settings` → `Webhooks` → `Add webhook`
2. **Payload URL** : `https://abc123.ngrok.io/github-webhook/`
3. **Content type** : `application/json`
4. **Trigger** : `Just the push event`

### Dans Jenkins
`Job → Configure → Build Triggers → GitHub hook trigger for GITScm polling` ✅

---

## 3.11. Stratégies de déploiement

| Stratégie | Description | Notre projet |
|---|---|---|
| **Recreate** | Arrête tout, redémarre | `down && up` ✅ |
| **Rolling** | Met à jour progressivement | Kubernetes (prochaine étape) |
| **Blue/Green** | Deux environnements en parallèle | Avancé |
| **Canary** | Déploie sur un sous-ensemble d'utilisateurs | Avancé |

Notre pipeline utilise la stratégie **Recreate** (simple, adapté à un projet solo).

---

## 3.12. Comparaison Jenkins vs GitHub Actions

| Critère | Jenkins | GitHub Actions |
|---|---|---|
| Hébergement | Auto-hébergé (notre machine) | Cloud GitHub (gratuit) |
| Configuration | Jenkinsfile (Groovy) | YAML dans `.github/workflows/` |
| Plugins | +1800 plugins | Actions marketplace |
| Complexité | Plus complexe à configurer | Plus simple |
| Coût | Gratuit (mais ressources propres) | Gratuit (limites) |
| Intégration GitHub | Via webhook | Native |
| Meilleur pour | Grosses équipes, entreprises | Projets GitHub, open source |

**Exemple équivalent GitHub Actions pour notre pipeline :**
```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Backend
        run: docker build -t sowmariama/portfolio-backend:v1 ./portfolio/04-express-mongodb
      - name: Push to Docker Hub
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push sowmariama/portfolio-backend:v1
```

---

## 3.13. Architecture CI/CD du projet

```
Developer (WSL2)
      │
      │  git push
      ▼
  GitHub Repo
      │
      │  Webhook (ngrok tunnel)
      ▼
  Jenkins (localhost:8080)
      │
      │  Pipeline Stages:
      │
      ├─► Clone (git pull)
      │
      ├─► SonarQube Analysis (Backend + Frontend)
      │         └─► SonarQube (localhost:9000)
      │
      ├─► Quality Gate Check
      │
      ├─► Docker Build (Backend + Frontend)
      │
      ├─► Docker Push → Docker Hub (sowmariama/)
      │
      └─► Docker Deploy (docker-compose up)
               │
               ├─► portfolio-backend:5000
               └─► portfolio-frontend:5173
                          │
                      MongoDB Atlas (Cloud)
```

---

## 3.14. Difficultés rencontrées et solutions

| Problème | Cause | Solution |
|---|---|---|
| Permission denied sur docker.sock | Jenkins n'est pas root | Lancer avec `--user root` |
| `docker-compose` not found | Non installé dans Jenkins | Monter le binaire ou utiliser `docker compose` (v2) |
| Credentials not found | Mauvais ID de credential | Vérifier l'ID exact dans `Manage Jenkins → Credentials` |
| Webhook ne déclenche pas | Jenkins pas joignable depuis GitHub | Utiliser ngrok pour exposer Jenkins |
| Build échoue (OOM killed) | Manque de RAM pour npm run build | Ajouter `--memory="1g" --memory-swap="2g"` |
| Docker login échoue | Token expiré ou mauvais | Régénérer le token Docker Hub (Account Settings → Security) |

---

## 3.15. Références

- [Documentation officielle Jenkins](https://www.jenkins.io/doc/)
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins + Docker](https://www.jenkins.io/doc/book/installing/docker/)
- [ngrok Documentation](https://ngrok.com/docs)
- [Credentials dans Jenkins](https://www.jenkins.io/doc/book/using/using-credentials/)
- [Comparaison Jenkins vs GitHub Actions](https://www.jenkins.io/blog/2022/04/04/jenkins-vs-github-actions/)
