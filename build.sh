#!/bin/bash
# Build script for Docker image

echo "Building Financial Forecast Docker image..."
docker build -t financial-forecast:latest .

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "To run the container:"
    echo "  docker-compose up -d"
    echo ""
    echo "Or use Portainer with docker-compose.portainer.yml"
else
    echo "Build failed!"
    exit 1
fi
