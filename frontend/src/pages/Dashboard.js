import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Users, 
  GitPullRequest, 
  AlertCircle, 
  DollarSign,
  Cpu,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const fetchDashboard = async () => {
  const res = await fetch('/api/dashboard');
  return res.json();
};

const fetchMetrics = async () => {
  const res = await fetch('/api/metrics/dashboard');
  return res.json();
};

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function AgentStatusRow({ agent }) {
  const statusColors = {
    idle: 'bg-green-500',
    busy: 'bg-yellow-500',
    error: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]} animate-pulse`}></div>
        <div>
          <p className="font-medium">{agent.name}</p>
          <p className="text-xs text-gray-400">{agent.skill}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`px-2 py-1 rounded text-xs ${
          agent.status === 'idle' ? 'bg-green-900 text-green-300' :
          agent.status === 'busy' ? 'bg-yellow-900 text-yellow-300' :
          'bg-red-900 text-red-300'
        }`}>
          {agent.status}
        </span>
        {agent.current_task && (
          <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{agent.current_task}</p>
        )}
      </div>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    { id: 1, message: 'Code reviewer completed PR #242 review', time: '2 min ago', type: 'success' },
    { id: 2, message: 'QA tester started smoke tests', time: '5 min ago', type: 'info' },
    { id: 3, message: 'GitHub guardian found 3 new PRs', time: '10 min ago', type: 'info' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 30000
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 30000
  });

  const [wsStatus, setWsStatus] = useState('connecting');

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    
    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');

    return () => ws.close();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const agents = [
    { id: 1, name: 'code-reviewer', skill: 'Code Review', status: 'idle', current_task: null },
    { id: 2, name: 'qa-tester', skill: 'QA Testing', status: 'busy', current_task: 'Running smoke tests for PR #242' },
    { id: 3, name: 'github-guardian', skill: 'GitHub Monitor', status: 'idle', current_task: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-400">Overview of your agent team</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">WebSocket:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            wsStatus === 'connected' ? 'bg-green-900 text-green-300' :
            wsStatus === 'connecting' ? 'bg-yellow-900 text-yellow-300' :
            'bg-red-900 text-red-300'
          }`}>
            {wsStatus}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Agents"
          value={metrics?.active_agents || 3}
          subtitle={`${metrics?.busy_agents || 1} busy, ${metrics?.idle_agents || 2} idle`}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Open PRs"
          value={metrics?.open_prs || 6}
          subtitle={`${metrics?.open_issues || 9} open issues`}
          icon={GitPullRequest}
          color="bg-purple-600"
        />
        <StatCard
          title="Today's Cost"
          value={`$${metrics?.today_cost?.toFixed(2) || '2.75'}`}
          subtitle={`${metrics?.today_tokens?.toLocaleString() || '32,000'} tokens`}
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          title="Pending Jobs"
          value={metrics?.pending_jobs || 5}
          subtitle={`${metrics?.running_jobs || 2} running`}
          icon={Clock}
          color="bg-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Agent Status</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div>
            {agents.map(agent => (
              <AgentStatusRow key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
            <GitPullRequest className="w-4 h-4" />
            Review Open PRs
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Spawn Code Reviewer
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Run QA Tests
          </button>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Check GitHub Issues
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
