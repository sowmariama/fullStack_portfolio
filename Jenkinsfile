pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Clone') {
            steps {
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git', branch: 'main'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t sowmariama/portfolio-backend:v1 ./portfolio/04-express-mongodb'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t sowmariama/portfolio-frontend:v1 ./portfolio/03-react'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                sh 'docker push sowmariama/portfolio-backend:v1'
                sh 'docker push sowmariama/portfolio-frontend:v1'
            }
        }
    }

    post {
        success {
            echo ' Pipeline exécuté avec succès !'
        }
        failure {
            echo ' Erreur dans le pipeline.'
        }
    }
}
