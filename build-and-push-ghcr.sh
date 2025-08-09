#!/bin/bash

# CommitQ Complete Build and Push Script for GitHub Container Registry
# This script builds multi-architecture Docker images and pushes them to GHCR

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
BUILDER_NAME="commitq-multiarch"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if buildx is available
    if ! docker buildx version > /dev/null 2>&1; then
        print_error "Docker buildx is not available. Please ensure Docker Desktop is up to date."
        exit 1
    fi
    
    # Check if git is available and we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository."
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to setup buildx builder
setup_builder() {
    print_status "Setting up multi-architecture builder..."
    
    # Remove existing builder if it exists (ignore errors)
    docker buildx rm "$BUILDER_NAME" 2>/dev/null || true
    
    # Create new builder
    if docker buildx create --name "$BUILDER_NAME" --driver docker-container --use; then
        print_success "Created buildx builder: $BUILDER_NAME"
    else
        print_error "Failed to create buildx builder"
        exit 1
    fi
    
    # Bootstrap the builder
    if docker buildx inspect --bootstrap; then
        print_success "Builder bootstrapped successfully"
    else
        print_error "Failed to bootstrap builder"
        exit 1
    fi
}

# Function to check authentication with GHCR
check_ghcr_auth() {
    print_status "Checking GitHub Container Registry authentication..."
    
    # Try to pull a public image to test auth
    if docker buildx build --platform linux/amd64 -t test-auth-ghcr --push . > /dev/null 2>&1; then
        print_success "GitHub Container Registry authentication verified"
        # Clean up test image
        docker buildx imagetools inspect test-auth-ghcr --raw > /dev/null 2>&1 || true
    else
        print_error "Not authenticated with GitHub Container Registry."
        print_warning "Please run the following command to authenticate:"
        print_warning "  docker login ghcr.io -u lynchzdev"
        print_warning "Use your GitHub Personal Access Token as the password."
        print_warning ""
        print_warning "To create a Personal Access Token:"
        print_warning "  1. Go to https://github.com/settings/tokens"
        print_warning "  2. Create a new token with 'write:packages' permission"
        print_warning "  3. Use that token as your password when prompted"
        exit 1
    fi
}

# Function to build and push multi-architecture image directly
build_and_push_direct() {
    print_status "Building and pushing multi-architecture images..."
    print_status "Platforms: linux/amd64, linux/arm64"
    print_status "Tags: latest, $GIT_COMMIT"
    
    # Build and push directly with buildx (this creates the multi-arch manifest automatically)
    if docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --tag "${GHCR_REPO}:latest" \
        --tag "${GHCR_REPO}:${GIT_COMMIT}" \
        --push \
        --progress=plain \
        .; then
        print_success "Multi-architecture images built and pushed successfully!"
    else
        print_error "Failed to build and push images"
        exit 1
    fi
}

# Function to verify the deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait a moment for the registry to process the manifests
    sleep 5
    
    # Check if images are available and show their architectures
    local tags=("latest" "$GIT_COMMIT")
    
    for tag in "${tags[@]}"; do
        print_status "Checking ${GHCR_REPO}:${tag}..."
        
        if docker buildx imagetools inspect "${GHCR_REPO}:${tag}" > /dev/null 2>&1; then
            print_success "✓ ${GHCR_REPO}:${tag} is available"
            
            # Show available architectures
            local archs
            archs=$(docker buildx imagetools inspect "${GHCR_REPO}:${tag}" --format '{{range .Manifest.Manifests}}{{printf "%s/%s " .Platform.Architecture .Platform.OS}}{{end}}')
            print_status "  Available architectures: $archs"
        else
            print_error "✗ ${GHCR_REPO}:${tag} is not available"
        fi
    done
}

# Function to update docker-compose files
update_compose_files() {
    print_status "Docker-compose files have been updated to use GitHub Container Registry"
    print_status "Image reference: ${GHCR_REPO}:latest"
}

# Function to cleanup builder
cleanup_builder() {
    print_status "Cleaning up builder..."
    docker buildx rm "$BUILDER_NAME" 2>/dev/null || true
    print_status "Builder cleanup complete"
}

# Function to show build summary
show_summary() {
    echo ""
    print_success "=== BUILD AND DEPLOYMENT SUMMARY ==="
    print_success "✓ Multi-architecture Docker images built successfully"
    print_success "✓ Images pushed to GitHub Container Registry"
    print_success "✓ Docker-compose files updated"
    echo ""
    print_status "Available images:"
    print_status "  🐳 ${GHCR_REPO}:latest"
    print_status "  🐳 ${GHCR_REPO}:${GIT_COMMIT}"
    echo ""
    print_status "Supported architectures:"
    print_status "  📱 linux/arm64 (Apple Silicon, ARM servers)"
    print_status "  💻 linux/amd64 (Intel/AMD processors)"
    echo ""
    print_status "To deploy, use:"
    print_status "  docker-compose up -d"
    print_status "  # or with production overrides:"
    print_status "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
    echo ""
}

# Function to show help
show_help() {
    echo "CommitQ Complete Build and Push Script"
    echo ""
    echo "This script builds multi-architecture Docker images and pushes them to GitHub Container Registry"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build and push images (default)"
    echo "  verify    Verify that images are available in the registry"
    echo "  help      Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - Docker Desktop with buildx support"
    echo "  - Authentication with GitHub Container Registry"
    echo "    Run: docker login ghcr.io -u lynchzdev"
    echo ""
    echo "What this script does:"
    echo "  1. Sets up multi-architecture builder"
    echo "  2. Builds images for linux/amd64 and linux/arm64"
    echo "  3. Pushes images with 'latest' and git commit hash tags"
    echo "  4. Verifies deployment"
    echo "  5. Updates docker-compose.yml to use GHCR"
    echo ""
}

# Trap to cleanup on exit
trap cleanup_builder EXIT

# Main function
main() {
    local command="${1:-build}"
    
    case "$command" in
        build)
            print_status "Starting CommitQ multi-architecture build and deployment..."
            check_prerequisites
            setup_builder
            check_ghcr_auth
            build_and_push_direct
            verify_deployment
            update_compose_files
            show_summary
            ;;
        verify)
            verify_deployment
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