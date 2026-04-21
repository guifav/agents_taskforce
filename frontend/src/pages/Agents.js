import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Settings, Loader2, Terminal, X } from 'lucide-react';

const fetchAgents = async () => {
  const res = await fetch('/api/agents');
  return res.json();
};

const runAgent = async (agentId) => {
  const res = await fetch(`/api/agents/${agentId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args: [] })
  });
  return res.json();
};

function Agents() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [runOutput, setRunOutput] = useState(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 30000
  });

  const runMutation = useMutation({
    mutationFn: runAgent,
    onSuccess: (data) => {
      setRunOutput(data);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
      </div>
    );
  }

  const handleRun = (agentId) => {
    setRunOutput(null);
    runMutation.mutate(agentId);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {agents?.length || 0} agents installed
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(agents || []).map(agent => (
          <div 
            key={agent.id} 
            className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 hover:border-neutral-800 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-[#ffbe00] font-semibold">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-xs text-neutral-500">{agent.id}</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'active' ? 'bg-[#ffbe00]' :
                agent.status === 'running' ? 'bg-blue-500 animate-pulse' :
                'bg-neutral-600'
              }`} />
            </div>

            <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
              {agent.description || 'No description available'}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-600 mb-4">
              {agent.has_config && (
                <span className="px-2 py-1 bg-neutral-900 rounded">config</span>
              )}
              {agent.requires?.bins && (
                <span className="px-2 py-1 bg-neutral-900 rounded">
                  {agent.requires.bins.length} deps
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleRun(agent.id)}
                disabled={runMutation.isPending}
                className="flex-1 px-4 py-2 bg-[#ffbe00] hover:bg-[#e6ac00] disabled:bg-neutral-800 disabled:text-neutral-500 text-black rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {runMutation.isPending && runMutation.variables === agent.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button 
                onClick={() => setSelectedAgent(agent)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Run Output Modal */}
      {runOutput && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#ffbe00]" />
                <h3 className="font-semibold">Execution Output</h3>
              </div>
              <button 
                onClick={() => setRunOutput(null)}
                className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 ${
                runOutput.success 
                  ? 'bg-[#ffbe00]/10 text-[#ffbe00]' 
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {runOutput.success ? 'Success' : 'Failed'}
              </div>

              {runOutput.stdout && (
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">Output:</p>
                  <pre className="bg-black p-4 rounded-lg text-sm overflow-x-auto text-neutral-300 font-mono">
                    {runOutput.stdout}
                  </pre>
                </div>
              )}

              {runOutput.stderr && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Errors:</p>
                  <pre className="bg-black p-4 rounded-lg text-sm overflow-x-auto text-red-400 font-mono">
                    {runOutput.stderr}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Agent Config Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-900">
              <h3 className="font-semibold">{selectedAgent.name}</h3>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-400 mb-4">{selectedAgent.description}</p>
              <div className="bg-black p-4 rounded-lg">
                <p className="text-xs text-neutral-500 mb-2">Directory:</p>
                <code className="text-xs text-neutral-300">{selectedAgent.directory}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agents;
