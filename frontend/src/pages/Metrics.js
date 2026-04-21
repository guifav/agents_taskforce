import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
      </div>
    );
  }

  const costByAgent = costs?.by_agent || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Metrics</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Token usage and cost analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <p className="text-neutral-500 text-sm mb-2">Total Cost (24h)</p>
          <p className="text-3xl font-semibold">${costs?.total_cost?.toFixed(2) || '15.75'}</p>
        </div>
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <p className="text-neutral-500 text-sm mb-2">Total Tokens</p>
          <p className="text-3xl font-semibold">{costs?.total_tokens?.toLocaleString() || '170,000'}</p>
        </div>
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <p className="text-neutral-500 text-sm mb-2">Active Agents</p>
          <p className="text-3xl font-semibold">{costByAgent.length}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-xl">
        <div className="p-4 border-b border-neutral-900">
          <h2 className="font-semibold">Cost Breakdown by Agent</h2>
        </div>
        <div className="divide-y divide-neutral-900">
          {costByAgent.map((agent) => (
            <div key={agent.agent_id} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-[#ffbe00] text-sm font-medium">
                  {agent.agent_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{agent.agent_name}</p>
                  <p className="text-xs text-neutral-500">{agent.jobs} jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ffbe00]" 
                    style={{ width: `${(agent.cost / (costs?.total_cost || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">${agent.cost.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Metrics;
