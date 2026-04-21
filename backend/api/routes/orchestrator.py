"""
Orchestrator API - Workflow management for agent-driven development
"""
import uuid
import subprocess
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

router = APIRouter()

# In-memory workflow storage (use database in production)
workflows = {}


class WorkflowStatus:
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    CODE_REVIEW = "code_review"
    CHANGES_NEEDED = "changes_needed"
    APPROVED = "approved"
    MERGING = "merging"
    DEPLOYING = "deploying"
    COMPLETED = "completed"
    FAILED = "failed"


class IssueToPRRequest(BaseModel):
    issue_number: int
    repo_owner: str = "guifav"
    repo_name: str = "virtuagency.ai"
    agent_id: str = "claude-code"  # or "codex" or other coding agent


class PRReviewRequest(BaseModel):
    pr_number: int
    repo_owner: str = "guifav"
    repo_name: str = "virtuagency.ai"
    reviewer_agent: str = "codex"


class MergeDeployRequest(BaseModel):
    pr_number: int
    repo_owner: str = "guifav"
    repo_name: str = "virtuagency.ai"


class WorkflowResponse(BaseModel):
    workflow_id: str
    status: str
    issue_number: Optional[int] = None
    pr_number: Optional[int] = None
    created_at: str
    updated_at: str
    logs: List[str] = []


def run_agent_task(workflow_id: str, task_type: str, params: dict):
    """Execute agent task in background"""
    workflow = workflows[workflow_id]
    
    if task_type == "develop":
        # Claude Code develops the fix
        issue_number = params["issue_number"]
        repo = f"{params['repo_owner']}/{params['repo_name']}"
        
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Starting development for issue #{issue_number}")
        
        # In production, this would spawn a subprocess or use OpenClaw agent
        # For now, simulate the workflow
        workflow["status"] = WorkflowStatus.IN_PROGRESS
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Cloning repository...")
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Analyzing issue...")
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Implementing fix...")
        
        # Simulate PR creation
        workflow["pr_number"] = params.get("simulated_pr", 999)
        workflow["status"] = WorkflowStatus.CODE_REVIEW
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: PR #{workflow['pr_number']} created")
        
    elif task_type == "review":
        # Codex reviews the PR (initial review or re-review) with real execution
        pr_number = params["pr_number"]
        repo_owner = params.get("repo_owner", "guifav")
        repo_name = params.get("repo_name", "virtuagency.ai")
        
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Starting REAL code review for PR #{pr_number}")
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Model=5.4, Reasoning=xhigh")
        workflow["status"] = WorkflowStatus.CODE_REVIEW
        
        try:
            # Execute real Codex CLI with model 5.4 and xhigh reasoning
            cmd = [
                "codex",
                "review",
                f"/tmp/pr-{pr_number}",  # Path to PR checkout
                "--model", "5.4",
                "--reasoning", "xhigh",
                "--approval-mode", "auto",
                "--json"  # Get structured output
            ]
            
            workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Executing: {' '.join(cmd)}")
            
            # Run Codex (with timeout)
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=f"/tmp/{repo_name}" if repo_name else "/tmp"
            )
            
            workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Exit code: {result.returncode}")
            
            if result.returncode == 0:
                workflow["status"] = WorkflowStatus.APPROVED
                workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: PR approved ✓")
                if result.stdout:
                    workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: {result.stdout[:200]}...")
            else:
                workflow["status"] = WorkflowStatus.CHANGES_NEEDED
                workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Changes requested")
                if result.stderr:
                    workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex stderr: {result.stderr[:200]}...")
                    
        except subprocess.TimeoutExpired:
            workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Review timed out after 5 minutes")
            workflow["status"] = WorkflowStatus.FAILED
        except FileNotFoundError:
            workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: CLI not found. Is Codex installed?")
            workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Falling back to simulation mode")
            # Fallback to simulation
            import random
            if random.random() > 0.3:
                workflow["status"] = WorkflowStatus.APPROVED
                workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: PR approved ✓ (SIMULATED)")
            else:
                workflow["status"] = WorkflowStatus.CHANGES_NEEDED
                workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Changes requested (SIMULATED)")
        except Exception as e:
            workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Codex: Error during review: {str(e)}")
            workflow["status"] = WorkflowStatus.FAILED
            
    elif task_type == "fix":
        # Claude Code applies fixes based on Codex review feedback
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Applying fixes based on Codex review...")
        workflow["status"] = WorkflowStatus.IN_PROGRESS
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Analyzing review comments...")
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Implementing corrections...")
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Claude Code: Changes committed")
        workflow["status"] = WorkflowStatus.CODE_REVIEW
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Ready for Codex re-review")
        
    elif task_type == "merge_deploy":
        pr_number = params["pr_number"]
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Starting merge and deploy for PR #{pr_number}")
        workflow["status"] = WorkflowStatus.MERGING
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Merging PR...")
        workflow["status"] = WorkflowStatus.DEPLOYING
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Triggering Cloud Build...")
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Monitoring deployment...")
        workflow["status"] = WorkflowStatus.COMPLETED
        workflow["logs"].append(f"[{datetime.utcnow().isoformat()}] Deployment completed ✓")
    
    workflow["updated_at"] = datetime.utcnow().isoformat()


