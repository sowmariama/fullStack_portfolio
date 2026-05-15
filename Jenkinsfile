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
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git', branch: 'main'
            }
        }
        
        stage('Build Backend') {
            steps {
                sh 'docker build --memory="1g" --memory-swap="2g" -t ${BACKEND_IMAGE}:${VERSION} ./portfolio/04-express-mongodb'
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh 'docker build --memory="1g" --memory-swap="2g" -t ${FRONTEND_IMAGE}:${VERSION} ./portfolio/03-react'
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
                    cd ./portfolio
                    docker-compose down || true
                    docker-compose up -d
                '''
            }
        }
    }
    
    post {
        success {
            emailext (
                to: 'sowmariame932@gmail.com',
                subject: "Build reussi: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Pipeline execute avec succes.
                    Projet: ${env.JOB_NAME}
                    Build: ${env.BUILD_NUMBER}
                    Status: SUCCES
                    Details: ${env.BUILD_URL}
                    Images Docker Hub:
                    - sowmariama/portfolio-backend:v1
                    - sowmariama/portfolio-frontend:v1
                    Application accessible sur http://localhost:5173
                """
            )
        }
        failure {
            emailext (
                to: 'sowmariame932@gmail.com',
                subject: "Build echoue: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Erreur dans le pipeline.
                    Projet: ${env.JOB_NAME}
                    Build: ${env.BUILD_NUMBER}
                    Status: ECHEC
                    Logs: ${env.BUILD_URL}
                """
            )
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
