"""
Agent management routes
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


class Agent(BaseModel):
    id: int
    name: str
    skill: str
    description: Optional[str]
    model: Optional[str]
    status: str
    current_task: Optional[str]
    max_cost_per_job: float
    created_at: datetime
    last_active: Optional[datetime]
    
    class Config:
        from_attributes = True


class AgentCreate(BaseModel):
    name: str
    skill: str
    description: Optional[str] = None
    model: Optional[str] = "moonshot/kimi-k2.5"
    max_cost_per_job: float = 0.5


# Mock data - replace with database queries
MOCK_AGENTS = [
    {
        "id": 1,
        "name": "code-reviewer",
        "skill": "code-reviewer",
        "description": "Reviews code using Codex",
        "model": "moonshot/kimi-k2.5",
        "status": "idle",
        "current_task": None,
        "max_cost_per_job": 0.5,
        "created_at": datetime.utcnow(),
        "last_active": None
    },
    {
        "id": 2,
        "name": "qa-tester",
        "skill": "qa-tester",
        "description": "Runs automated tests",
        "model": "moonshot/kimi-k2.5",
        "status": "idle",
        "current_task": None,
        "max_cost_per_job": 0.3,
        "created_at": datetime.utcnow(),
        "last_active": None
    },
    {
        "id": 3,
        "name": "github-guardian",
        "skill": "github-guardian",
        "description": "Monitors GitHub repos",
        "model": "moonshot/kimi-k2.5",
        "status": "busy",
        "current_task": "Checking PRs in guifav/virtuagency.ai",
        "max_cost_per_job": 0.1,
        "created_at": datetime.utcnow(),
        "last_active": datetime.utcnow()
    }
]


@router.get("", response_model=List[Agent])
async def list_agents(
    status: Optional[str] = Query(None, description="Filter by status"),
    skill: Optional[str] = Query(None, description="Filter by skill")
):
    """List all registered agents"""
    agents = MOCK_AGENTS
    
    if status:
        agents = [a for a in agents if a["status"] == status]
    if skill:
        agents = [a for a in agents if a["skill"] == skill]
    
    return agents


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: int):
    """Get specific agent details"""
    agent = next((a for a in MOCK_AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("/{agent_id}/status")
async def get_agent_status(agent_id: int):
    """Get real-time agent status"""
    agent = next((a for a in MOCK_AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {
        "agent_id": agent_id,
        "status": agent["status"],
        "current_task": agent["current_task"],
        "last_active": agent["last_active"],
        "uptime_seconds": 3600 if agent["status"] != "offline" else 0
    }


@router.get("/{agent_id}/logs")
async def get_agent_logs(agent_id: int, limit: int = 50):
    """Get agent execution logs"""
    # Mock logs - would query from database or file system
    return {
        "agent_id": agent_id,
        "logs": [
            {"timestamp": datetime.utcnow().isoformat(), "level": "INFO", "message": "Agent started"},
            {"timestamp": datetime.utcnow().isoformat(), "level": "INFO", "message": "Task completed successfully"}
        ][:limit]
    }


@router.post("/{agent_id}/spawn")
async def spawn_agent(agent_id: int, task: str):
    """Manually spawn an agent with a task"""
    agent = next((a for a in MOCK_AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # This would trigger the actual agent spawn via OpenClaw
    return {
        "status": "spawned",
        "agent_id": agent_id,
        "task": task,
        "job_id": 12345,
        "message": f"Agent {agent['name']} spawned with task"
    }


@router.post("/{agent_id}/stop")
async def stop_agent(agent_id: int):
    """Stop a running agent"""
    agent = next((a for a in MOCK_AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {
        "status": "stopped",
        "agent_id": agent_id,
        "message": f"Agent {agent['name']} stopped"
    }


@router.get("/{agent_id}/metrics")
async def get_agent_metrics(agent_id: int):
    """Get agent performance metrics"""
    return {
        "agent_id": agent_id,
        "total_jobs": 42,
        "successful_jobs": 38,
        "failed_jobs": 4,
        "total_tokens": 125000,
        "total_cost": 12.50,
        "avg_job_duration_seconds": 180
    }