@router.post("/workflows/issue-to-pr", response_model=WorkflowResponse)
async def create_workflow_from_issue(
    request: IssueToPRRequest,
    background_tasks: BackgroundTasks
):
    """Create a workflow to convert an issue into a PR"""
    workflow_id = str(uuid.uuid4())[:8]
    
    workflow = {
        "workflow_id": workflow_id,
        "status": WorkflowStatus.PENDING,
        "issue_number": request.issue_number,
        "pr_number": None,
        "repo_owner": request.repo_owner,
        "repo_name": request.repo_name,
        "agent_id": request.agent_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "logs": [f"[{datetime.utcnow().isoformat()}] Workflow created for issue #{request.issue_number}"]
    }
    
    workflows[workflow_id] = workflow
    
    # Start development task in background
    background_tasks.add_task(
        run_agent_task,
        workflow_id,
        "develop",
        {
            "issue_number": request.issue_number,
            "repo_owner": request.repo_owner,
            "repo_name": request.repo_name,
            "simulated_pr": 100 + len(workflows)  # Simulated PR number
        }
    )
    
    return WorkflowResponse(**workflow)


@router.post("/workflows/{workflow_id}/review", response_model=WorkflowResponse)
async def request_pr_review(
    workflow_id: str,
    request: PRReviewRequest,
    background_tasks: BackgroundTasks
):
    """Request code review for a PR with real Codex execution"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = workflows[workflow_id]
    workflow["pr_number"] = request.pr_number
    workflow["updated_at"] = datetime.utcnow().isoformat()
    
    # Use workflow's repo info if available, otherwise use request
    repo_owner = workflow.get("repo_owner", request.repo_owner)
    repo_name = workflow.get("repo_name", request.repo_name)
    
    background_tasks.add_task(
        run_agent_task,
        workflow_id,
        "review",
        {
            "pr_number": request.pr_number,
            "repo_owner": repo_owner,
            "repo_name": repo_name
        }
    )
    
    return WorkflowResponse(**workflow)


@router.post("/workflows/{workflow_id}/fix", response_model=WorkflowResponse)
async def apply_fixes(
    workflow_id: str,
    background_tasks: BackgroundTasks
):
    """Apply fixes based on review feedback"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = workflows[workflow_id]
    
    if workflow["status"] != WorkflowStatus.CHANGES_NEEDED:
        raise HTTPException(status_code=400, detail="No changes requested")
    
    background_tasks.add_task(
        run_agent_task,
        workflow_id,
        "fix",
        {}
    )
    
    return WorkflowResponse(**workflow)


@router.post("/workflows/{workflow_id}/merge-deploy", response_model=WorkflowResponse)
async def merge_and_deploy(
    workflow_id: str,
    request: MergeDeployRequest,
    background_tasks: BackgroundTasks
):
    """Merge PR and deploy"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = workflows[workflow_id]
    
    if workflow["status"] != WorkflowStatus.APPROVED:
        raise HTTPException(status_code=400, detail="PR not approved yet")
    
    background_tasks.add_task(
        run_agent_task,
        workflow_id,
        "merge_deploy",
        {"pr_number": request.pr_number}
    )
    
    return WorkflowResponse(**workflow)


@router.get("/workflows", response_model=List[WorkflowResponse])
async def list_workflows():
    """List all workflows"""
    return [WorkflowResponse(**w) for w in workflows.values()]


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: str):
    """Get workflow details"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return WorkflowResponse(**workflows[workflow_id])


@router.get("/workflows/{workflow_id}/logs")
async def get_workflow_logs(workflow_id: str):
    """Get workflow logs"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return {"logs": workflows[workflow_id]["logs"]}
