import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Users, GitPullRequest, DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const fetchMetrics = async () => {
  const res = await fetch('/api/metrics/dashboard');
  return res.json();
};

const fetchAgents = async () => {
  const res = await fetch('/api/agents');
  return res.json();
};

function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        <div className="p-2 bg-neutral-900 rounded-lg">
          <Icon className="w-4 h-4 text-[#ffbe00]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <Badge variant="default" className="text-xs">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {trend}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 30000
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
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

  if (metricsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-[#ffbe00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeAgents = agents?.filter(a => a.status === 'active').length || 0;
  const idleAgents = agents?.filter(a => a.status === 'idle').length || 0;

  const activities = [
    { message: 'github-guardian scanned 3 repositories', time: '2 min ago' },
    { message: 'cost-watcher reported daily usage', time: '15 min ago' },
    { message: 'security-scout found 1 medium alert', time: '1 hour ago' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-neutral-500 mt-2">Overview of your agent team</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={wsStatus === 'connected' ? 'default' : 'destructive'}>
            {wsStatus === 'connected' ? 'Connected' : wsStatus}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Agents"
          value={agents?.length || 0}
          subtitle={`${activeAgents} active, ${idleAgents} idle`}
          icon={Users}
        />
        <StatCard
          title="Open PRs"
          value={metrics?.open_prs || 6}
          subtitle={`${metrics?.open_issues || 9} issues`}
          icon={GitPullRequest}
          trend="+2"
        />
        <StatCard
          title="Today's Cost"
          value={`$${metrics?.today_cost?.toFixed(2) || '2.75'}`}
          subtitle={`${metrics?.today_tokens?.toLocaleString() || '32,000'} tokens`}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Jobs"
          value={metrics?.pending_jobs || 5}
          subtitle={`${metrics?.running_jobs || 2} running`}
          icon={Activity}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions from your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ffbe00]" />
                  <span className="text-sm">{activity.message}</span>
                </div>
                <Badge variant="outline">{activity.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
