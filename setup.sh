#!/bin/bash
# Agent Orchestrator Dashboard - Easy Setup Script

set -e

echo "Agent Orchestrator Dashboard Setup"
echo "======================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Docker and Docker Compose found"
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVFILE'
# Agent Orchestrator Dashboard Configuration
GITHUB_TOKEN=your_github_token_here
API_PORT=8000
DASHBOARD_PORT=8080
DB_USER=agentadmin
DB_PASSWORD=changeme
DB_NAME=agentdashboard
ENVFILE
    echo ".env file created"
    echo "Please edit .env and add your GitHub token (optional)"
else
    echo ".env file already exists"
fi

echo ""
echo "Building and starting services..."
docker-compose up -d --build

echo ""
echo "Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker ps | grep -q agent-dashboard-ui; then
    echo ""
    echo "Agent Orchestrator Dashboard is running!"
    echo ""
    echo "Access the dashboard: http://localhost:8080"
    echo "API Documentation: http://localhost:8000/docs"
    echo ""
    echo "To stop: docker-compose down"
    echo "View logs: docker-compose logs -f"
else
    echo "Something went wrong. Check logs with: docker-compose logs"
    exit 1
fi
