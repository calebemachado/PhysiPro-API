# Deployment Guide

This guide outlines the process for deploying the PhysiPro API to different environments, including staging and production.

## Deployment Environments

The PhysiPro API supports the following deployment environments:

| Environment | Description | URL |
|-------------|-------------|-----|
| Development | Local development environment | http://localhost:3000 |
| Staging | Pre-production testing environment | https://staging-api.physipro.com |
| Production | Live production environment | https://api.physipro.com |

## Prerequisites

Before deploying, ensure you have:

- Access to the target environment (SSH keys, AWS credentials, etc.)
- Proper environment variables configured for the target environment
- Latest codebase changes merged to the appropriate branch
- All tests passing in the CI/CD pipeline

## Deployment Methods

PhysiPro API can be deployed using any of the following methods:

1. Docker-based deployment (recommended)
2. Node.js direct deployment
3. CI/CD automated deployment

## Docker Deployment (Recommended)

### Building the Docker Image

```bash
# Build the Docker image
docker build -t physipro-api:latest .

# Optionally tag with a version
docker tag physipro-api:latest physipro-api:1.2.3
```

### Deploying with Docker Compose

We provide a production-ready docker-compose configuration:

```bash
# Deploy using docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Verify the deployment
docker-compose -f docker-compose.prod.yml ps
```

### Deploying to AWS ECS

If deploying to AWS ECS:

```bash
# Log in to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag the image for ECR
docker tag physipro-api:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/physipro-api:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/physipro-api:latest

# Update the ECS service
aws ecs update-service --cluster physipro-cluster --service physipro-api-service --force-new-deployment
```

## Node.js Direct Deployment

For environments where Docker is not available:

```bash
# Clone the repository
git clone https://github.com/yourusername/physipro-api.git
cd physipro-api

# Checkout the appropriate branch
git checkout main  # for production
git checkout develop  # for staging

# Install dependencies
npm ci --production

# Build the application
npm run build

# Start the server
NODE_ENV=production npm start
```

## CI/CD Automated Deployment

Our repository is configured with GitHub Actions for automated deployments:

- **Staging**: Auto-deploys when changes are merged to the `develop` branch
- **Production**: Deploys when a release is created or when manually triggered

To manually trigger a deployment:

1. Go to GitHub repository
2. Navigate to Actions tab
3. Select the appropriate workflow
4. Click "Run workflow" and select the branch

## Environment Variables

Ensure the following environment variables are configured in your deployment environment:

```
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=db.example.com
DB_PORT=5433
DB_NAME=physipro_prod
DB_USER=dbuser
DB_PASSWORD=dbpassword

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=24h

# Logging Configuration
LOG_LEVEL=info

# Monitoring Configuration
SENTRY_DSN=https://sentry-key@sentry.io/project
```

## Database Migrations

Always run database migrations before deploying a new version:

```bash
# Run migrations
npm run db:migrate
```

For Docker deployments, run migrations in the container:

```bash
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## Health Checks

Monitor the health of your deployment using the health check endpoint:

```
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "1.2.3",
  "timestamp": "2023-05-15T10:15:30Z"
}
```

## Rollback Procedure

If issues are detected after deployment:

### Docker Rollback

```bash
# Pull the previous version
docker pull physipro-api:1.2.2

# Update the tag
docker tag physipro-api:1.2.2 physipro-api:latest

# Redeploy
docker-compose -f docker-compose.prod.yml up -d
```

### Node.js Rollback

```bash
# Checkout the previous version
git checkout v1.2.2

# Rebuild and restart
npm ci --production
npm run build
NODE_ENV=production npm start
```

### Database Rollback

If database migration issues occur:

```bash
# Roll back the last migration
npm run db:migrate:undo
```

## Monitoring and Logging

### Logging

Logs are written to:

- `stdout/stderr` for containerized deployments
- `/var/log/physipro-api` for direct server deployments

### Monitoring

We use the following tools for monitoring:

- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Sentry** for error tracking

Access Grafana dashboards at:

- Staging: https://monitoring.staging-physipro.com
- Production: https://monitoring.physipro.com

## Post-Deployment Verification

After deployment, verify the following:

1. Health check endpoint returns 200 OK
2. API documentation is accessible
3. Authentication endpoints work as expected
4. Run smoke tests against the deployment
5. Monitor logs for any unexpected errors

## Deployment Checklist

- [ ] All tests are passing in CI
- [ ] Code has been reviewed and approved
- [ ] Database migrations are ready
- [ ] Environment variables are configured
- [ ] Deployment has been tested in staging
- [ ] Rollback plan is prepared
- [ ] Documentation has been updated
- [ ] Monitoring alerts are configured

## Common Issues and Troubleshooting

### Database Connection Issues

If the application cannot connect to the database:

1. Verify database credentials in environment variables
2. Check network connectivity between application and database
3. Confirm database service is running and accessible

### JWT Authentication Failures

If authentication is failing:

1. Verify JWT_SECRET is correctly set
2. Check that JWT_EXPIRES_IN is properly configured
3. Ensure clocks are synchronized between servers

### Performance Issues

If experiencing slow response times:

1. Check database query performance
2. Monitor server CPU and memory usage
3. Verify that connection pooling is properly configured
4. Scale horizontally if needed by adding more instances 
