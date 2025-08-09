# CommitQ Deployment Guide

This guide provides step-by-step instructions for deploying CommitQ in production using Docker Compose.

## Prerequisites

### Server Requirements
- Linux server (Ubuntu 20.04+ recommended)
- Minimum 1GB RAM, 1 CPU core
- 10GB available disk space
- Open ports: 80 (HTTP), 443 (HTTPS - optional)

### Software Requirements
- Docker Engine 20.10+
- Docker Compose v2.0+

### Installing Docker and Docker Compose

```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect

# Install Docker Compose v2
sudo apt install docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

## Deployment Steps

### Step 1: Prepare Server Directory

```bash
# Create deployment directory
mkdir -p ~/commitq-deployment
cd ~/commitq-deployment
```

### Step 2: Copy Deployment Files

Copy these files to your server in the `~/commitq-deployment` directory:
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `nginx.conf`

You can use `scp`, `rsync`, or any file transfer method:

```bash
# Example using scp from your local machine
scp docker-compose.yml docker-compose.prod.yml nginx.conf user@your-server:~/commitq-deployment/

# Or create an ssl directory if you plan to use HTTPS
mkdir ssl
# Copy your SSL certificates to the ssl directory if needed
```

### Step 3: Environment Configuration (Optional)

Create a `.env` file for any environment-specific variables:

```bash
# Create .env file
cat > .env << 'EOF'
# Add any environment variables here
# DATABASE_URL=postgresql://user:password@db:5432/commitq
# REDIS_URL=redis://redis:6379
# JWT_SECRET=your-secret-key-here
EOF
```

### Step 4: Deploy the Application

#### Basic Deployment (Development/Testing)
```bash
# Pull the latest image and start services
docker compose pull
docker compose up -d
```

#### Production Deployment (Recommended)
```bash
# Pull the latest images
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Start services with production configuration
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Step 5: Verify Deployment

```bash
# Check if services are running
docker compose ps

# Check service logs
docker compose logs commitq
docker compose logs nginx

# Test the application
curl http://localhost/health
curl http://your-server-ip/

# Check service health
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

## Post-Deployment

### Updating the Application

```bash
# Navigate to deployment directory
cd ~/commitq-deployment

# Pull the latest image
docker compose pull commitq

# Restart with zero-downtime (nginx will handle the transition)
docker compose up -d --no-deps commitq

# Or for production deployment
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull commitq
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps commitq
```

### SSL/HTTPS Setup (Optional)

1. Obtain SSL certificates (Let's Encrypt, commercial CA, or self-signed)
2. Place certificates in the `ssl/` directory:
   ```bash
   mkdir ssl
   # Copy your certificates
   cp your-cert.pem ssl/cert.pem
   cp your-private-key.pem ssl/key.pem
   ```
3. Uncomment the HTTPS server block in `nginx.conf`
4. Update the server_name in nginx.conf with your domain
5. Restart nginx: `docker compose restart nginx`

### Monitoring and Logs

```bash
# View real-time logs
docker compose logs -f

# View specific service logs
docker compose logs -f commitq
docker compose logs -f nginx

# Check resource usage
docker stats

# View nginx access logs (if volume mounted)
docker compose exec nginx tail -f /var/log/nginx/access.log
```

## Maintenance Commands

### Starting Services
```bash
docker compose start
# or for production
docker compose -f docker-compose.yml -f docker-compose.prod.yml start
```

### Stopping Services
```bash
docker compose stop
# or for production
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop
```

### Restarting Services
```bash
docker compose restart
# or restart specific service
docker compose restart commitq
```

### Removing Services (Be Careful!)
```bash
# Stop and remove containers (keeps images and volumes)
docker compose down

# Remove everything including volumes (DESTRUCTIVE!)
docker compose down -v
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Error**: "Port 80 is already in use"
**Solution**: 
```bash
# Check what's using the port
sudo netstat -tlnp | grep :80
# Stop the conflicting service or change the port in docker-compose.yml
```

#### 2. Container Not Starting
**Diagnosis**:
```bash
# Check container status
docker compose ps
# Check logs for errors
docker compose logs commitq
```

#### 3. Application Not Accessible
**Check**:
```bash
# Verify services are healthy
docker compose ps
# Test internal connectivity
docker compose exec nginx wget -qO- http://commitq:3000/api/health
# Check nginx configuration
docker compose exec nginx nginx -t
```

#### 4. Health Check Failures
**Diagnosis**:
```bash
# Check health check logs
docker inspect commitq-app | grep -A 10 '"Health"'
# Test health endpoint manually
docker compose exec commitq wget -qO- http://localhost:3000/api/health
```

### Log Analysis

```bash
# View last 100 lines of all logs
docker compose logs --tail=100

# Follow logs for debugging
docker compose logs -f --tail=50

# Filter logs by service
docker compose logs nginx | grep ERROR
```

### Performance Monitoring

```bash
# Check resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Check disk usage
docker system df
```

## Security Considerations

1. **Firewall**: Only expose necessary ports (80, 443)
2. **Updates**: Regularly update the Docker image
3. **SSL**: Use HTTPS in production
4. **Secrets**: Use environment variables for sensitive data
5. **Rate Limiting**: Nginx configuration includes basic rate limiting
6. **Security Headers**: Security headers are configured in nginx

## Backup and Recovery

### Backup
```bash
# Backup configuration files
tar -czf commitq-backup-$(date +%Y%m%d).tar.gz docker-compose.yml docker-compose.prod.yml nginx.conf ssl/ .env

# If you have persistent data, backup volumes too
docker run --rm -v commitq_nginx_logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Recovery
```bash
# Restore configuration
tar -xzf commitq-backup-YYYYMMDD.tar.gz

# Redeploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Support

- Check the application logs: `docker compose logs commitq`
- Check nginx logs: `docker compose logs nginx`
- Verify health endpoints: `curl http://localhost/health`
- Monitor resource usage: `docker stats`

For issues with the CommitQ application itself, check the project repository or contact the development team.