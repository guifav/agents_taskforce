"""
Database models and connection
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Text, Enum
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://agentadmin:changeme@localhost:5432/agentdashboard")

# Convert to async URL if needed
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    ASYNC_DATABASE_URL = DATABASE_URL

Base = declarative_base()


class Agent(Base):
    """Agent definitions and status"""
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    skill = Column(String(100), nullable=False)
    description = Column(Text)
    model = Column(String(100))
    status = Column(String(20), default="idle")  # idle, busy, error, offline
    current_task = Column(Text)
    config = Column(JSON, default={})
    max_cost_per_job = Column(Float, default=0.5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active = Column(DateTime)


class Job(Base):
    """Job tracking"""
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, nullable=False)
    task = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    result = Column(Text)
    error = Column(Text)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    model_used = Column(String(100))
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class GitHubPR(Base):
    """GitHub Pull Requests cache"""
    __tablename__ = "github_prs"
    
    id = Column(Integer, primary_key=True)
    pr_id = Column(Integer, nullable=False)
    repo = Column(String(200), nullable=False)
    title = Column(String(500))
    author = Column(String(100))
    status = Column(String(20))  # open, closed, merged
    assigned_agent = Column(String(100))
    review_status = Column(String(20), default="pending")  # pending, in_progress, approved, rejected
    url = Column(String(500))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    fetched_at = Column(DateTime, default=datetime.utcnow)


class GitHubIssue(Base):
    """GitHub Issues cache"""
    __tablename__ = "github_issues"
    
    id = Column(Integer, primary_key=True)
    issue_id = Column(Integer, nullable=False)
    repo = Column(String(200), nullable=False)
    title = Column(String(500))
    author = Column(String(100))
    status = Column(String(20))  # open, closed
    labels = Column(JSON, default=[])
    assigned_agent = Column(String(100))
    url = Column(String(500))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    fetched_at = Column(DateTime, default=datetime.utcnow)


class TokenUsage(Base):
    """Token usage tracking"""
    __tablename__ = "token_usage"
    
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer)
    job_id = Column(Integer)
    model = Column(String(100))
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Workflow(Base):
    """Workflow definitions"""
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    steps = Column(JSON, default=[])  # [{agent, task, depends_on}]
    status = Column(String(20), default="inactive")  # inactive, active, running
    trigger = Column(String(50))  # manual, webhook, schedule
    created_at = Column(DateTime, default=datetime.utcnow)


# Database engine
engine = create_engine(DATABASE_URL)
async_engine = create_async_engine(ASYNC_DATABASE_URL)

# Session makers
SessionLocal = sessionmaker(bind=engine)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession)


async def init_db():
    """Initialize database tables"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
