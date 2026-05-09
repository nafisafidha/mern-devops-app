pipeline {

    agent any

    environment {

        DOCKER_HUB = "irfaanpk"

        IMAGE_TAG = "latest"

        DEPLOY_SERVER = "3.90.141.105"
    }

    stages {

        stage('Clone Repository') {

            steps {

                git branch: 'main',
                url: 'https://github.com/Irfaanpk/Docker-Compose-WordCounter.git'
            }
        }

        stage('Build Docker Images') {

            steps {

                sh '''
                docker build -t $DOCKER_HUB/input-frontend:$IMAGE_TAG ./input-frontend

                docker build -t $DOCKER_HUB/results-frontend:$IMAGE_TAG ./results-frontend

                docker build -t $DOCKER_HUB/worker:$IMAGE_TAG ./worker
                '''
            }
        }

        stage('Docker Hub Login') {

            steps {

                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''
                }
            }
        }

        stage('Push Images To Docker Hub') {

            steps {

                sh '''
                docker push $DOCKER_HUB/input-frontend:$IMAGE_TAG

                docker push $DOCKER_HUB/results-frontend:$IMAGE_TAG

                docker push $DOCKER_HUB/worker:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy To EC2 Using SSH') {

            steps {

                sshagent(['ssh-creds']) {

                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@$DEPLOY_SERVER '

                    cd /home/ubuntu/app

                    docker compose pull

                    docker compose down

                    docker compose up -d
                    '
                    """
                }
            }
        }
    }

    post {

        success {

            echo 'Application Successfully Deployed'
        }

        failure {

            echo 'Deployment Failed'
        }
    }
}
