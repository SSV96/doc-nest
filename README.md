# NestJS Backend - Document Management and User Authentication

## Overview

This project is a NestJS-based backend service designed for user management, document management, and integration with a Python backend for document ingestion, as part of a coding exercise. It demonstrates a microservices architecture, robust authentication with role-based access control (RBAC), and a scalable design adhering to SOLID principles.

## Features

- **🔑 Authentication**: JWT-based login and registration with role support (admin, editor, viewer).
- **👤 User Management**: Admin-only CRUD operations for managing users and roles.
- **📄 Document Management**: CRUD operations for documents, including file uploads and ingestion triggering.
- **🔄 Microservices Integration**: Communicates with a Python backend for document ingestion via HTTP .
- **📈 Scalability**: Supports large datasets (1000+ users, 100000+ documents) with test data generation.
- **✅ Testing**: Automated unit tests with 70%+ coverage.
- **🚀 Deployment**: Dockerized for local and production environments with CI/CD pipeline.

## Tech Stack

- **⚡ Framework**: NestJS (Node.js)
- **🔤 Language**: TypeScript
- **🗄️ Database**: PostgreSQL (via TypeORM)
- **🔐 Authentication**: JWT with Passport
- **🌐 HTTP Client**: Axios with RxJS
- **🧪 Testing**: Jest
- **🐳 Containerization**: Docker
- **📦 CI/CD**: GitHub Actions

## Project Structure

```
src/
├── auth/                # Authentication module (JWT, login, register)
├── users/               # User management module (CRUD, roles)
├── documents/           # Document management module (CRUD, ingestion)
├── ingestion/           # Ingestion-specific logic (if separated)
├── common/              # Reusable decorators and guards (e.g., RolesGuard)
└── main.ts              # Application entry point
```

## Prerequisites

- Node.js v18+
- Docker and Docker Compose
- Git
- (Optional) RabbitMQ for async microservices
- (Optional) AWS CLI for production deployment

# Setup for Development

1. Clone the Repository

```bash
git clone <repository-url>
cd nestjs-backend
```

2. Install Dependencies

```bash
npm install
```

3. Configure Environment Variables
   Create a .env file in the root directory:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=nestjs_db
JWT_SECRET=secretKey
JWT_EXPIRES_IN=1d
AWS_ACCESS_KEY_ID=aws_access_key
AWS_SECRET_ACCESS_KEY=aws_secret_access_key
AWS_BUCKET_NAME=simple_storage_service_bucket_name
AWS_REGION=aws-region
INGESTION_SERVICE_URL=localhost:3001/ingested
```

4. Run PostgreSQL (Manually or via Docker)
   Run a Postgres container separately:

```bash
docker run -d --name postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nestjs_db \
  -p 5432:5432 \
  postgres:15
```

5. Build and Run with Docker

- Build the Docker image using the Dockerfile

```
docker build -t nestjs-backend .
```

- Run the container, linking it to the Postgres container:

```bash
docker run -d --name nestjs-app \
  -p 3000:3000 \
  --link postgres:db \
  -e DATABASE_HOST=db \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=user \
  -e DATABASE_PASSWORD=password \
  -e DATABASE_NAME=nestjs_db \
  -e JWT_SECRET=secretKey \
  -e JWT_EXPIRES_IN=1d \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -e AWS_BUCKET_NAME \
  -e AWS_REGION \
  -e INGESTION_SERVICE_URL
  nestjs-backend
```

6. Seed Test Data (Optional)
   Generate 1000+ users and 100000+ documents (run locally first):

```
npm run seed
```

8. ## Verify

Access Swagger API docs at:  
 [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Test the endpoints, for example:

**POST /auth/login** with the following request body:

```json
{ "email": "admin@example.com", "password": "pass123" }
```

## Production Deployment (GitLab CI)

### 1. Configure GitLab CI/CD Variables

In your GitLab project settings (Settings > CI/CD > Variables), add the following as protected and masked variables:

```bash
CI_REGISTRY_USER: Your Docker registry username.
CI_REGISTRY_PASSWORD: Your Docker registry password.
CI_REGISTRY: Your Docker registry URL (e.g., docker.io/your-username).
SSH_PRIVATE_KEY: Private key for SSH access to the production server.
PG_HOST, PG_DATABASE, PG_USER, PG_PASSWORD, PG_PORT: Postgres credentials.
JWT_SECRET, JWT_EXPIRES_IN: JWT configuration.
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME: AWS S3 credentials.
INGESTION_SERVICE_URL: URL of the Python backend ingestion service.
```

### 2. GitLab CI/CD Pipeline

- The .gitlab-ci.yml automates building and deploying the Docker image:

```yaml
stages:
  - build
  - deploy

