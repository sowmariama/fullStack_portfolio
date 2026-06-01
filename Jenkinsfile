pipeline {
    agent any
   
    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        BACKEND_IMAGE    = 'sowmariama/portfolio-backend'
        FRONTEND_IMAGE   = 'sowmariama/portfolio-frontend'
        VERSION          = "v${BUILD_NUMBER}"
    }
   
    stages {
        stage('Clone') {
            steps {
                echo ' Clonage du dépôt GitHub...'
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git', branch: 'main'
            }
        }
       
        stage('Build Backend') {
            steps {
                echo ' Construction Backend...'
                sh 'docker build --memory="1g" --memory-swap="2g" -t ${BACKEND_IMAGE}:${VERSION} ./portfolio/04-express-mongodb'
            }
        }
       
        stage('SonarQube Analysis') {
            steps {
                echo ' Analyse SonarQube...'
                sh '''
                    docker run --rm \
                      --network=host \
                      -v $(pwd):/usr/src \
                      sonarsource/sonar-scanner-cli \
                      -Dsonar.projectKey=portfolio-fullstack \
                      -Dsonar.sources=. \
                      -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/.git/**" \
                      -Dsonar.host.url=http://localhost:9000 \
                      -Dsonar.login=admin \
                      -Dsonar.password=20M@ri@m22
                '''
            }
pipeline {
    agent any
   
    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        BACKEND_IMAGE    = 'sowmariama/portfolio-backend'
        FRONTEND_IMAGE   = 'sowmariama/portfolio-frontend'
        VERSION          = "v${BUILD_NUMBER}"
    }
   
    stages {
        stage('Clone') {
            steps {
                echo ' Clonage du dépôt GitHub...'
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git', 
                    branch: 'main'
            }
        }
       
        stage('Build Backend') {
            steps {
                echo ' Construction Backend Express...'
                sh 'docker build --memory="1g" --memory-swap="2g" -t ${BACKEND_IMAGE}:${VERSION} ./portfolio/04-express-mongodb'
            }
        }
       
        stage('SonarQube Analysis') {
            steps {
                echo ' Analyse de la qualité du code avec SonarQube...'
                sh '''
                    docker run --rm \
                      --network=host \
                      -v $(pwd):/usr/src \
                      sonarsource/sonar-scanner-cli \
                      -Dsonar.projectKey=portfolio-fullstack \
                      -Dsonar.sources=. \
                      -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/.git/**" \
                      -Dsonar.host.url=http://localhost:9000 \
                      -Dsonar.login=admin \
                      -Dsonar.password=20M@ri@m22
                '''
            }
        }
       
        stage('Build Frontend') {
            steps {
                echo ' Construction Frontend React...'
                sh 'docker build --memory="1g" --memory-swap="2g" -t ${FRONTEND_IMAGE}:${VERSION} ./portfolio/03-react'
            }
        }
       
        stage('Push to Docker Hub') {
            steps {
                echo ' Push des images vers Docker Hub...'
                sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                sh 'docker push ${BACKEND_IMAGE}:${VERSION}'
                sh 'docker push ${FRONTEND_IMAGE}:${VERSION}'
                sh 'docker logout'
            }
        }
       
        stage('Deploy') {
            steps {
                echo ' Déploiement avec Docker Compose...'
                sh '''
                    cd ./portfolio/fullStack_portfolio || true
                    docker compose down --remove-orphans || true
                    docker compose up -d
                    docker compose ps
                '''
            }
        }
    }
   
    post {
        success {
            echo ' Pipeline exécuté avec succès !'
        }
        failure {
            echo ' Pipeline échoué.'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
