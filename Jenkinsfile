pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        BACKEND_IMAGE = 'sowmariama/portfolio-backend'
        FRONTEND_IMAGE = 'sowmariama/portfolio-frontend'
        VERSION = 'v1'
    }
    
    stages {
        
        stage('Clone') {
            steps {
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git', 
                    branch: 'main'
            }
        }
        
        stage('Build Backend') {
            steps {
                sh '''
                    docker build \
                        --memory="1g" \
                        --memory-swap="2g" \
                        -t ${BACKEND_IMAGE}:${VERSION} \
                        ./portfolio/04-express-mongodb
                '''
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh '''
                    docker build \
                        --memory="1g" \
                        --memory-swap="2g" \
                        -t ${FRONTEND_IMAGE}:${VERSION} \
                        ./portfolio/03-react
                '''
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                sh 'docker push ${BACKEND_IMAGE}:${VERSION}'
                sh 'docker push ${FRONTEND_IMAGE}:${VERSION}'
                sh 'docker logout'
            }
        }
        
        stage('Deploy') {
            steps {
                sh ''' 
        # Aller dans le dossier contenant docker-compose.yml
            
                  cd ./portfolio
        # Arrêter les anciens conteneurs si ils existent
                   docker-compose down || true
                    
                   # Lancer les nouveaux conteneurs
                   docker-compose up -d
                '''
            }
        }
        
    }
    
    post {
        success {
            echo 'Pipeline exécuté avec succès !'
            echo 'Images pushées sur Docker Hub !'
            echo 'Application déployée !'
        }
        failure {
            echo 'Erreur dans le pipeline.'
            sh 'docker logout || true'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
