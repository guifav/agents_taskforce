import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Cpu } from 'lucide-react';

const fetchCosts = async () => {
  const res = await fetch('/api/metrics/costs');
  return res.json();
};

const fetchTokens = async () => {
  const res = await fetch('/api/metrics/tokens');
  return res.json();
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function Metrics() {
  const { data: costs } = useQuery({
    queryKey: ['costs'],
    queryFn: fetchCosts
  });

  const { data: tokens } = useQuery({
    queryKey: ['tokens'],
    queryFn: fetchTokens
  });

  const costByAgent = costs?.by_agent || [];
  const tokenByModel = tokens?.by_model || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Metrics & Costs</h2>
        <p className="text-gray-400">Track token usage and costs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-gray-400">Total Cost (24h)</p>
              <p className="text-2xl font-bold">${costs?.total_cost?.toFixed(2) || '15.75'}</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="agent_name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Bar dataKey="cost" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-gray-400">Total Tokens</p>
              <p className="text-2xl font-bold">{tokens?.total_tokens?.toLocaleString() || '170,000'}</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenByModel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="tokens"
                >
                  {tokenByModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown by Agent</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3">Agent</th>
                <th className="pb-3">Jobs</th>
                <th className="pb-3">Cost</th>
                <th className="pb-3">Avg/Job</th>
              </tr>
            </thead>
            <tbody>
              {costByAgent.map((agent) => (
                <tr key={agent.agent_id} className="border-b border-gray-700 last:border-0">
                  <td className="py-3">{agent.agent_name}</td>
                  <td className="py-3">{agent.jobs}</td>
                  <td className="py-3">${agent.cost.toFixed(2)}</td>
                  <td className="py-3">${(agent.cost / agent.jobs).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Usage */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Model Usage</h3>
        <div className="space-y-4">
          {tokens?.by_model?.map((model) => (
            <div key={model.model} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{model.model}</p>
                <p className="text-sm text-gray-400">{model.tokens.toLocaleString()} tokens</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${model.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm w-12 text-right">{model.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Metrics;
