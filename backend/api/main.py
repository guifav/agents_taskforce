"""
Agent Orchestrator Dashboard - Main API
"""
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import agents, github, metrics, workflows
from api.websocket.manager import ConnectionManager
from models.database import init_db
from workers.celery_app import celery_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    await init_db()
    print(f"🚀 Agent Dashboard started at {datetime.utcnow()}")
    yield
    # Shutdown
    print(f"🛑 Agent Dashboard stopped at {datetime.utcnow()}")


app = FastAPI(
    title="Agent Orchestrator Dashboard",
    description="Real-time monitoring and management for OpenClaw agent teams",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(github.router, prefix="/api/github", tags=["github"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])

# WebSocket manager
manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time updates via WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_text()
            await manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0"
    }


@app.get("/api/dashboard")
async def dashboard_overview():
    """Main dashboard data"""
    return {
        "active_agents": 0,
        "pending_jobs": 0,
        "open_prs": 0,
        "open_issues": 0,
        "today_cost": 0.0,
        "today_tokens": 0
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
