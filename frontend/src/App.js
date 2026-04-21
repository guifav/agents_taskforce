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
import { Separator } from './components/ui/Separator';

const queryClient = new QueryClient();

function App() {
  const navItems = [
    { to: '/', icon: Activity, label: 'Dashboard' },
    { to: '/agents', icon: Users, label: 'Agents' },
    { to: '/github', icon: GitPullRequest, label: 'GitHub' },
    { to: '/workflows', icon: Workflow, label: 'Workflows' },
    { to: '/metrics', icon: BarChart3, label: 'Metrics' },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-black text-white font-['Inter']">
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-16 bg-neutral-950 border-r border-neutral-800 flex flex-col items-center py-6">
            {/* Logo */}
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ffbe00] flex items-center justify-center shadow-lg shadow-[#ffbe00]/20">
                <Activity className="w-5 h-5 text-black" />
              </div>
            </div>
            
            <Separator orientation="horizontal" className="w-8 mb-6" />
            
            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#ffbe00] text-black shadow-lg shadow-[#ffbe00]/20'
                        : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                    }`
                  }
                  title={item.label}
                >
                  <item.icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-neutral-800">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </nav>
            
            <div className="mt-auto">
              <Separator orientation="horizontal" className="w-8 mb-6" />
              <div className="flex justify-center">
                <div className="w-2 h-2 rounded-full bg-[#ffbe00] animate-pulse shadow-lg shadow-[#ffbe00]/50" title="Connected" />
              </div>
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
