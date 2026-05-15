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
                to: 'mairosow91@gmail.com',
                subject: "SUCCÈS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: '''
                    <h2>Pipeline Jenkins Réussi</h2>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build:</b> ${env.BUILD_NUMBER}</p>
                    <p><b>Statut:</b> <span style="color:green">SUCCÈS</span></p>
                    <p><a href="${env.BUILD_URL}">Voir les détails du build</a></p>
                    <hr>
                    <p>Application déployée avec succès sur http://localhost:5173</p>
                '''
            )
        }
        failure {
            emailext (
                to: 'mairosow91@gmail.com',
                subject: "ÉCHEC: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: '''
                    <h2>Pipeline Jenkins Échoué</h2>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build:</b> ${env.BUILD_NUMBER}</p>
                    <p><b>Statut:</b> <span style="color:red">ÉCHEC</span></p>
                    <p><a href="${env.BUILD_URL}">Voir les logs d\'erreur</a></p>
                '''
            )
        }
    }
