pipeline {
    agent any

    environment {
        DOCKER_REGISTRY  = 'localhost:5001'
        IMAGE_BACKEND    = "${DOCKER_REGISTRY}/parapharmacie-backend"
        IMAGE_FRONTEND   = "${DOCKER_REGISTRY}/parapharmacie-frontend"
        IMAGE_TAG        = "${BUILD_NUMBER}"
        COMPOSE_FILE     = 'docker-compose.yml'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        // ── 2. Install & Lint ────────────────────────────────────────────────
        stage('Install Dependencies') {
            parallel {
                stage('Backend deps') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend deps') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ── 3. Tests unitaires backend ───────────────────────────────────────
        stage('Unit Tests') {
            steps {
                dir('backend') {
                    sh 'npm test -- --testPathPattern="tests/unit" --forceExit'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'backend/test-results/**/*.xml'
                }
            }
        }

        // ── 4. Build Docker images ───────────────────────────────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        sh """
                            docker build \
                                -t ${IMAGE_BACKEND}:${IMAGE_TAG} \
                                -t ${IMAGE_BACKEND}:latest \
                                ./backend
                        """
                    }
                }
                stage('Build Frontend') {
                    steps {
                        sh """
                            docker build \
                                --build-arg VITE_API_URL=http://localhost/api \
                                -t ${IMAGE_FRONTEND}:${IMAGE_TAG} \
                                -t ${IMAGE_FRONTEND}:latest \
                                ./frontend
                        """
                    }
                }
            }
        }

        // ── 5. Tests d'intégration (avec DB temporaire) ──────────────────────
        stage('Integration Tests') {
            environment {
                DATABASE_URL = 'postgresql://testuser:testpass@localhost:5433/testdb'
                REDIS_URL    = 'redis://localhost:6380'
                NODE_ENV     = 'test'
                JWT_SECRET   = 'test-secret-key'
                DISABLE_RATE_LIMIT = 'true'
            }
            steps {
                sh '''
                    docker run -d --name test-postgres \
                        -e POSTGRES_USER=testuser \
                        -e POSTGRES_PASSWORD=testpass \
                        -e POSTGRES_DB=testdb \
                        -p 5433:5432 \
                        postgres:16-alpine

                    docker run -d --name test-redis \
                        -p 6380:6379 \
                        redis:7-alpine

                    sleep 5
                '''
                dir('backend') {
                    sh '''
                        npx prisma db push --skip-generate
                        npm test -- --testPathPattern="tests/integration" --forceExit
                    '''
                }
            }
            post {
                always {
                    sh '''
                        docker stop test-postgres test-redis 2>/dev/null || true
                        docker rm   test-postgres test-redis 2>/dev/null || true
                    '''
                }
            }
        }

        // ── 6. Push images vers registry ─────────────────────────────────────
        stage('Push Images') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    docker push ${IMAGE_BACKEND}:${IMAGE_TAG}
                    docker push ${IMAGE_BACKEND}:latest
                    docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}
                    docker push ${IMAGE_FRONTEND}:latest
                """
            }
        }

        // ── 7. Deploy ────────────────────────────────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    docker compose -f ${COMPOSE_FILE} pull
                    docker compose -f ${COMPOSE_FILE} up -d --remove-orphans
                    docker compose -f ${COMPOSE_FILE} ps
                """
            }
        }

        // ── 8. Health check post-deploy ──────────────────────────────────────
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    echo "Attente démarrage services..."
                    sleep 15
                    curl -f http://localhost/api/health || exit 1
                    echo "Health check OK"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline reussi - Build #${BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline echoue - Build #${BUILD_NUMBER}"
        }
        always {
            sh 'docker image prune -f --filter "until=24h" 2>/dev/null || true'
        }
    }
}
