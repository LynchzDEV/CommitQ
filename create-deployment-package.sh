#!/bin/bash

# Script to create a deployment package for CommitQ
# This creates a tar.gz file with all necessary deployment files

PACKAGE_NAME="commitq-deployment-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "📦 Creating CommitQ deployment package..."

# Files to include in the deployment package
deployment_files=(
    "docker-compose.yml"
    "docker-compose.prod.yml" 
    "nginx.conf"
    "DEPLOYMENT.md"
    "test-deployment.sh"
)

# Check if all files exist
missing_files=()
for file in "${deployment_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "❌ Missing required files:"
    printf '   - %s\n' "${missing_files[@]}"
    exit 1
fi

# Create the package
echo "📁 Including files:"
printf '   ✓ %s\n' "${deployment_files[@]}"

tar -czf "$PACKAGE_NAME" "${deployment_files[@]}"

if [[ $? -eq 0 ]]; then
    echo ""
    echo "✅ Deployment package created: $PACKAGE_NAME"
    echo ""
    echo "📋 Package contents:"
    tar -tzf "$PACKAGE_NAME"
    echo ""
    echo "📤 To deploy on your server:"
    echo "1. Copy $PACKAGE_NAME to your server"
    echo "2. Extract: tar -xzf $PACKAGE_NAME"
    echo "3. Follow instructions in DEPLOYMENT.md"
    echo ""
    echo "🚀 Quick deployment commands:"
    echo "   Basic:      docker compose up -d"
    echo "   Production: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
else
    echo "❌ Failed to create deployment package"
    exit 1
fi