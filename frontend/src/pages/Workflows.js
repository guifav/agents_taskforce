import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Workflow, Play, Pause, Settings } from 'lucide-react';

const fetchWorkflows = async () => {
  const res = await fetch('/api/workflows');
  return res.json();
};

function Workflows() {
  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: fetchWorkflows
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Workflows</h2>
        <p className="text-gray-400">Automated agent workflows</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(workflows || []).map(workflow => (
          <div key={workflow.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Workflow className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-lg">{workflow.name}</h3>
                  <p className="text-gray-400 text-sm">{workflow.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  workflow.status === 'active' ? 'bg-green-900 text-green-300' :
                  workflow.status === 'running' ? 'bg-blue-900 text-blue-300' :
                  'bg-gray-700'
                }`}>
                  {workflow.status}
                </span>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              {workflow.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center border-2 border-blue-500">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-xs mt-2 text-center">{step.agent}</span>
                    <span className="text-xs text-gray-500">{step.task}</span>
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-600"></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-sm text-gray-400">
              <span>Trigger: {workflow.trigger}</span>
              <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Runs */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Active Workflow Runs</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">PR Review Pipeline</p>
                <p className="text-sm text-gray-400">Run #12345 • Step 1/4: Review</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-blue-500 animate-pulse"></div>
                </div>
                <span className="text-sm">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workflows;
