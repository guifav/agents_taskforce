import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Workflow, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
        <div className="w-8 h-8 border-2 border-[#ffbe00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
        <p className="text-neutral-500 mt-2">{workflows?.length || 0} workflows configured</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(workflows || []).map(workflow => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center">
                    <Workflow className="w-5 h-5 text-[#ffbe00]" />
                  </div>
                  <div>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={workflow.status === 'active' ? 'default' : 'secondary'}
                  >
                    {workflow.status}
                  </Badge>
                  <Button variant="secondary" size="icon">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Workflow Steps */}
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
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

              <div className="mt-4 pt-4 border-t border-neutral-800">
                <p className="text-xs text-neutral-500">Trigger: {workflow.trigger}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Workflows;
