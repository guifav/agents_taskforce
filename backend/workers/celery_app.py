"""
Celery configuration for background tasks
"""
import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "agent_dashboard",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "sync-github": {
            "task": "workers.tasks.sync_github",
            "schedule": 600.0,  # 10 minutes
        },
        "check-agent-health": {
            "task": "workers.tasks.check_agent_health",
            "schedule": 60.0,  # 1 minute
        },
    }
)
