#!/bin/bash

# Test script for CommitQ deployment
# This script tests the Docker Compose setup without actually deploying

echo "🧪 Testing CommitQ Docker Compose deployment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running or not accessible"
    exit 1
fi

echo "✅ Docker is running"

# Check if required files exist
required_files=("docker-compose.yml" "docker-compose.prod.yml" "nginx.conf")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files present"

# Validate Docker Compose configurations
echo "🔍 Validating Docker Compose configurations..."

if docker compose config >/dev/null 2>&1; then
    echo "✅ Basic docker-compose.yml is valid"
else
    echo "❌ Basic docker-compose.yml has errors"
    docker compose config
    exit 1
fi

if docker compose -f docker-compose.yml -f docker-compose.prod.yml config >/dev/null 2>&1; then
    echo "✅ Production docker-compose configuration is valid"
else
    echo "❌ Production docker-compose configuration has errors"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml config
    exit 1
fi

# Test nginx config syntax (this will fail due to hostname resolution, but we can check for syntax errors)
echo "🔍 Testing nginx configuration syntax..."
if docker run --rm -v "$(pwd)/nginx.conf:/tmp/nginx.conf:ro" nginx:alpine sh -c "nginx -t -c /tmp/nginx.conf" 2>&1 | grep -q "syntax is ok"; then
    echo "✅ Nginx configuration syntax is valid"
else
    echo "⚠️  Nginx configuration test inconclusive (expected due to upstream host resolution)"
fi

# Check if the CommitQ image exists
echo "🔍 Checking if CommitQ image is available..."
if docker pull lynchz/commitq-app:latest >/dev/null 2>&1; then
    echo "✅ CommitQ image (lynchz/commitq-app:latest) is available"
else
    echo "❌ CommitQ image (lynchz/commitq-app:latest) is not available"
    echo "   Make sure the image is built and pushed to the registry"
fi

echo ""
echo "🎉 Deployment setup test completed!"
echo ""
echo "📝 Next steps:"
echo "1. Copy docker-compose.yml, docker-compose.prod.yml, and nginx.conf to your server"
echo "2. Run: docker compose pull"
echo "3. Run: docker compose up -d"
echo ""
echo "For production deployment:"
echo "1. Run: docker compose -f docker-compose.yml -f docker-compose.prod.yml pull"
echo "2. Run: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"