variables:
  DOCKER_REGISTRY: 'your-docker-registry' # Replace with your registry
  APP_NAME: 'doc-nest'
  IMAGE_TAG: '$CI_COMMIT_SHA' # Use commit SHA for unique tags
  SERVER_IP: 'your-server-ip'
  SERVER_USER: 'your-server-user'
  DEPLOY_DIR: '/path/to/deploy/directory'
  PORT: 'your-app-port'
  NODE_ENV: 'production'
  PG_HOST: '$PG_HOST'
  PG_DATABASE: '$PG_DATABASE'
  PG_USER: '$PG_USER'
  PG_PASSWORD: '$PG_PASSWORD'
  PG_PORT: '$PG_PORT'
  JWT_SECRET: '$JWT_SECRET'
  JWT_EXPIRES_IN: '$JWT_EXPIRES_IN'
  AWS_ACCESS_KEY_ID: '$AWS_ACCESS_KEY_ID'
  AWS_SECRET_ACCESS_KEY: '$AWS_SECRET_ACCESS_KEY'
  AWS_REGION: '$AWS_REGION'
  AWS_BUCKET_NAME: '$AWS_BUCKET_NAME'
  INGESTION_SERVICE_URL: '$INGESTION_SERVICE_URL'

build_image:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
    - docker build -t "$APP_NAME:$IMAGE_TAG" .
    - docker tag "$APP_NAME:$IMAGE_TAG" "$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"
    - docker push "$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"

deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk update && apk add openssh-client
  script:
    - ssh -o StrictHostKeyChecking=no -i "$SSH_PRIVATE_KEY" "$SERVER_USER@$SERVER_IP" << EOF
      echo "Deploying $APP_NAME..."
      mkdir -p "$DEPLOY_DIR"
      docker stop "$APP_NAME" || true
      docker rm "$APP_NAME" || true
      docker pull "$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"
      docker run -d \
      --name "$APP_NAME" \
      -p "$PORT:$PORT" \
      -e NODE_ENV="$NODE_ENV" \
      -e PORT="$PORT" \
      -e PG_HOST="$PG_HOST" \
      -e PG_DATABASE="$PG_DATABASE" \
      -e PG_USER="$PG_USER" \
      -e PG_PASSWORD="$PG_PASSWORD" \
      -e PG_PORT="$PG_PORT" \
      -e JWT_SECRET="$JWT_SECRET" \
      -e JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
      -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
      -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
      -e AWS_REGION="$AWS_REGION" \
      -e AWS_BUCKET_NAME="$AWS_BUCKET_NAME" \
      -e INGESTION_SERVICE_URL="$INGESTION_SERVICE_URL" \
      "$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"
      echo "Deployment of $APP_NAME complete."
      EOF
  environment:
    name: production
  only:
    - main # Or your production branch name
```

### 3. Verify

- After the pipeline runs, SSH into your-server-ip as your-server-user.
- Check the container: docker ps.
  Test endpoints (e.g., http://your-server-ip:your-app-port/api)

## API Endpoints

### Authentication:

- POST /auth/register: Register a user (e.g.,
  { "email": "test@example.com", "password": "pass123", "role": "editor" }).
- POST /auth/login: Login and get JWT (e.g., { "email": "test@example.com", "password": "pass123" }).

### Users (Admin-only):

- GET /users: List all users.
- GET /users/:id: Get user details.
- PATCH /users/:id: Update user.
- DELETE /users/:id: Delete user.

### Documents:

- POST /documents: Upload a document (multipart/form-data, requires admin or editor).
- GET /documents: List documents (all roles).
- GET /documents/:id: Get document details (all roles).
- DELETE /documents/:id: Delete document (requires admin or editor).
- POST /documents/:id/ingest: Trigger ingestion (requires admin or editor).

Use Authorization: Bearer <token> header for authenticated requests.

## Design Decisions

### Microservices:

- **Integration with Python backend**: Utilizes **HTTP** for integration with the Python backend for document ingestion, ensuring loose coupling between services.

### Authentication:

- **JWT with Role-Based Access Control (RBAC)**: Implements **JwtAuthGuard** and **RolesGuard** to provide secure, scalable access control, ensuring users are authorized based on their roles (e.g., admin, editor, viewer).

### Data Modeling:

- **Normalized Schema**: Defines **User** and **Document** entities with normalized schema design, supporting efficient queries and the handling of large datasets.

### Testing:

- **Jest for Unit Testing**: Utilizes **Jest** for unit testing, with over **70% code coverage**, ensuring robust application functionality and reducing the risk of bugs.

### Scalability:

- **API Pagination**: APIs are designed to support **pagination**, reducing load on the server and enabling better handling of large datasets.
- **Connection Pooling**: Uses **connection pooling** with PostgreSQL to efficiently manage database connections.

### Running Tests

```bash
npm run test
```

### This updated README.md reflects your use of GitLab CI/CD and a Dockerfile, clear deployment instructions and comprehensive documentation. Let me know if you’d like further refinements!
