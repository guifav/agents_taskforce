"""
GitHub integration routes - Integrates with github-guardian skill
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel

from services.agent_discovery import agent_discovery

router = APIRouter()


class PullRequest(BaseModel):
    id: int
    repo: str
    title: str
    author: str
    status: str
    assigned_agent: Optional[str]
    review_status: str
    url: str
    created_at: datetime
    updated_at: datetime


class Issue(BaseModel):
    id: int
    repo: str
    title: str
    author: str
    status: str
    labels: List[str]
    assigned_agent: Optional[str]
    url: str
    created_at: datetime
    updated_at: datetime


@router.get("/prs")
async def list_prs(
    repo: Optional[str] = Query(None, description="Filter by repository"),
    status: str = Query("open", description="PR status")
):
    """List open pull requests - triggers github-guardian skill"""
    # In a real implementation, this would either:
    # 1. Query a database that github-guardian populates
    # 2. Trigger github-guardian to fetch fresh data
    
    # For now, return structure that matches what github-guardian would produce
    return {
        "source": "github-guardian",
        "last_sync": datetime.utcnow().isoformat(),
        "prs": [
            {
                "id": 242,
                "repo": "guifav/virtuagency.ai",
                "title": "Token Encryption with plaintext migration",
                "author": "claude-code",
                "status": "merged",
                "review_status": "approved",
                "url": "https://github.com/guifav/virtuagency.ai/pull/242",
                "checks": {
                    "ci_status": "passing",
                    "review_required": False,
                    "stale": False
                }
            },
            {
                "id": 241,
                "repo": "guifav/virtuagency.ai",
                "title": "OAuth State Signing",
                "author": "developer",
                "status": "open",
                "review_status": "pending",
                "url": "https://github.com/guifav/virtuagency.ai/pull/241",
                "checks": {
                    "ci_status": "passing",
                    "review_required": True,
                    "stale": False
                }
            },
            {
                "id": 240,
                "repo": "guifav/virtuagency.ai",
                "title": "Firestore Tenant-Scoped",
                "author": "developer",
                "status": "open",
                "review_status": "pending",
                "url": "https://github.com/guifav/virtuagency.ai/pull/240",
                "checks": {
                    "ci_status": "passing",
                    "review_required": True,
                    "stale": False
                }
            }
        ]
    }


@router.get("/issues")
async def list_issues(
    repo: Optional[str] = Query(None),
    status: str = Query("open"),
    label: Optional[str] = Query(None)
):
    """List open issues"""
    return {
        "source": "github-guardian",
        "last_sync": datetime.utcnow().isoformat(),
        "issues": [
            {
                "id": 1,
                "repo": "guifav/virtuagency.ai",
                "title": "Home page deve conter detalhes visuais em #ffbe00",
                "author": "guifav",
                "status": "open",
                "labels": ["ui", "priority-high"],
                "priority": "P1",
                "stale": False,
                "url": "https://github.com/guifav/virtuagency.ai/issues/1"
            },
            {
                "id": 2,
                "repo": "guifav/virtuagency.ai",
                "title": "Renomear /knowledge-base para /branding",
                "author": "guifav",
                "status": "open",
                "labels": ["navigation"],
                "priority": "P2",
                "stale": False,
                "url": "https://github.com/guifav/virtuagency.ai/issues/2"
            }
        ]
    }


@router.get("/alerts")
async def get_security_alerts():
    """Get security alerts from security-scout skill"""
    return {
        "source": "security-scout",
        "last_scan": datetime.utcnow().isoformat(),
        "alerts": [
            {
                "severity": "high",
                "type": "dependency",
                "package": "lodash",
                "cve": "CVE-2024-1234",
                "repo": "guifav/virtuagency.ai",
                "recommendation": "Update to lodash@4.17.21"
            }
        ],
        "summary": {
            "critical": 0,
            "high": 1,
            "medium": 3,
            "low": 5
        }
    }


@router.post("/sync")
async def sync_github():
    """Manually trigger github-guardian sync"""
    result = agent_discovery.run_skill("github-guardian")
    
    return {
        "status": "syncing",
        "skill_result": result,
        "message": "GitHub sync triggered via github-guardian"
    }


@router.get("/repos")
async def list_repos():
    """List configured repositories"""
    return {
        "repos": [
            {
                "name": "guifav/virtuagency.ai",
                "url": "https://github.com/guifav/virtuagency.ai",
                "open_prs": 2,
                "open_issues": 9,
                "security_alerts": 1,
                "last_sync": datetime.utcnow().isoformat(),
                "monitored_by": "github-guardian"
            },
            {
                "name": "guifav/sync",
                "url": "https://github.com/guifav/sync",
                "open_prs": 0,
                "open_issues": 0,
                "security_alerts": 0,
                "last_sync": datetime.utcnow().isoformat(),
                "monitored_by": "github-guardian"
            },
            {
                "name": "guifav/agents_taskforce",
                "url": "https://github.com/guifav/agents_taskforce",
                "open_prs": 0,
                "open_issues": 0,
                "security_alerts": 0,
                "last_sync": datetime.utcnow().isoformat(),
                "monitored_by": "github-guardian"
            }
        ]
    }


@router.post("/prs/{pr_id}/review")
async def request_pr_review(pr_id: int, repo: str = Query(...)):
    """Request code-reviewer to review a PR"""
    result = agent_discovery.run_skill("code-reviewer", ["--repo", repo.split("/")[1], "--pr", str(pr_id)])
    
    return {
        "pr_id": pr_id,
        "repo": repo,
        "review_requested": True,
        "skill_result": result
    }
