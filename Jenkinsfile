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

        
    stage('SonarQube Analysis') {
    steps {
        sh '''
            docker run --rm \
              --network=host \
              -v $(pwd):/usr/src \
              sonarsource/sonar-scanner-cli \
              -Dsonar.projectKey=portfolio-fullstack \
              -Dsonar.projectName="Portfolio Full Stack" \
              -Dsonar.sources=/usr/src \
              -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/.git/**" \
              -Dsonar.host.url=http://localhost:9000 \
              -Dsonar.login=admin \
              -Dsonar.password=20M@ri@m22
        '''
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
               echo 'Déploiement avec Docker       		Compose...'
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
            mail (
                to: 'mairosow91@gmail.com',
                subject: "SUCCES: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Pipeline execute avec succes.
                    Projet: ${env.JOB_NAME}
                    Build: ${env.BUILD_NUMBER}
                    Status: SUCCES
                    Details: ${env.BUILD_URL}
                    Application accessible sur http://localhost:5173
                """
            )
        }
        failure {
            mail (
                to: 'mairosow91@gmail.com',
                subject: "ECHEC: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
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


