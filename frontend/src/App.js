import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  Activity, 
  GitPullRequest, 
  Users,
  Workflow,
  BarChart3
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
        <div className="min-h-screen bg-black text-white font-['Inter']">
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-16 bg-neutral-950 border-r border-neutral-900 flex flex-col items-center py-6">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#ffbe00] flex items-center justify-center">
                <Activity className="w-5 h-5 text-black" />
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <NavLink 
                to="/" 
                className={({isActive}) => 
                  `p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#ffbe00] text-black' 
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`
                }
                title="Dashboard"
              >
                <Activity className="w-5 h-5" />
              </NavLink>
              
              <NavLink 
                to="/agents" 
                className={({isActive}) => 
                  `p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#ffbe00] text-black' 
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`
                }
                title="Agents"
              >
                <Users className="w-5 h-5" />
              </NavLink>
              
              <NavLink 
                to="/github" 
                className={({isActive}) => 
                  `p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#ffbe00] text-black' 
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`
                }
                title="GitHub"
              >
                <GitPullRequest className="w-5 h-5" />
              </NavLink>
              
              <NavLink 
                to="/workflows" 
                className={({isActive}) => 
                  `p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#ffbe00] text-black' 
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`
                }
                title="Workflows"
              >
                <Workflow className="w-5 h-5" />
              </NavLink>
              
              <NavLink 
                to="/metrics" 
                className={({isActive}) => 
                  `p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#ffbe00] text-black' 
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`
                }
                title="Metrics"
              >
                <BarChart3 className="w-5 h-5" />
              </NavLink>
            </nav>
            
            {/* Status indicator */}
            <div className="mt-auto">
              <div className="w-2 h-2 rounded-full bg-[#ffbe00] animate-pulse" title="Connected" />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="ml-16 min-h-screen">
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
