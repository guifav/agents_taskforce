import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  Activity, 
  GitPullRequest, 
  AlertCircle, 
  Cpu, 
  DollarSign,
  Workflow,
  Users
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import GitHub from './pages/GitHub';
import Workflows from './pages/Workflows';
import Metrics from './pages/Metrics';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-6">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-500" />
                Agent Dashboard
              </h1>
              <p className="text-xs text-gray-400 mt-1">OpenClaw Orchestrator</p>
            </div>
            
            <nav className="px-4 space-y-2">
              <NavLink 
                to="/" 
                className={({isActive}) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`
                }
              >
                <Activity className="w-5 h-5" />
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/agents" 
                className={({isActive}) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`
                }
              >
                <Users className="w-5 h-5" />
                Agents
              </NavLink>
              
              <NavLink 
                to="/github" 
                className={({isActive}) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`
                }
              >
                <GitPullRequest className="w-5 h-5" />
                GitHub
              </NavLink>
              
              <NavLink 
                to="/workflows" 
                className={({isActive}) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`
                }
              >
                <Workflow className="w-5 h-5" />
                Workflows
              </NavLink>
              
              <NavLink 
                to="/metrics" 
                className={({isActive}) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`
                }
              >
                <DollarSign className="w-5 h-5" />
                Metrics
              </NavLink>
            </nav>
            
            {/* Connection Status */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-400">Connected</span>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="ml-64 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/github" element={<GitHub />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/metrics" element={<Metrics />} />
            </Routes>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
