import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitPullRequest, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
      </div>
    );
  }

  const prs = prsData?.prs || [];
  const issues = issuesData?.issues || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">GitHub</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {prs.length} open PRs · {issues.length} open issues
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRs Section */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-900">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-[#ffbe00]" />
              <h2 className="font-semibold">Pull Requests</h2>
            </div>
            <span className="text-xs text-neutral-500">{prs.length} open</span>
          </div>
          <div className="divide-y divide-neutral-900">
            {prs.map(pr => (
              <div key={pr.id} className="p-4 hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <a 
                    href={pr.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:text-[#ffbe00] transition-colors flex items-center gap-2"
                  >
                    #{pr.id} {pr.title}
                    <ExternalLink className="w-3 h-3 text-neutral-600" />
                  </a>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{pr.repo}</span>
                  <span>by {pr.author}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    pr.review_status === 'approved' 
                      ? 'bg-[#ffbe00]/10 text-[#ffbe00]' 
                      : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    {pr.review_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues Section */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#ffbe00]" />
              <h2 className="font-semibold">Issues</h2>
            </div>
            <span className="text-xs text-neutral-500">{issues.length} open</span>
          </div>
          <div className="divide-y divide-neutral-900">
            {issues.map(issue => (
              <div key={issue.id} className="p-4 hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <a 
                    href={issue.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:text-[#ffbe00] transition-colors flex items-center gap-2"
                  >
                    #{issue.id} {issue.title}
                    <ExternalLink className="w-3 h-3 text-neutral-600" />
                  </a>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{issue.repo}</span>
                  <span>by {issue.author}</span>
                  <div className="flex gap-1">
                    {issue.labels?.map(label => (
                      <span key={label} className="px-2 py-0.5 bg-neutral-900 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GitHub;
