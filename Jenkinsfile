// ─────────────────────────────────────────────────────────────────────────────
//  TaskFlow — Jenkins CI/CD Pipeline
//  Stages: Checkout → Test → Build Images → Push to ECR → Deploy to AWS EC2
// ─────────────────────────────────────────────────────────────────────────────

pipeline {
    agent any

    // ── Tool versions ─────────────────────────────────────────────────────────
    tools {
        nodejs 'NodeJS-18'      // configure this in Jenkins Global Tools
    }

    // ── Environment variables ─────────────────────────────────────────────────
    environment {
        APP_NAME         = 'taskflow'
        AWS_REGION       = 'ap-south-1'                         // Mumbai (change as needed)
        ECR_REGISTRY     = credentials('ecr-registry-url')      // e.g. 123456789.dkr.ecr.ap-south-1.amazonaws.com
        EC2_HOST         = credentials('ec2-host')              // EC2 public IP / DNS
        EC2_USER         = 'ubuntu'
        SSH_KEY_ID       = 'ec2-ssh-private-key'               // Jenkins credential ID (SSH key)
        MONGO_URI        = credentials('mongo-uri-prod')        // Jenkins secret text
        JWT_SECRET       = credentials('jwt-secret-prod')       // Jenkins secret text
        CLIENT_URL       = credentials('client-url-prod')       // e.g. http://<your-ec2-ip>
        IMAGE_TAG        = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        BACKEND_IMAGE    = "${ECR_REGISTRY}/${APP_NAME}-backend:${IMAGE_TAG}"
        FRONTEND_IMAGE   = "${ECR_REGISTRY}/${APP_NAME}-frontend:${IMAGE_TAG}"
        COMPOSE_FILE_PATH = "/home/ubuntu/${APP_NAME}"
    }

    // ── Build options ─────────────────────────────────────────────────────────
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
        ansiColor('xterm')
    }

    // ── Trigger: on push to main/master ───────────────────────────────────────
    triggers {
        githubPush()
    }

    stages {

        // ── 1. CHECKOUT ───────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📦 Checking out source code..."
                checkout scm
                script {
                    env.GIT_AUTHOR  = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                    env.GIT_MESSAGE = sh(script: 'git log -1 --pretty=%B',  returnStdout: true).trim()
                }
                echo "Branch: ${env.BRANCH_NAME} | Author: ${env.GIT_AUTHOR}"
                echo "Commit: ${env.GIT_MESSAGE}"
            }
        }

        // ── 2. INSTALL DEPENDENCIES ───────────────────────────────────────────
        stage('Install Dependencies') {
            parallel {
                stage('Backend deps') {
                    steps {
                        dir('backend') {
                            echo "📥 Installing backend dependencies..."
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend deps') {
                    steps {
                        dir('frontend') {
                            echo "📥 Installing frontend dependencies..."
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ── 3. LINT & TEST ────────────────────────────────────────────────────
        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            echo "🧪 Running backend tests..."
                            sh 'npm test -- --forceExit --coverage'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                reportDir: 'backend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            echo "🧪 Running frontend tests..."
                            sh 'CI=true npm test -- --watchAll=false --coverage'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        // ── 4. DOCKER BUILD ───────────────────────────────────────────────────
        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            parallel {
                stage('Build Backend Image') {
                    steps {
                        echo "🐳 Building backend Docker image: ${BACKEND_IMAGE}"
                        sh """
                            docker build \
                              --target production \
                              --tag ${BACKEND_IMAGE} \
                              --tag ${ECR_REGISTRY}/${APP_NAME}-backend:latest \
                              ./backend
                        """
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        echo "🐳 Building frontend Docker image: ${FRONTEND_IMAGE}"
                        sh """
                            docker build \
                              --target production \
                              --tag ${FRONTEND_IMAGE} \
                              --tag ${ECR_REGISTRY}/${APP_NAME}-frontend:latest \
                              ./frontend
                        """
                    }
                }
            }
        }

        // ── 5. PUSH TO ECR ────────────────────────────────────────────────────
        stage('Push to ECR') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Pushing images to Amazon ECR..."
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                          docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker push ${BACKEND_IMAGE}
                        docker push ${ECR_REGISTRY}/${APP_NAME}-backend:latest

                        docker push ${FRONTEND_IMAGE}
                        docker push ${ECR_REGISTRY}/${APP_NAME}-frontend:latest
                    """
                }
            }
        }

        // ── 6. DEPLOY TO AWS EC2 ──────────────────────────────────────────────
        stage('Deploy to AWS EC2') {
            when {
                branch 'main'
            }
            steps {
                echo "☁️ Deploying to AWS EC2 (${EC2_HOST})..."
                sshagent(credentials: [SSH_KEY_ID]) {
                    // Copy docker-compose and .env to EC2
                    sh """
                        scp -o StrictHostKeyChecking=no \
                          docker-compose.yml \
                          ${EC2_USER}@${EC2_HOST}:${COMPOSE_FILE_PATH}/docker-compose.yml
                    """

                    // SSH into EC2 and deploy
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
                            set -e

                            echo "📂 Entering app directory..."
                            cd ${COMPOSE_FILE_PATH}

                            echo "🔑 Logging into ECR..."
                            aws ecr get-login-password --region ${AWS_REGION} | \
                              docker login --username AWS --password-stdin ${ECR_REGISTRY}

                            echo "⬇️ Pulling latest images..."
                            docker pull ${BACKEND_IMAGE}
                            docker pull ${FRONTEND_IMAGE}

                            echo "✏️ Writing .env file..."
                            cat > .env << EOF
NODE_ENV=production
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
CLIENT_URL=${CLIENT_URL}
BACKEND_IMAGE=${BACKEND_IMAGE}
FRONTEND_IMAGE=${FRONTEND_IMAGE}
EOF

                            echo "♻️ Restarting services..."
                            docker compose down --remove-orphans
                            docker compose up -d

                            echo "🧹 Cleaning up old images..."
                            docker image prune -f

                            echo "✅ Deployment complete!"
                            docker compose ps
ENDSSH
                    """
                }
            }
        }

        // ── 7. SMOKE TEST ─────────────────────────────────────────────────────
        stage('Smoke Test') {
            when {
                branch 'main'
            }
            steps {
                echo "🔍 Running smoke test against production..."
                sh """
                    sleep 20
                    HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://${EC2_HOST}/health || true)
                    echo "Health check HTTP status: \$HTTP_STATUS"
                    if [ "\$HTTP_STATUS" != "200" ]; then
                        echo "❌ Smoke test FAILED (status: \$HTTP_STATUS)"
                        exit 1
                    fi
                    echo "✅ Smoke test PASSED"
                """
            }
        }
    }

    // ── Post actions ──────────────────────────────────────────────────────────
    post {
        success {
            echo "✅ Pipeline succeeded! Build #${env.BUILD_NUMBER} deployed."
            // Uncomment and configure for Slack notifications:
            // slackSend channel: '#deployments', color: 'good',
            //   message: "✅ *${APP_NAME}* build #${env.BUILD_NUMBER} deployed successfully.\nBranch: ${env.BRANCH_NAME}\nAuthor: ${env.GIT_AUTHOR}"
        }
        failure {
            echo "❌ Pipeline FAILED at stage: ${env.STAGE_NAME}"
            // slackSend channel: '#deployments', color: 'danger',
            //   message: "❌ *${APP_NAME}* build #${env.BUILD_NUMBER} FAILED at stage: ${env.STAGE_NAME}\nBranch: ${env.BRANCH_NAME}"
        }
        always {
            echo "🧹 Cleaning workspace..."
            cleanWs()
            // Remove locally built images to free disk space on Jenkins agent
            sh """
                docker rmi ${BACKEND_IMAGE}  || true
                docker rmi ${FRONTEND_IMAGE} || true
            """
        }
    }
}
