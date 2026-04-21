"""
Metrics and cost tracking routes
"""
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/tokens")
async def get_token_usage(
    agent_id: Optional[int] = Query(None),
    model: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get token usage statistics"""
    return {
        "total_input_tokens": 125000,
        "total_output_tokens": 45000,
        "total_tokens": 170000,
        "by_model": [
            {"model": "moonshot/kimi-k2.5", "tokens": 150000, "percentage": 88},
            {"model": "claude-3-opus", "tokens": 20000, "percentage": 12}
        ],
        "by_agent": [
            {"agent_id": 1, "agent_name": "code-reviewer", "tokens": 80000},
            {"agent_id": 2, "agent_name": "qa-tester", "tokens": 50000},
            {"agent_id": 3, "agent_name": "github-guardian", "tokens": 40000}
        ]
    }


@router.get("/costs")
async def get_cost_metrics(
    period: str = Query("24h", description="Time period: 1h, 24h, 7d, 30d")
):
    """Get cost breakdown"""
    return {
        "period": period,
        "total_cost": 15.75,
        "currency": "USD",
        "by_model": [
            {"model": "moonshot/kimi-k2.5", "cost": 12.50, "percentage": 79},
            {"model": "claude-3-opus", "cost": 3.25, "percentage": 21}
        ],
        "by_agent": [
            {"agent_id": 1, "agent_name": "code-reviewer", "cost": 8.50, "jobs": 15},
            {"agent_id": 2, "agent_name": "qa-tester", "cost": 4.25, "jobs": 20},
            {"agent_id": 3, "agent_name": "github-guardian", "cost": 3.00, "jobs": 45}
        ],
        "trend": [
            {"date": (datetime.utcnow() - timedelta(days=i)).isoformat(), "cost": 2.5 - i*0.1}
            for i in range(7)
        ]
    }


@router.get("/models")
async def get_model_usage():
    """Get model usage statistics"""
    return {
        "models": [
            {
                "name": "moonshot/kimi-k2.5",
                "provider": "Moonshot",
                "total_requests": 450,
                "total_tokens": 150000,
                "avg_response_time_ms": 1200,
                "success_rate": 98.5,
                "cost_per_1k_tokens": 0.008
            },
            {
                "name": "claude-3-opus",
                "provider": "Anthropic",
                "total_requests": 50,
                "total_tokens": 20000,
                "avg_response_time_ms": 2500,
                "success_rate": 99.0,
                "cost_per_1k_tokens": 0.015
            }
        ]
    }


@router.get("/dashboard")
async def get_dashboard_metrics():
    """Get all dashboard metrics at once"""
    return {
        "active_agents": 3,
        "busy_agents": 1,
        "idle_agents": 2,
        "pending_jobs": 5,
        "running_jobs": 2,
        "completed_jobs_today": 45,
        "failed_jobs_today": 2,
        "open_prs": 6,
        "open_issues": 9,
        "today_cost": 2.75,
        "today_tokens": 32000,
        "avg_job_duration_seconds": 180
    }
