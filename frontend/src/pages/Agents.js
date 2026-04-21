import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Play, Settings, Loader2, Terminal, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';

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
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [runOutput, setRunOutput] = useState(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 30000
  });

  const runMutation = useMutation({
    mutationFn: runAgent,
    onSuccess: (data) => setRunOutput(data)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#ffbe00]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
        <p className="text-neutral-500 mt-2">
          {agents?.length || 0} agents installed and ready
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(agents || []).map(agent => (
          <Card key={agent.id} className="group hover:border-neutral-700 transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="text-lg">
                      {agent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <CardDescription>{agent.id}</CardDescription>
                  </div>
                </div>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
                {agent.description || 'No description available'}
              </p>

              <div className="flex items-center gap-2 text-xs text-neutral-600 mb-4">
                {agent.has_config && (
                  <Badge variant="outline">config</Badge>
                )}
                {agent.requires?.bins && (
                  <Badge variant="outline">{agent.requires.bins.length} deps</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => runMutation.mutate(agent.id)}
                  isLoading={runMutation.isPending && runMutation.variables === agent.id}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Run Output Dialog */}
      <Dialog open={!!runOutput} onOpenChange={() => setRunOutput(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#ffbe00]" />
              <DialogTitle>Execution Output</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm mb-4 ${
            runOutput?.success 
              ? 'bg-[#ffbe00]/10 text-[#ffbe00] border border-[#ffbe00]/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {runOutput?.success ? 'Success' : 'Failed'}
          </div>

          {runOutput?.stdout && (
            <div className="mb-4">
              <p className="text-xs text-neutral-500 mb-2 font-medium">Output</p>
              <pre className="bg-black border border-neutral-800 p-4 rounded-lg text-sm overflow-x-auto text-neutral-300 font-mono">
                {runOutput.stdout}
              </pre>
            </div>
          )}

          {runOutput?.stderr && (
            <div>
              <p className="text-xs text-neutral-500 mb-2 font-medium">Errors</p>
              <pre className="bg-black border border-neutral-800 p-4 rounded-lg text-sm overflow-x-auto text-red-400 font-mono">
                {runOutput.stderr}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Config Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAgent?.name}</DialogTitle>
            <DialogDescription>{selectedAgent?.description}</DialogDescription>
          </DialogHeader>
          <div className="bg-black border border-neutral-800 p-4 rounded-lg">
            <p className="text-xs text-neutral-500 mb-2 font-medium">Directory</p>
            <code className="text-xs text-neutral-300">{selectedAgent?.directory}</code>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Agents;
