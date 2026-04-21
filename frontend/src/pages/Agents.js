import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Play, Settings, Clock, FileText, Loader2 } from 'lucide-react';

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

const fetchAgentConfig = async (agentId) => {
  const res = await fetch(`/api/agents/${agentId}/config`);
  return res.json();
};

function Agents() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [runOutput, setRunOutput] = useState(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 30000
  });

  const { data: configData } = useQuery({
    queryKey: ['agent-config', selectedAgent?.id],
    queryFn: () => fetchAgentConfig(selectedAgent.id),
    enabled: !!selectedAgent && showConfig
  });

  const runMutation = useMutation({
    mutationFn: runAgent,
    onSuccess: (data) => {
      setRunOutput(data);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handleRun = (agentId) => {
    setRunOutput(null);
    runMutation.mutate(agentId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agent Team</h2>
        <p className="text-gray-400">Your installed OpenClaw agents</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(agents || []).map(agent => (
          <div 
            key={agent.id} 
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center">
                  <span className="text-lg font-bold">{agent.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-xs text-gray-400">{agent.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                agent.status === 'active' ? 'bg-green-900 text-green-300' :
                agent.status === 'running' ? 'bg-blue-900 text-blue-300' :
                'bg-gray-700 text-gray-300'
              }`}>
                {agent.status}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {agent.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              {agent.has_config && (
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Config
                </span>
              )}
              {agent.requires?.bins && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {agent.requires.bins.length} deps
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleRun(agent.id)}
                disabled={runMutation.isPending}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {runMutation.isPending && runMutation.variables === agent.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button 
                onClick={() => { setSelectedAgent(agent); setShowConfig(true); }}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Run Output */}
      {runOutput && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Execution Output</h3>
            <button 
              onClick={() => setRunOutput(null)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          
          <div className={`p-3 rounded mb-4 ${runOutput.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <p className="text-sm">
              Status: {runOutput.success ? 'Success' : 'Failed'}
            </p>
          </div>

          {runOutput.stdout && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Output:</p>
              <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                {runOutput.stdout}
              </pre>
            </div>
          )}

          {runOutput.stderr && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Errors:</p>
              <pre className="bg-red-900/20 p-3 rounded text-sm overflow-x-auto text-red-300">
                {runOutput.stderr}
              </pre>
            </div>
          )}

          {runOutput.error && (
            <div className="bg-red-900/20 p-3 rounded">
              <p className="text-sm text-red-300">{runOutput.error}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Timestamp: {new Date(runOutput.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedAgent.name} Configuration
              </h3>
              <button 
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {configData?.config ? (
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(configData.config, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-400">No configuration file found.</p>
            )}

            <div className="mt-4 p-4 bg-gray-900 rounded">
              <p className="text-sm text-gray-400 mb-2">Skill Directory:</p>
              <code className="text-xs">{selectedAgent.directory}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agents;
