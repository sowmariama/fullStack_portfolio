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
                echo 'Clonage du depot GitHub...'
                git url: 'https://github.com/sowmariama/fullStack_portfolio.git',
                    branch: 'main'
            }
        }

        stage('SonarQube Backend') {
            steps {
                withSonarQubeEnv('SonarQube') {
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
        }

        stage('SonarQube Frontend') {
            steps {
                withSonarQubeEnv('SonarQube') {
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
        }

        // À décommenter après installation du plugin et configuration du webhook
        /*
        stage('Wait for Quality Gate Backend') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        */

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

        stage('Push to Docker Hub') {
            steps {
                echo 'Push des images vers Docker Hub...'
                retry(3) {
                    sh '''
                        echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin
                        docker push ${BACKEND_IMAGE}:${VERSION}
                        docker push ${FRONTEND_IMAGE}:${VERSION}
                        docker logout
                    '''
                }
            }
        }

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
