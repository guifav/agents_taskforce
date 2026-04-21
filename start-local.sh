#!/bin/bash
# Start Agent Dashboard locally (without Docker)
# This allows access to OpenClaw CLI

echo "Starting Agent Dashboard in local mode..."
echo ""

# Check if PostgreSQL is running via Docker
if ! docker ps | grep -q agent-dashboard-db; then
    echo "Starting PostgreSQL and Redis containers..."
    docker-compose up -d postgres redis
    echo "Waiting for database to be ready..."
    sleep 5
fi

# Check Redis
if ! docker ps | grep -q agent-dashboard-redis; then
    echo "Redis not running. Starting..."
    docker-compose up -d redis
fi

# Change to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Run migrations (if needed)
echo "Running database migrations..."
# alembic upgrade head (optional)

# Start the API
echo ""
echo "=========================================="
echo "Agent Dashboard started!"
echo "=========================================="
echo "API: http://localhost:8000"
echo "Docs: http://localhost:8000/docs"
echo ""
echo "Frontend (if running in Docker): http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="
echo ""

uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
