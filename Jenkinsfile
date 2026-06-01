pipeline {
    // agent any = Jenkins peut utiliser n'importe quel agent disponible
    agent any

    environment {
        // Recuperer les credentials Docker Hub de facon securisee
        // DOCKER_HUB_CREDS_USR = username
        // DOCKER_HUB_CREDS_PSW = password (masque dans les logs)
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')

        // Variables pour eviter de repeter les noms d'images
        BACKEND_IMAGE = 'sowmariama/portfolio-backend'
        FRONTEND_IMAGE = 'sowmariama/portfolio-frontend'

        // VERSION fixe a v1 pour eviter des problemes de tag
        // avec BUILD_NUMBER les tags changent a chaque build
        VERSION = 'v1'
    }

    stages {

        // ETAPE 1 — Cloner le code depuis GitHub
        // Jenkins telecharge tout le code dans son workspace
        // /var/jenkins_home/workspace/portfolio-fullstack-pipeline/
        stage('Clone') {
            steps {
                echo 'Clonage du depot GitHub...'
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git',
                    branch: 'main'
            }
        }

        // ETAPE 2 — Analyser la qualite du code avec SonarQube
        // On analyse AVANT de builder
        // Si le code est de mauvaise qualite on peut s'arreter
        stage('SonarQube Analysis') {
            steps {
                echo 'Analyse de la qualite du code avec SonarQube...'
                sh '''
                    docker run --rm \
                      --network=host \
                      -v $(pwd):/usr/src \
                      sonarsource/sonar-scanner-cli \
                      -Dsonar.projectKey=portfolio-fullstack \
                      -Dsonar.projectName="Portfolio Full Stack - Mairam Baidy Sow" \
                      -Dsonar.sources=/usr/src \
                      -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/.git/**" \
                      -Dsonar.host.url=http://localhost:9000 \
                      -Dsonar.login=admin \
                      -Dsonar.password=20M@ri@m22
                '''
            }
        }

        // ETAPE 3 — Construire l'image Docker du Backend
        // --memory="1g" limite la RAM car Ubuntu VirtualBox a 4GB
        // --memory-swap="2g" utilise le swap si besoin
        // -t = tagger l'image avec nom et version
        stage('Build Backend') {
            steps {
                echo 'Construction image Docker Backend...'
                sh '''
                    docker build \
                        --memory="1g" \
                        --memory-swap="2g" \
                        -t ${BACKEND_IMAGE}:${VERSION} \
                        ./portfolio/04-express-mongodb
                '''
            }
        }

        // ETAPE 4 — Construire l'image Docker du Frontend
        // Utilise un multi-stage build
        // Stage 1 : node:20-alpine compile React
        // Stage 2 : nginx:alpine sert les fichiers
        // Image finale = 25MB au lieu de 900MB
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

        // ETAPE 5 — Pusher les images sur Docker Hub
        // --password-stdin = plus securise que -p password
        // Le mot de passe ne s'affiche pas dans les logs
        // retry(3) = reessayer 3 fois si probleme reseau
        stage('Push to Docker Hub') {
            steps {
                echo 'Push des images vers Docker Hub...'
                retry(3) {
                    sh '''
                        echo $DOCKER_HUB_CREDS_PSW | \
                        docker login -u $DOCKER_HUB_CREDS_USR \
                        --password-stdin
                        docker push ${BACKEND_IMAGE}:${VERSION}
                        docker push ${FRONTEND_IMAGE}:${VERSION}
                        docker logout
                    '''
                }
            }
        }

        // ETAPE 6 — Deployer l'application
        // docker compose down = arreter les anciens conteneurs
        // || true = ne pas echouer si aucun conteneur ne tourne
        // docker compose up -d = lancer les nouveaux en arriere-plan
        // docker compose ps = afficher l'etat des services
        stage('Deploy') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                sh '''
                    docker compose -f ./docker-compose.yml down --remove-orphans || true
                    docker compose -f ./docker-compose.yml up -d
                    docker compose -f ./docker-compose.yml ps
                '''
            }
        }
    }

    // POST = actions apres le pipeline
    // S'executent toujours apres les stages
    post {

        // Si tout s'est bien passe
        success {
            echo 'Pipeline execute avec succes !'
            mail(
                to: 'mairosow91@gmail.com',
                subject: "SUCCES: ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Pipeline execute avec succes. Details: ${env.BUILD_URL}"
            )
        }

        // Si quelque chose a echoue
        failure {
            echo 'Pipeline echoue.'
            mail(
                to: 'mairosow91@gmail.com',
                subject: "ECHEC: ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Erreur dans le pipeline. Logs: ${env.BUILD_URL}"
            )
        }

        // Toujours execute — succes ou echec
        // Nettoyer les images Docker inutiles
        // Pour liberer l'espace disque apres chaque build
        always {
            sh 'docker system prune -f || true'
        }
    }
}
