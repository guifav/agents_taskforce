import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Square, Activity, Terminal } from 'lucide-react';

const fetchAgents = async () => {
  const res = await fetch('/api/agents');
  return res.json();
};

function Agents() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 5000
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agents</h2>
        <p className="text-gray-400">Manage your agent team</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(agents || []).map(agent => (
          <div key={agent.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  agent.status === 'idle' ? 'bg-green-500' :
                  agent.status === 'busy' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-gray-400 text-sm">{agent.description || agent.skill}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{agent.model}</span>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-700">
                  Max: ${agent.max_cost_per_job}/job
                </span>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-600 hover:bg-red-700 rounded-lg">
                  <Square className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {agent.current_task && (
              <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4" />
                  Current Task:
                </div>
                <p className="mt-1">{agent.current_task}</p>
              </div>
            )}
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
              {agent.last_active && (
                <span>Last active: {new Date(agent.last_active).toLocaleString()}</span>
              )}
              <button className="flex items-center gap-1 hover:text-white">
                <Terminal className="w-4 h-4" />
                View Logs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Agents;
