#!/bin/bash

# GitHub Container Registry Authentication Helper
# This script guides you through authenticating with GitHub Container Registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
print_status "=== GitHub Container Registry Authentication ==="
echo ""

print_status "To push images to GitHub Container Registry (ghcr.io), you need to authenticate."
echo ""

print_status "Step 1: Create a Personal Access Token (if you don't have one)"
print_warning "  1. Go to: https://github.com/settings/tokens"
print_warning "  2. Click 'Generate new token (classic)'"
print_warning "  3. Give it a name like 'Docker GHCR Access'"
print_warning "  4. Select the 'write:packages' scope"
print_warning "  5. Click 'Generate token' and copy it"
echo ""

print_status "Step 2: Authenticate Docker with GitHub Container Registry"
print_warning "Run this command and use your Personal Access Token as the password:"
echo ""
print_success "  docker login ghcr.io -u lynchzdev"
echo ""

print_status "Step 3: Verify authentication"
print_warning "You can test authentication by running:"
echo ""
print_success "  docker pull ghcr.io/library/alpine:latest"
echo ""

print_status "Once authenticated, you can build and push your images using:"
print_success "  ./build-and-push-ghcr.sh"
echo ""

print_status "Or if you already have images built locally:"
print_success "  ./push-to-ghcr.sh"
echo ""

# Check if already authenticated
print_status "Checking current authentication status..."
if docker pull ghcr.io/library/alpine:latest > /dev/null 2>&1; then
    print_success "✓ Already authenticated with GitHub Container Registry!"
    echo ""
    print_status "You can proceed with building and pushing:"
    print_success "  ./build-and-push-ghcr.sh"
    echo ""
else
    print_warning "⚠ Not yet authenticated with GitHub Container Registry"
    print_status "Please follow the authentication steps above."
    echo ""
fi