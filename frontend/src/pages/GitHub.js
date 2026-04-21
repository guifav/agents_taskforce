import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitPullRequest, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const fetchPRs = async () => {
  const res = await fetch('/api/github/prs');
  return res.json();
};

const fetchIssues = async () => {
  const res = await fetch('/api/github/issues');
  return res.json();
};

function GitHub() {
  const { data: prsData, isLoading: prsLoading } = useQuery({
    queryKey: ['github-prs'],
    queryFn: fetchPRs
  });

  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['github-issues'],
    queryFn: fetchIssues
  });

  if (prsLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-[#ffbe00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const prs = prsData?.prs || [];
  const issues = issuesData?.issues || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">GitHub</h1>
        <p className="text-neutral-500 mt-2">
          {prs.length} open PRs · {issues.length} open issues
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRs Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-[#ffbe00]" />
              <CardTitle>Pull Requests</CardTitle>
            </div>
            <Badge variant="outline">{prs.length} open</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {prs.map(pr => (
              <div key={pr.id} className="group">
                <a 
                  href={pr.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start justify-between hover:bg-neutral-900/50 p-3 -mx-3 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{pr.title}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>#{pr.id}</span>
                      <span>·</span>
                      <span>{pr.repo}</span>
                      <span>·</span>
                      <span>by {pr.author}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={pr.review_status === 'approved' ? 'default' : 'secondary'}
                    className="shrink-0 ml-4"
                  >
                    {pr.review_status}
                  </Badge>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#ffbe00]" />
              <CardTitle>Issues</CardTitle>
            </div>
            <Badge variant="outline">{issues.length} open</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {issues.map(issue => (
              <div key={issue.id} className="group">
                <a 
                  href={issue.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start justify-between hover:bg-neutral-900/50 p-3 -mx-3 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{issue.title}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>#{issue.id}</span>
                      <span>·</span>
                      <span>{issue.repo}</span>
                      <span>·</span>
                      <span>by {issue.author}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {issue.labels?.map(label => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GitHub;
