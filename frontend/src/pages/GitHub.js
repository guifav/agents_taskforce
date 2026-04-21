import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitPullRequest, AlertCircle, ExternalLink, User } from 'lucide-react';

const fetchPRs = async () => {
  const res = await fetch('/api/github/prs');
  return res.json();
};

const fetchIssues = async () => {
  const res = await fetch('/api/github/issues');
  return res.json();
};

function GitHub() {
  const { data: prs } = useQuery({
    queryKey: ['prs'],
    queryFn: fetchPRs,
    refetchInterval: 60000
  });

  const { data: issues } = useQuery({
    queryKey: ['issues'],
    queryFn: fetchIssues,
    refetchInterval: 60000
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">GitHub Integration</h2>
        <p className="text-gray-400">Monitor PRs and issues</p>
      </div>

      {/* PRs Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-purple-500" />
            Open Pull Requests ({prs?.length || 0})
          </h3>
          <button className="text-sm text-blue-400 hover:text-blue-300">Sync Now</button>
        </div>
        
        <div className="space-y-3">
          {(prs || []).map(pr => (
            <div key={pr.id} className="p-4 bg-gray-900 rounded-lg hover:bg-gray-850 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">#{pr.id}</span>
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" 
                       className="font-medium hover:text-blue-400 flex items-center gap-1">
                      {pr.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {pr.author}
                    </span>
                    <span>{pr.repo}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      pr.review_status === 'approved' ? 'bg-green-900 text-green-300' :
                      pr.review_status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-700'
                    }`}>
                      {pr.review_status}
                    </span>
                    {pr.assigned_agent && (
                      <span className="text-blue-400">
                        Assigned: {pr.assigned_agent}
                      </span>
                    )}
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Open Issues ({issues?.length || 0})
          </h3>
        </div>
        
        <div className="space-y-3">
          {(issues || []).map(issue => (
            <div key={issue.id} className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">#{issue.id}</span>
                    <a href={issue.url} target="_blank" rel="noopener noreferrer"
                       className="font-medium hover:text-blue-400 flex items-center gap-1">
                      {issue.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {issue.labels.map(label => (
                      <span key={label} className="px-2 py-0.5 rounded text-xs bg-blue-900 text-blue-300">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                  Assign Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GitHub;
