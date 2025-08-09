#!/bin/bash

# CommitQ GitHub Container Registry Push Script
# This script pushes the multi-architecture Docker images to GitHub Container Registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GHCR_REPO="ghcr.io/lynchzdev/commitq-app"
GIT_COMMIT=$(git rev-parse --short HEAD)

# Function to print colored output
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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if buildx is available
check_buildx() {
    if ! docker buildx version > /dev/null 2>&1; then
        print_error "Docker buildx is not available. Please ensure Docker Desktop is up to date."
        exit 1
    fi
}

# Function to check authentication
check_auth() {
    print_status "Checking GitHub Container Registry authentication..."
    
    if ! docker manifest inspect ghcr.io/library/alpine:latest > /dev/null 2>&1; then
        print_error "Not authenticated with GitHub Container Registry."
        print_warning "Please run: docker login ghcr.io -u lynchzdev"
        print_warning "Use your GitHub Personal Access Token as the password."
        exit 1
    fi
    
    print_success "GitHub Container Registry authentication verified"
}

# Function to push individual architecture images
push_architecture_images() {
    print_status "Pushing architecture-specific images..."
    
    local architectures=("amd64" "arm64")
    
    for arch in "${architectures[@]}"; do
        print_status "Pushing ${arch} images..."
        
        # Push latest tag for architecture
        if docker push "${GHCR_REPO}:latest-${arch}"; then
            print_success "Pushed ${GHCR_REPO}:latest-${arch}"
        else
            print_error "Failed to push ${GHCR_REPO}:latest-${arch}"
            exit 1
        fi
        
        # Push commit hash tag for architecture
        if docker push "${GHCR_REPO}:${GIT_COMMIT}-${arch}"; then
            print_success "Pushed ${GHCR_REPO}:${GIT_COMMIT}-${arch}"
        else
            print_error "Failed to push ${GHCR_REPO}:${GIT_COMMIT}-${arch}"
            exit 1
        fi
    done
}

# Function to create and push multi-architecture manifest
create_manifest() {
    print_status "Creating multi-architecture manifests..."
    
    # Create and push latest manifest
    print_status "Creating manifest for 'latest' tag..."
    docker manifest create "${GHCR_REPO}:latest" \
        "${GHCR_REPO}:latest-amd64" \
        "${GHCR_REPO}:latest-arm64"
    
    docker manifest annotate "${GHCR_REPO}:latest" "${GHCR_REPO}:latest-amd64" --arch amd64
    docker manifest annotate "${GHCR_REPO}:latest" "${GHCR_REPO}:latest-arm64" --arch arm64
    
    if docker manifest push "${GHCR_REPO}:latest"; then
        print_success "Pushed multi-architecture manifest: ${GHCR_REPO}:latest"
    else
        print_error "Failed to push manifest for 'latest' tag"
        exit 1
    fi
    
    # Create and push commit hash manifest
    print_status "Creating manifest for '${GIT_COMMIT}' tag..."
    docker manifest create "${GHCR_REPO}:${GIT_COMMIT}" \
        "${GHCR_REPO}:${GIT_COMMIT}-amd64" \
        "${GHCR_REPO}:${GIT_COMMIT}-arm64"
    
    docker manifest annotate "${GHCR_REPO}:${GIT_COMMIT}" "${GHCR_REPO}:${GIT_COMMIT}-amd64" --arch amd64
    docker manifest annotate "${GHCR_REPO}:${GIT_COMMIT}" "${GHCR_REPO}:${GIT_COMMIT}-arm64" --arch arm64
    
    if docker manifest push "${GHCR_REPO}:${GIT_COMMIT}"; then
        print_success "Pushed multi-architecture manifest: ${GHCR_REPO}:${GIT_COMMIT}"
    else
        print_error "Failed to push manifest for '${GIT_COMMIT}' tag"
        exit 1
    fi
}

# Function to verify the push
verify_push() {
    print_status "Verifying pushed images..."
    
    # Check latest tag
    if docker manifest inspect "${GHCR_REPO}:latest" > /dev/null 2>&1; then
        print_success "✓ ${GHCR_REPO}:latest is available"
        docker manifest inspect "${GHCR_REPO}:latest" | jq -r '.manifests[].platform | "\(.architecture)/\(.os)"' | sed 's/^/  - /'
    else
        print_error "✗ ${GHCR_REPO}:latest is not available"
    fi
    
    # Check commit hash tag
    if docker manifest inspect "${GHCR_REPO}:${GIT_COMMIT}" > /dev/null 2>&1; then
        print_success "✓ ${GHCR_REPO}:${GIT_COMMIT} is available"
        docker manifest inspect "${GHCR_REPO}:${GIT_COMMIT}" | jq -r '.manifests[].platform | "\(.architecture)/\(.os)"' | sed 's/^/  - /'
    else
        print_error "✗ ${GHCR_REPO}:${GIT_COMMIT} is not available"
    fi
}

# Function to clean up local architecture-specific images
cleanup_local() {
    print_status "Cleaning up local architecture-specific images..."
    
    local architectures=("amd64" "arm64")
    
    for arch in "${architectures[@]}"; do
        # Remove latest-arch tags
        if docker rmi "${GHCR_REPO}:latest-${arch}" 2>/dev/null; then
            print_status "Removed local tag: latest-${arch}"
        fi
        
        # Remove commit-arch tags  
        if docker rmi "${GHCR_REPO}:${GIT_COMMIT}-${arch}" 2>/dev/null; then
            print_status "Removed local tag: ${GIT_COMMIT}-${arch}"
        fi
    done
}

# Function to show help
show_help() {
    echo "CommitQ GitHub Container Registry Push Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  push      Push images to GitHub Container Registry (default)"
    echo "  verify    Verify that images are available in the registry"
    echo "  cleanup   Remove local architecture-specific images"
    echo "  help      Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - Docker must be running"
    echo "  - Must be authenticated with ghcr.io: docker login ghcr.io -u lynchzdev"
    echo "  - Images must be built locally first"
    echo ""
    echo "Examples:"
    echo "  $0 push      # Push all images and create manifests"
    echo "  $0 verify    # Verify images are available in registry"
    echo "  $0 cleanup   # Clean up local architecture-specific tags"
    echo ""
}

# Main function
main() {
    local command="${1:-push}"
    
    case "$command" in
        push)
            check_docker
            check_buildx
            check_auth
            push_architecture_images
            create_manifest
            verify_push
            print_success "All images pushed successfully to GitHub Container Registry!"
            print_status "Available images:"
            print_status "  - ${GHCR_REPO}:latest (multi-architecture)"
            print_status "  - ${GHCR_REPO}:${GIT_COMMIT} (multi-architecture)"
            ;;
        verify)
            verify_push
            ;;
        cleanup)
            cleanup_local
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"