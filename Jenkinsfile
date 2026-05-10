
pipeline {

    agent any

    environment {

        DOCKER_HUB = "nafisafidha02"
        IMAGE_TAG = "latest"
        DEPLOY_SERVER = "54.210.164.179"
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
ssh -o StrictHostKeyChecking=no ubuntu@$DEPLOY_SERVER << EOF

docker pull nafisafidha02/frontend:latest
docker pull nafisafidha02/backend:latest

docker stop frontend || true
docker stop backend || true

docker rm -f frontend || true
docker rm -f backend || true

docker run -d --name frontend -p 3000:80 nafisafidha02/frontend:latest

docker run -d \
--name backend \
-p 5000:5000 \
-e MONGO_URI="mongodb+srv://nafisafidha22_db_user:Admin123@cluster0.07otaz5.mongodb.net/mernapp?retryWrites=true&w=majority&appName=Cluster0" \
-e JWT_SECRET="mernprojectsecret" \
nafisafidha02/backend:latest

EOF
                    '''
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

