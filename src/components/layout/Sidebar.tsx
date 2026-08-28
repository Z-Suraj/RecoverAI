import React from 'react';
import {
  LayoutDashboard,
  RotateCcw,
  ArrowLeftRight,
  Users,
  BarChart3,
  Cpu,
  FlaskConical,
  ScrollText,
  Code2,
  Settings,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate }) => {
  const { merchant } = useAuth();
  const { unreadCount, setIsCopilotOpen } = usePlatform();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Recovery Queue', path: '/recovery', icon: RotateCcw, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Simulation', path: '/simulation', icon: Cpu, highlight: true },
    { label: 'Experiments', path: '/experiments', icon: FlaskConical },
    { label: 'Audit Log', path: '/audit', icon: ScrollText },
    { label: 'Developer', path: '/developer', icon: Code2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-all">
            <RotateCcw className="w-4 h-4 text-white animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">RecoverAI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                FinOps
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Revenue Recovery Engine</p>
          </div>
        </button>
      </div>

      {/* Quick Copilot Banner */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Recovery Copilot</span>
              <span className="text-[10px] text-slate-400">Contextual query engine</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">⌘J</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations
        </div>
        {navItems.slice(0, 5).map((item) => {
          const active = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Intelligence & Testing
        </div>
        {navItems.slice(5).map((item) => {
          const active = currentPath === item.path || currentPath.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Interactive
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Merchant / Operational Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                {merchant?.name || 'NovaCart Commerce'}
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Demo
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Policy Rules Active</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v4.2-fin</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
