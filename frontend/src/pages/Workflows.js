import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Workflow, Play, Loader2 } from 'lucide-react';

const fetchWorkflows = async () => {
  const res = await fetch('/api/workflows');
  return res.json();
};

function Workflows() {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: fetchWorkflows
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
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {workflows?.length || 0} workflows configured
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(workflows || []).map(workflow => (
          <div key={workflow.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 hover:border-neutral-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-[#ffbe00]" />
                </div>
                <div>
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <p className="text-sm text-neutral-500">{workflow.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  workflow.status === 'active' 
                    ? 'bg-[#ffbe00]/10 text-[#ffbe00]' 
                    : 'bg-neutral-900 text-neutral-400'
                }`}>
                  {workflow.status}
                </span>
                <button className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
              {workflow.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-xs mt-2 text-neutral-400 text-center">{step.agent}</span>
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className="w-8 h-px bg-neutral-800" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500">
              <span>Trigger: {workflow.trigger}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workflows;
