#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "FASTGO â€” Oracle Cloud Always Free Deploy Script"
echo "=============================================="

# Ensure Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker CE..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker \
    echo "Docker installed successfully."
fi

# Ensure .env file exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "IMPORTANT: Review and update .env before going to production!"
fi

# Pull and rebuild containers
echo "Building and launching containers..."
docker compose pull --ignore-pull-failures
docker compose build --pull
docker compose up -d --remove-orphans

echo "Verifying health..."
docker compose ps

echo "=============================================="
echo "Deployment completed successfully!"
echo "Backend: https://\"
echo "=============================================="