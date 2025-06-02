# Docker Deployment Guide

This guide provides comprehensive instructions for deploying the WordCloud Generator frontend using Docker.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Build and Run](#build-and-run)
- [Docker Compose](#docker-compose)
- [Production Deployment](#production-deployment)
- [Nginx Configuration](#nginx-configuration)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)

## 🚀 Quick Start

```bash
# Clone and navigate to the project
cd frontend

# Build and run with Docker Compose
docker-compose up --build

# Access the application
open http://localhost:3000
```

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- 1GB free disk space

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://mrabbyilyas-wordcloud-generator.hf.space
NEXT_PUBLIC_API_TIMEOUT=30000

# Application Configuration
NEXT_PUBLIC_APP_NAME=WordCloud Generator
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Generate beautiful word clouds from your text

# Production Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_SHARING=true
```

## 🏗️ Build and Run

### Option 1: Docker Only

```bash
# Build the image
docker build -t wordcloud-frontend .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://mrabbyilyas-wordcloud-generator.hf.space \
  -e NODE_ENV=production \
  wordcloud-frontend
```

### Option 2: Docker Compose (Recommended)

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.yml up --build -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## 🐳 Docker Compose Services

### Frontend Service
- **Port**: 3000
- **Health Check**: Enabled
- **Restart Policy**: unless-stopped
- **Environment**: Production optimized

### Nginx Service (Optional)
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Features**: 
  - Reverse proxy
  - Rate limiting
  - Gzip compression
  - Security headers
  - Static file caching

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Create production environment file
cp .env.example .env.production

# Edit production variables
vim .env.production
```

### 2. SSL Configuration (Optional)

```bash
# Create SSL directory
mkdir ssl

# Add your SSL certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Update nginx.conf to enable HTTPS
```

### 3. Deploy

```bash
# Build and deploy
docker-compose --env-file .env.production up --build -d

# Verify deployment
docker-compose ps
docker-compose logs frontend
```

## ⚙️ Nginx Configuration

The included `nginx.conf` provides:

- **Reverse Proxy**: Routes traffic to Next.js app
- **Rate Limiting**: Prevents abuse
- **Compression**: Gzip for better performance
- **Security Headers**: XSS, CSRF, and frame protection
- **Caching**: Static assets cached for 1 year
- **Health Checks**: `/health` endpoint

### Customizing Nginx

```bash
# Edit nginx configuration
vim nginx.conf

# Restart nginx service
docker-compose restart nginx
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 2. Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :3000

# Use different port
docker-compose up -p 3001:3000
```

#### 3. Memory Issues

```bash
# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Monitor container memory
docker stats
```

#### 4. API Connection Issues

```bash
# Check environment variables
docker-compose exec frontend env | grep API

# Test API connectivity
docker-compose exec frontend curl $NEXT_PUBLIC_API_URL
```

### Debugging Commands

```bash
# View container logs
docker-compose logs -f frontend

# Execute commands in container
docker-compose exec frontend sh

# Inspect container
docker inspect wordcloud-frontend

# Check health status
docker-compose ps
```

## ⚡ Performance Optimization

### 1. Multi-stage Build
The Dockerfile uses multi-stage builds to minimize image size:
- **deps**: Install dependencies
- **builder**: Build application
- **runner**: Production runtime

### 2. Image Optimization

```bash
# Check image size
docker images wordcloud-frontend

# Analyze image layers
docker history wordcloud-frontend
```

### 3. Resource Limits

```yaml
# Add to docker-compose.yml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### 4. Health Checks

```bash
# Monitor health status
watch docker-compose ps

# Custom health check
docker-compose exec frontend curl -f http://localhost:3000/api/health
```

## 🔒 Security Considerations

### 1. Non-root User
The container runs as a non-root user (`nextjs`) for security.

### 2. Security Headers
Nginx configuration includes comprehensive security headers:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy

### 3. Rate Limiting
Nginx implements rate limiting:
- General: 1 request/second
- API: 10 requests/second

### 4. Environment Variables
```bash
# Never commit sensitive data
echo ".env*" >> .gitignore

# Use Docker secrets for sensitive data
docker secret create api_key api_key.txt
```

## 📊 Monitoring

### 1. Container Metrics

```bash
# Real-time stats
docker stats

# Resource usage
docker-compose top
```

### 2. Application Logs

```bash
# Follow logs
docker-compose logs -f --tail=100 frontend

# Export logs
docker-compose logs frontend > app.log
```

### 3. Health Monitoring

```bash
# Health check endpoint
curl http://localhost/health

# Application health
curl http://localhost:3000
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Deploy
        run: |
          cd frontend
          docker-compose up --build -d
          
      - name: Health Check
        run: |
          sleep 30
          curl -f http://localhost:3000 || exit 1
```

## 📝 Maintenance

### Regular Tasks

```bash
# Update images
docker-compose pull
docker-compose up -d

# Clean up
docker system prune
docker volume prune

# Backup volumes
docker run --rm -v wordcloud_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

## 🆘 Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker and container logs
3. Verify environment variables and configuration
4. Test API connectivity
5. Check system resources (memory, disk space)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

---

**Note**: This configuration is optimized for production use. For development, consider using `docker-compose.dev.yml` with hot reloading and development optimizations.