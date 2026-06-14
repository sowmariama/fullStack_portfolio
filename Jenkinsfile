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
        stage('Clone') {
            steps {
                echo 'Clonage du depot GitHub...'
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git',
                    branch: 'main'
            }
        }

        // ETAPE 2 — Analyser la qualite du code avec SonarQube (Backend)
        stage('SonarQube Backend') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
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

        // ETAPE 3 — Analyser la qualite du code avec SonarQube (Frontend)
        stage('SonarQube Frontend') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        docker run --rm \
                          --network=host \
                          -v $(pwd)/portfolio/03-react:/usr/src \
                          sonarsource/sonar-scanner-cli \
                          -Dsonar.projectKey=portfolio-frontend \
                          -Dsonar.projectName="Portfolio Frontend" \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**" \
                          -Dsonar.host.url=http://localhost:9000 \
                          -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        // ETAPE 4 — Construire l'image Docker du Backend
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

        // ETAPE 5 — Construire l'image Docker du Frontend
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

        // ETAPE 6 — Pusher les images sur Docker Hub
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

        // ETAPE 7 — Deployer l'application
        stage('Deploy') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                sh '''
                    docker-compose -f ./docker-compose.yml down --remove-orphans || true
                    docker-compose -f ./docker-compose.yml up -d
                    docker-compose -f ./docker-compose.yml ps
                '''
            }
        }
    }

    // POST = actions apres le pipeline
    post {
        success {
            echo 'Pipeline execute avec succes !'
            mail(
                to: 'mairosow91@gmail.com',
                subject: "SUCCES: ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Pipeline execute avec succes. Details: ${env.BUILD_URL}"
            )
        }
        failure {
            echo 'Pipeline echoue.'
            mail(
                to: 'mairosow91@gmail.com',
                subject: "ECHEC: ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Erreur dans le pipeline. Logs: ${env.BUILD_URL}"
            )
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
