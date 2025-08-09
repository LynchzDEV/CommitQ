#!/bin/bash

# CommitQ Cloudflare Tunnel Deployment Script
# This script helps deploy CommitQ with Cloudflare Tunnel

set -e

echo "🚀 CommitQ Cloudflare Tunnel Deployment"
echo "========================================"

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    exit 1
fi

# Check for required files
REQUIRED_FILES=(
    "docker-compose.yml"
    "docker-compose.cloudflare.yml"
    "nginx.cloudflare.conf"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

# Check for tunnel token
if [[ -z "$CLOUDFLARE_TUNNEL_TOKEN" && ! -f ".env" ]]; then
    echo "❌ Cloudflare tunnel token not found!"
    echo "Please set CLOUDFLARE_TUNNEL_TOKEN environment variable or create .env file"
    echo "Example:"
    echo "export CLOUDFLARE_TUNNEL_TOKEN=your-token-here"
    echo "or create .env file with: CLOUDFLARE_TUNNEL_TOKEN=your-token-here"
    exit 1
fi

# Determine deployment mode
PRODUCTION_MODE=false
if [[ "$1" == "--production" || "$1" == "-p" ]]; then
    PRODUCTION_MODE=true
    echo "📦 Production mode enabled"
fi

# Build compose command
COMPOSE_CMD="docker compose -f docker-compose.yml"

if [[ "$PRODUCTION_MODE" == true ]]; then
    if [[ ! -f "docker-compose.prod.yml" ]]; then
        echo "❌ docker-compose.prod.yml not found for production deployment"
        exit 1
    fi
    COMPOSE_CMD="$COMPOSE_CMD -f docker-compose.prod.yml"
fi

COMPOSE_CMD="$COMPOSE_CMD -f docker-compose.cloudflare.yml"

echo "📋 Deployment Configuration:"
echo "  - Production Mode: $PRODUCTION_MODE"
echo "  - Compose Command: $COMPOSE_CMD"

# Stop existing services
echo "🛑 Stopping existing services..."
$COMPOSE_CMD down

# Pull latest images
echo "📥 Pulling latest images..."
$COMPOSE_CMD pull

# Start services
echo "🚀 Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health checks
echo "🏥 Performing health checks..."

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Some containers failed to start"
    echo "Container status:"
    docker compose ps
    exit 1
fi

# Test nginx health endpoint
echo "🔍 Testing nginx health endpoint..."
for i in {1..30}; do
    if curl -f http://localhost/health &> /dev/null; then
        echo "✅ nginx health check passed"
        break
    elif [[ $i -eq 30 ]]; then
        echo "❌ nginx health check failed after 30 attempts"
        echo "Container logs:"
        docker compose logs nginx
        exit 1
    else
        echo "⏳ Waiting for nginx... (attempt $i/30)"
        sleep 2
    fi
done

# Test application health endpoint
echo "🔍 Testing application health endpoint..."
for i in {1..30}; do
    if curl -f http://localhost/api/health &> /dev/null; then
        echo "✅ Application health check passed"
        break
    elif [[ $i -eq 30 ]]; then
        echo "❌ Application health check failed after 30 attempts"
        echo "Container logs:"
        docker compose logs commitq
        exit 1
    else
        echo "⏳ Waiting for application... (attempt $i/30)"
        sleep 2
    fi
done

# Check cloudflared tunnel
echo "🔍 Checking Cloudflare tunnel connection..."
if docker compose logs cloudflared | grep -q "Connected to"; then
    echo "✅ Cloudflare tunnel connected successfully"
elif docker compose logs cloudflared | grep -q "error\|failed"; then
    echo "❌ Cloudflare tunnel connection issues detected"
    echo "Tunnel logs:"
    docker compose logs cloudflared
    exit 1
else
    echo "⚠️  Cloudflare tunnel status unclear, check logs manually"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
$COMPOSE_CMD ps

echo ""
echo "📝 Next Steps:"
echo "1. Verify your domain is pointing to the Cloudflare tunnel"
echo "2. Test external access to your domain"
echo "3. Monitor logs: docker compose logs -f"
echo ""
echo "📚 Useful Commands:"
echo "  View logs: docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml logs -f"
echo "  Stop services: docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml down"
echo "  Restart services: docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml restart"
echo ""
echo "🔗 Access your application at: https://your-domain.com"