import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GitBranch, 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ChevronRight,
  Terminal,
  Loader2,
  AlertCircle,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const fetchWorkflows = async () => {
  const res = await fetch('/api/orchestrator/workflows');
  return res.json();
};

const fetchGitHubIssues = async () => {
  const res = await fetch('/api/github/issues?owner=guifav&repo=virtuagency.ai');
  return res.json();
};

const fetchGitHubPRs = async () => {
  const res = await fetch('/api/github/prs?owner=guifav&repo=virtuagency.ai');
  return res.json();
};

const WorkflowCard = ({ workflow, onReview, onFix, onMerge }) => {
  const statusColors = {
    pending: 'secondary',
    in_progress: 'warning',
    code_review: 'warning',
    changes_needed: 'destructive',
    approved: 'default',
    merging: 'warning',
    deploying: 'warning',
    completed: 'default',
    failed: 'destructive'
  };

  const statusIcons = {
    pending: <Loader2 className="w-4 h-4 animate-spin" />,
    in_progress: <Loader2 className="w-4 h-4 animate-spin" />,
    code_review: <GitBranch className="w-4 h-4" />,
    changes_needed: <AlertCircle className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    merging: <Loader2 className="w-4 h-4 animate-spin" />,
    deploying: <Rocket className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={statusColors[workflow.status] || 'secondary'}>
              <span className="flex items-center gap-1">
                {statusIcons[workflow.status]}
                {workflow.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </Badge>
            <span className="text-sm text-neutral-500">ID: {workflow.workflow_id}</span>
          </div>
          <span className="text-xs text-neutral-500">
            {new Date(workflow.created_at).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflow.issue_number && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500">Issue:</span>
              <span className="font-medium">#{workflow.issue_number}</span>
            </div>
          )}
          {workflow.pr_number && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500">PR:</span>
              <span className="font-medium">#{workflow.pr_number}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {workflow.status === 'code_review' && (
              <Button size="sm" onClick={() => onReview(workflow)}>
                <GitBranch className="w-4 h-4 mr-1" />
                Codex Review
              </Button>
            )}
            {workflow.status === 'changes_needed' && (
              <Button size="sm" variant="outline" onClick={() => onFix(workflow)}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Claude Fix
              </Button>
            )}
            {workflow.status === 'approved' && (
              <Button size="sm" variant="default" onClick={() => onMerge(workflow)}>
                <Rocket className="w-4 h-4 mr-1" />
                Merge & Deploy
              </Button>
            )}
          </div>

          {/* Logs */}
          {workflow.logs && workflow.logs.length > 0 && (
            <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2 mb-2 text-xs text-neutral-500">
                <Terminal className="w-3 h-3" />
                Logs
              </div>
              <div className="text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
                {workflow.logs.slice(-5).map((log, idx) => (
                  <div key={idx} className="text-neutral-400">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const IssueCard = ({ issue, onStartWorkflow }) => {
  return (
    <Card className="mb-3 hover:border-[#ffbe00]/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-neutral-500">#{issue.number}</span>
              <h4 className="font-medium">{issue.title}</h4>
            </div>
            <p className="text-sm text-neutral-500 line-clamp-2">{issue.body || 'No description'}</p>
            <div className="flex items-center gap-2 mt-2">
              {issue.labels?.map((label, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-neutral-800 rounded-full">
                  {label.name}
                </span>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={() => onStartWorkflow(issue)}>
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function Orchestrator() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('issues');

  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: fetchWorkflows,
    refetchInterval: 5000
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['github-issues'],
    queryFn: fetchGitHubIssues
  });

  const { data: prs, isLoading: prsLoading } = useQuery({
    queryKey: ['github-prs'],
    queryFn: fetchGitHubPRs
  });

  const startWorkflowMutation = useMutation({
    mutationFn: async (issue) => {
      const res = await fetch('/api/orchestrator/workflows/issue-to-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_number: issue.number,
          repo_owner: 'guifav',
          repo_name: 'virtuagency.ai',
          agent_id: 'claude-code'
        })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      setSelectedTab('workflows');
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (workflow) => {
      const res = await fetch(`/api/orchestrator/workflows/${workflow.workflow_id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pr_number: workflow.pr_number,
          reviewer_agent: 'codex'
        })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(['workflows'])
  });

  const fixMutation = useMutation({
    mutationFn: async (workflow) => {
      const res = await fetch(`/api/orchestrator/workflows/${workflow.workflow_id}/fix`, {
        method: 'POST'
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(['workflows'])
  });

  const mergeMutation = useMutation({
    mutationFn: async (workflow) => {
      const res = await fetch(`/api/orchestrator/workflows/${workflow.workflow_id}/merge-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_number: workflow.pr_number })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(['workflows'])
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orchestrator</h1>
          <p className="text-neutral-500 mt-2">Automated development workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default">
            <Rocket className="w-4 h-4 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-neutral-800">
        <button
          onClick={() => setSelectedTab('issues')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            selectedTab === 'issues' 
              ? 'text-[#ffbe00] border-b-2 border-[#ffbe00]' 
              : 'text-neutral-500 hover:text-white'
          }`}
        >
          GitHub Issues ({issues?.length || 0})
        </button>
        <button
          onClick={() => setSelectedTab('workflows')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            selectedTab === 'workflows' 
              ? 'text-[#ffbe00] border-b-2 border-[#ffbe00]' 
              : 'text-neutral-500 hover:text-white'
          }`}
        >
          Active Workflows ({workflows?.length || 0})
        </button>
        <button
          onClick={() => setSelectedTab('prs')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            selectedTab === 'prs' 
              ? 'text-[#ffbe00] border-b-2 border-[#ffbe00]' 
              : 'text-neutral-500 hover:text-white'
          }`}
        >
          Pull Requests ({prs?.length || 0})
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'issues' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Issues</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Click "Start" to create a development workflow for any issue.
          </p>
          {issuesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
            </div>
          ) : issues?.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No open issues found</p>
          ) : (
            issues?.map(issue => (
              <IssueCard 
                key={issue.number} 
                issue={issue} 
                onStartWorkflow={(issue) => startWorkflowMutation.mutate(issue)}
              />
            ))
          )}
        </div>
      )}

      {selectedTab === 'workflows' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Workflows</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Track development workflows from issue to deployment.
          </p>
          {workflowsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
            </div>
          ) : workflows?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 mb-4">No active workflows</p>
              <Button onClick={() => setSelectedTab('issues')}>
                <Play className="w-4 h-4 mr-2" />
                Start from an Issue
              </Button>
            </div>
          ) : (
            workflows?.map(workflow => (
              <WorkflowCard
                key={workflow.workflow_id}
                workflow={workflow}
                onReview={(w) => reviewMutation.mutate(w)}
                onFix={(w) => fixMutation.mutate(w)}
                onMerge={(w) => mergeMutation.mutate(w)}
              />
            ))
          )}
        </div>
      )}

      {selectedTab === 'prs' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Open Pull Requests</h2>
          {prsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
            </div>
          ) : prs?.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No open PRs</p>
          ) : (
            prs?.map(pr => (
              <Card key={pr.number} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-[#ffbe00]" />
                        <span className="font-medium">#{pr.number}</span>
                        <span>{pr.title}</span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        by {pr.author} • {pr.state}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-500" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Orchestrator;
