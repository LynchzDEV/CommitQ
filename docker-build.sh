#!/bin/bash

# CommitQ Docker Build Script
# This script provides convenient commands for building and running the CommitQ application with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="commitq"
CONTAINER_NAME="commitq-app"
PORT=3000

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to build the Docker image
build() {
    print_status "Building Docker image: $IMAGE_NAME"

    if docker build -t $IMAGE_NAME .; then
        print_success "Docker image built successfully!"
        docker images | grep $IMAGE_NAME
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to run the container
run() {
    print_status "Running container: $CONTAINER_NAME on port $PORT"

    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_warning "Stopping existing container..."
        docker stop $CONTAINER_NAME > /dev/null 2>&1
        docker rm $CONTAINER_NAME > /dev/null 2>&1
    fi

    # Run new container
    if docker run -d --name $CONTAINER_NAME -p $PORT:3000 $IMAGE_NAME; then
        print_success "Container started successfully!"
        print_status "Application available at: http://localhost:$PORT"
        print_status "Container logs: docker logs $CONTAINER_NAME"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to build and run
build_and_run() {
    build
    run
}

# Function to stop the container
stop() {
    print_status "Stopping container: $CONTAINER_NAME"

    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        print_success "Container stopped and removed"
    else
        print_warning "Container $CONTAINER_NAME is not running"
    fi
}

# Function to show logs
logs() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_status "Showing logs for container: $CONTAINER_NAME"
        docker logs -f $CONTAINER_NAME
    else
        print_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# Function to show container status
status() {
    print_status "Container status:"
    docker ps -a | grep $CONTAINER_NAME || print_warning "No containers found with name: $CONTAINER_NAME"

    print_status "Image information:"
    docker images | grep $IMAGE_NAME || print_warning "No images found with name: $IMAGE_NAME"
}

# Function to clean up
clean() {
    print_status "Cleaning up Docker resources..."

    # Stop and remove container
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME > /dev/null 2>&1 || true
        docker rm $CONTAINER_NAME > /dev/null 2>&1 || true
        print_success "Container removed"
    fi

    # Remove image
    if docker images -q $IMAGE_NAME | grep -q .; then
        docker rmi $IMAGE_NAME
        print_success "Image removed"
    fi

    # Remove dangling images
    if docker images -q -f dangling=true | grep -q .; then
        print_status "Removing dangling images..."
        docker image prune -f
    fi
}

# Function to run with Docker Compose
compose_up() {
    print_status "Starting with Docker Compose..."

    if [ -f "docker-compose.yml" ]; then
        docker-compose up --build -d
        print_success "Application started with Docker Compose"
        print_status "Application available at: http://localhost:$PORT"
    else
        print_error "docker-compose.yml not found"
        exit 1
    fi
}

# Function to stop Docker Compose
compose_down() {
    print_status "Stopping Docker Compose services..."

    if [ -f "docker-compose.yml" ]; then
        docker-compose down
        print_success "Docker Compose services stopped"
    else
        print_error "docker-compose.yml not found"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "CommitQ Docker Build Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build           Build the Docker image"
    echo "  run             Run the container"
    echo "  start           Build and run the container"
    echo "  stop            Stop and remove the container"
    echo "  logs            Show container logs"
    echo "  status          Show container and image status"
    echo "  clean           Remove container and image"
    echo "  compose-up      Start with Docker Compose"
    echo "  compose-down    Stop Docker Compose services"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build           # Build the Docker image"
    echo "  $0 start           # Build and run the application"
    echo "  $0 logs            # View application logs"
    echo "  $0 compose-up      # Start with Docker Compose"
    echo ""
}

# Main script logic
main() {
    check_docker

    case "${1:-help}" in
        build)
            build
            ;;
        run)
            run
            ;;
        start)
            build_and_run
            ;;
        stop)
            stop
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        compose-up)
            compose_up
            ;;
        compose-down)
            compose_down
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
