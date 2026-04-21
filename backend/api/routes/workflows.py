"""
Workflow management routes
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class WorkflowStep(BaseModel):
    id: str
    agent: str
    task: str
    depends_on: Optional[List[str]] = []


class Workflow(BaseModel):
    id: int
    name: str
    description: str
    steps: List[WorkflowStep]
    status: str
    trigger: str
    created_at: datetime


# Mock workflows
MOCK_WORKFLOWS = [
    {
        "id": 1,
        "name": "PR Review Pipeline",
        "description": "Complete PR review, fix, test and deploy workflow",
        "steps": [
            {"id": "review", "agent": "code-reviewer", "task": "Review PR", "depends_on": []},
            {"id": "fix", "agent": "coding-agent", "task": "Fix issues", "depends_on": ["review"]},
            {"id": "test", "agent": "qa-tester", "task": "Run tests", "depends_on": ["fix"]},
            {"id": "deploy", "agent": "gcp-fullstack", "task": "Deploy", "depends_on": ["test"]}
        ],
        "status": "active",
        "trigger": "manual",
        "created_at": datetime.utcnow()
    },
    {
        "id": 2,
        "name": "GitHub Monitoring",
        "description": "Monitor GitHub for new PRs and issues",
        "steps": [
            {"id": "monitor", "agent": "github-guardian", "task": "Check repos", "depends_on": []}
        ],
        "status": "active",
        "trigger": "schedule",
        "created_at": datetime.utcnow()
    }
]


@router.get("", response_model=List[Workflow])
async def list_workflows():
    """List all workflows"""
    return MOCK_WORKFLOWS


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: int):
    """Get workflow details"""
    workflow = next((w for w in MOCK_WORKFLOWS if w["id"] == workflow_id), None)
    if not workflow:
        return {"error": "Workflow not found"}
    return workflow


@router.post("/{workflow_id}/run")
async def run_workflow(workflow_id: int):
    """Manually trigger a workflow"""
    workflow = next((w for w in MOCK_WORKFLOWS if w["id"] == workflow_id), None)
    if not workflow:
        return {"error": "Workflow not found"}
    
    return {
        "status": "started",
        "workflow_id": workflow_id,
        "workflow_name": workflow["name"],
        "run_id": "run_12345",
        "message": f"Workflow '{workflow['name']}' started"
    }


@router.get("/runs/active")
async def get_active_runs():
    """Get currently running workflows"""
    return {
        "runs": [
            {
                "run_id": "run_12345",
                "workflow_id": 1,
                "workflow_name": "PR Review Pipeline",
                "status": "running",
                "current_step": "review",
                "progress": 25,
                "started_at": datetime.utcnow().isoformat(),
                "estimated_completion": (datetime.utcnow()).isoformat()
            }
        ]
    }


@router.get("/visualization/{workflow_id}")
async def get_workflow_visualization(workflow_id: int):
    """Get workflow data for visualization"""
    workflow = next((w for w in MOCK_WORKFLOWS if w["id"] == workflow_id), None)
    if not workflow:
        return {"error": "Workflow not found"}
    
    return {
        "workflow_id": workflow_id,
        "name": workflow["name"],
        "nodes": [
            {
                "id": step["id"],
                "type": "agent",
                "data": {
                    "label": step["agent"],
                    "task": step["task"]
                },
                "position": {"x": i * 250, "y": 100}
            }
            for i, step in enumerate(workflow["steps"])
        ],
        "edges": [
            {
                "id": f"{dep}-{step['id']}",
                "source": dep,
                "target": step["id"]
            }
            for step in workflow["steps"]
            for dep in step.get("depends_on", [])
        ]
    }
