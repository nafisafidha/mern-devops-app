pipeline {

    agent any

    environment {

        DOCKER_HUB = "nafisafidha02"

        IMAGE_TAG = "latest"

        DEPLOY_SERVER = "34.205.74.182"
    }

    stages {

        stage('Clone Repository') {

            steps {

                git branch: 'main',
                url: 'https://github.com/nafisafidha/mern-devops-app.git'
            }
        }

        stage('Build Docker Images') {

            steps {

                sh '''
                docker build -t $DOCKER_HUB/frontend:$IMAGE_TAG ./frontend

                docker build -t $DOCKER_HUB/backend:$IMAGE_TAG ./backend

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
                docker push $DOCKER_HUB/frontend:$IMAGE_TAG

                docker push $DOCKER_HUB/backend:$IMAGE_TAG

                '''
            }
        }

        stage('Deploy To EC2 Using SSH') {

            steps {

                sshagent(['ssh-creds']) {

                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@$34.205.74.182 '

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
