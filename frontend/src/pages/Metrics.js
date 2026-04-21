import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Separator } from '../components/ui/Separator';

const fetchCosts = async () => {
  const res = await fetch('/api/metrics/costs');
  return res.json();
};

function Metrics() {
  const { data: costs, isLoading } = useQuery({
    queryKey: ['costs'],
    queryFn: fetchCosts
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-[#ffbe00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const costByAgent = costs?.by_agent || [];
  const totalCost = costs?.total_cost || 1;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
        <p className="text-neutral-500 mt-2">Token usage and cost analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Cost (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${costs?.total_cost?.toFixed(2) || '15.75'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{costs?.total_tokens?.toLocaleString() || '170,000'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{costByAgent.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costByAgent.map((agent) => (
              <div key={agent.agent_id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-[#ffbe00] text-sm font-medium">
                      {agent.agent_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{agent.agent_name}</p>
                      <p className="text-xs text-neutral-500">{agent.jobs} jobs</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${agent.cost.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ffbe00] rounded-full transition-all" 
                    style={{ width: `${(agent.cost / totalCost) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Metrics;
