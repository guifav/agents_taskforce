"""
Agent management routes - Uses real OpenClaw skills
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from services.agent_discovery import agent_discovery
from services.cron_manager import cron_manager

router = APIRouter()


class Agent(BaseModel):
    id: str
    name: str
    description: str
    emoji: Optional[str] = None
    requires: dict
    has_config: bool
    last_modified: str
    status: str = "idle"
    
    class Config:
        from_attributes = True


class AgentRunRequest(BaseModel):
    args: Optional[List[str]] = []


class AgentRunResponse(BaseModel):
    success: bool
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    error: Optional[str] = None
    timestamp: str


@router.get("", response_model=List[Agent])
async def list_agents():
    """List all OpenClaw skills/agents"""
    skills = agent_discovery.list_skills()
    
    # Get cron status for each
    cron_jobs = {job['skill']: job for job in cron_manager.list_jobs()}
    
    agents = []
    for skill in skills:
        # Determine status based on cron job
        cron_job = cron_jobs.get(skill['id'])
        if cron_job:
            status = cron_job.get('status', 'idle')
        else:
            status = 'idle'
            
        agents.append({
            **skill,
            'status': status
        })
    
    return agents


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """Get specific agent details"""
    skill = agent_discovery.get_skill(agent_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get cron info
    cron_jobs = cron_manager.list_jobs()
    cron_job = next((j for j in cron_jobs if j['skill'] == agent_id), None)
    
    if cron_job:
        skill['status'] = cron_job.get('status', 'idle')
    else:
        skill['status'] = 'idle'
    
    return skill


@router.get("/{agent_id}/config")
async def get_agent_config(agent_id: str):
    """Get agent configuration"""
    config = agent_discovery.get_skill_config(agent_id)
    if config is None:
        return {"config": None, "message": "No config file found"}
    return {"config": config}


@router.post("/{agent_id}/config")
async def update_agent_config(agent_id: str, config: dict):
    """Update agent configuration"""
    success = agent_discovery.update_skill_config(agent_id, config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update config")
    return {"success": True, "message": "Configuration updated"}


@router.post("/{agent_id}/run", response_model=AgentRunResponse)
async def run_agent(agent_id: str, request: AgentRunRequest = None):
    """Execute an agent/skill"""
    skill = agent_discovery.get_skill(agent_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    args = request.args if request else []
    result = agent_discovery.run_skill(agent_id, args)
    
    return result


@router.get("/{agent_id}/status")
async def get_agent_status(agent_id: str):
    """Get real-time agent status"""
    skill = agent_discovery.get_skill(agent_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if there's a cron job for this agent
    cron_jobs = cron_manager.list_jobs()
    cron_job = next((j for j in cron_jobs if j['skill'] == agent_id), None)
    
    return {
        'agent_id': agent_id,
        'name': skill['name'],
        'status': cron_job.get('status', 'idle') if cron_job else 'idle',
        'has_cron_job': cron_job is not None,
        'cron_schedule': cron_job.get('schedule') if cron_job else None,
        'last_modified': skill['last_modified'],
        'config_exists': skill['has_config']
    }


@router.post("/{agent_id}/schedule")
async def schedule_agent(
    agent_id: str, 
    schedule: str = Query(..., description="Cron expression (e.g., '*/10 * * * *')")
):
    """Schedule an agent to run periodically"""
    skill = agent_discovery.get_skill(agent_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    result = cron_manager.add_job(
        name=agent_id,
        schedule=schedule,
        skill=agent_id
    )
    
    if result['success']:
        return {
            'success': True,
            'message': f'Agent {agent_id} scheduled with cron: {schedule}',
            'schedule': schedule
        }
    else:
        raise HTTPException(status_code=500, detail=result['message'])


@router.delete("/{agent_id}/schedule")
async def unschedule_agent(agent_id: str):
    """Remove agent from schedule"""
    result = cron_manager.remove_job(agent_id)
    
    if result['success']:
        return {
            'success': True,
            'message': f'Schedule removed for agent {agent_id}'
        }
    else:
        raise HTTPException(status_code=500, detail=result['message'])


@router.get("/{agent_id}/logs")
async def get_agent_logs(agent_id: str, lines: int = 50):
    """Get agent execution logs"""
    # In a real implementation, this would read from log files
    # For now, return mock logs
    return {
        'agent_id': agent_id,
        'lines': lines,
        'logs': [
            {'timestamp': datetime.utcnow().isoformat(), 'level': 'INFO', 'message': 'Agent initialized'},
            {'timestamp': datetime.utcnow().isoformat(), 'level': 'INFO', 'message': 'Ready to execute'}
        ]
    }
