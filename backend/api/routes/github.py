"""
GitHub integration routes
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel

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


# Mock data - would come from GitHub API
MOCK_PRS = [
    {
        "id": 242,
        "repo": "guifav/virtuagency.ai",
        "title": "fix: Token Encryption with plaintext migration",
        "author": "claude-code",
        "status": "open",
        "assigned_agent": "code-reviewer",
        "review_status": "approved",
        "url": "https://github.com/guifav/virtuagency.ai/pull/242",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": 241,
        "repo": "guifav/virtuagency.ai",
        "title": "OAuth State Signing",
        "author": "developer",
        "status": "open",
        "assigned_agent": None,
        "review_status": "pending",
        "url": "https://github.com/guifav/virtuagency.ai/pull/241",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": 240,
        "repo": "guifav/virtuagency.ai",
        "title": "Firestore Tenant-Scoped",
        "author": "developer",
        "status": "open",
        "assigned_agent": None,
        "review_status": "pending",
        "url": "https://github.com/guifav/virtuagency.ai/pull/240",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

MOCK_ISSUES = [
    {
        "id": 1,
        "repo": "guifav/virtuagency.ai",
        "title": "Home page deve conter detalhes visuais em #ffbe00",
        "author": "guifav",
        "status": "open",
        "labels": ["ui", "priority-high"],
        "assigned_agent": None,
        "url": "https://github.com/guifav/virtuagency.ai/issues/1",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": 2,
        "repo": "guifav/virtuagency.ai",
        "title": "Renomear /knowledge-base para /branding",
        "author": "guifav",
        "status": "open",
        "labels": ["navigation"],
        "assigned_agent": None,
        "url": "https://github.com/guifav/virtuagency.ai/issues/2",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]


@router.get("/prs", response_model=List[PullRequest])
async def list_prs(
    repo: Optional[str] = Query(None, description="Filter by repository"),
    status: str = Query("open", description="PR status"),
    assigned: Optional[bool] = Query(None, description="Filter by assignment status")
):
    """List open pull requests"""
    prs = MOCK_PRS
    
    if repo:
        prs = [p for p in prs if p["repo"] == repo]
    if status:
        prs = [p for p in prs if p["status"] == status]
    if assigned is not None:
        prs = [p for p in prs if (p["assigned_agent"] is not None) == assigned]
    
    return prs


@router.get("/prs/{pr_id}")
async def get_pr(pr_id: int, repo: str = Query(..., description="Repository name")):
    """Get specific PR details"""
    pr = next((p for p in MOCK_PRS if p["id"] == pr_id and p["repo"] == repo), None)
    if not pr:
        return {"error": "PR not found"}
    return pr


@router.post("/prs/{pr_id}/assign")
async def assign_pr(pr_id: int, agent: str, repo: str = Query(...)):
    """Assign PR to an agent"""
    return {
        "status": "assigned",
        "pr_id": pr_id,
        "repo": repo,
        "agent": agent,
        "message": f"PR #{pr_id} assigned to {agent}"
    }


@router.get("/issues", response_model=List[Issue])
async def list_issues(
    repo: Optional[str] = Query(None),
    status: str = Query("open"),
    label: Optional[str] = Query(None)
):
    """List open issues"""
    issues = MOCK_ISSUES
    
    if repo:
        issues = [i for i in issues if i["repo"] == repo]
    if status:
        issues = [i for i in issues if i["status"] == status]
    if label:
        issues = [i for i in issues if label in i["labels"]]
    
    return issues


@router.get("/repos")
async def list_repos():
    """List configured repositories"""
    return {
        "repos": [
            {
                "name": "guifav/virtuagency.ai",
                "open_prs": 6,
                "open_issues": 9,
                "last_sync": datetime.utcnow().isoformat()
            },
            {
                "name": "guifav/sync",
                "open_prs": 0,
                "open_issues": 0,
                "last_sync": datetime.utcnow().isoformat()
            }
        ]
    }


@router.post("/sync")
async def sync_github():
    """Manually trigger GitHub sync"""
    return {
        "status": "syncing",
        "message": "GitHub sync started",
        "sync_id": "sync_12345"
    }
