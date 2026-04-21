#!/bin/bash
# Start both backend and frontend locally (completely without Docker)

echo "Starting Agent Dashboard in FULL local mode..."
echo ""

# Start database services in Docker
echo "Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

echo "Waiting for services..."
sleep 5

# Start backend in background
echo "Starting backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt

# Start backend in background
uvicorn api.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "Waiting for backend..."
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start React dev server with proxy to backend
REACT_APP_API_URL=http://localhost:8000 npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "Agent Dashboard started in LOCAL MODE!"
echo "=========================================="
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8000"
echo "Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both services"
echo "=========================================="
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
