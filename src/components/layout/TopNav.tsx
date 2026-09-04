import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Download,
  Calendar,
  RotateCcw,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  Activity,
  CheckCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatRelativeTime } from '../../utils/formatters';
import { SafeImage } from '../common/SafeImage';
import { VISUAL_ASSETS } from '../../assets/images';

interface TopNavProps {
  navigate: (path: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ navigate }) => {
  const { user, merchant, logout } = useAuth();
  const {
    unreadCount,
    notifications,
    markNotificationsRead,
    dateRange,
    setDateRange,
    setIsSearchOpen,
    setIsCopilotOpen,
    setIsReportModalOpen,
    liveEventPulse,
    connectionStatus,
    eventsPerSec,
    lastSyncTime,
    isDemoMode,
    reconnectNow,
  } = usePlatform();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left section: Greeting & Real-time Connection Telemetry */}
      <div className="flex items-center space-x-3.5">
        {/* Mobile brand touchpoint when sidebar is hidden */}
        <button
          onClick={() => navigate('/dashboard')}
          className="md:hidden flex items-center shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-xs w-8 h-8 bg-slate-900 hover:opacity-90 transition-opacity"
          title="RecoverAI Home"
        >
          <img
            src={VISUAL_ASSETS.brandLogo}
            alt="RecoverAI"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold text-slate-900">
              Good evening, {user?.name ? user.name.split(' ')[0] : 'Suraj'}
            </h1>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500">Merchant Operations</span>
          </div>

          <div className="flex items-center space-x-2 mt-0.5">
            {/* Live Connection Pill */}
            {connectionStatus === 'LIVE' && (
              <div
                id="telemetry-status-live"
                className="flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-emerald-500 transition-all ${
                    liveEventPulse ? 'scale-150 ring-2 ring-emerald-300' : ''
                  }`}
                />
                <span className="font-semibold">LIVE</span>
                <span className="text-emerald-500 text-[10px]">•</span>
                <span className="text-[10px] text-emerald-800">{eventsPerSec} ev/s</span>
              </div>
            )}

            {connectionStatus === 'RECONNECTING' && (
              <div
                id="telemetry-status-reconnecting"
                className="flex items-center space-x-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
              >
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-600" />
                <span>Reconnecting...</span>
                <button
                  onClick={reconnectNow}
                  className="text-[10px] underline font-semibold text-amber-800 hover:text-amber-950 ml-1"
                >
                  Retry Now
                </button>
              </div>
            )}

            {connectionStatus === 'DEGRADED' && (
              <div
                id="telemetry-status-degraded"
                className="flex items-center space-x-1.5 text-[11px] font-medium text-amber-800 bg-amber-50/90 px-2 py-0.5 rounded-full border border-amber-300"
              >
                <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                <span>Degraded (Polling fallback)</span>
                <button
                  onClick={reconnectNow}
                  className="text-[10px] bg-amber-200/80 hover:bg-amber-300 px-1.5 py-0.2 rounded font-semibold text-amber-900 ml-1"
                >
                  Reconnect
                </button>
              </div>
            )}

            {connectionStatus === 'OFFLINE' && (
              <div
                id="telemetry-status-offline"
                className="flex items-center space-x-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
              >
                <WifiOff className="w-2.5 h-2.5 text-rose-500" />
                <span>Offline (Cached)</span>
                <button
                  onClick={reconnectNow}
                  className="text-[10px] bg-rose-100 hover:bg-rose-200 px-1.5 py-0.2 rounded font-semibold text-rose-800 ml-1"
                >
                  Reconnect
                </button>
              </div>
            )}

            {isDemoMode && (
              <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                DEMO DATA — NOT LIVE
              </span>
            )}

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Last synced: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center space-x-3">
        {/* Global Search Input Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 text-slate-500 text-xs border border-slate-200/80 transition-all w-52 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search TXN, customer...</span>
          </div>
          <span className="font-mono text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            ⌘K
          </span>
        </button>

        {/* Date Selector */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          {(['TODAY', '7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                dateRange === r
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
            >
              {r === 'TODAY' ? 'Today' : r === '7D' ? '7 Days' : r === '30D' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Recovery Copilot Button */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        {/* Export Report Trigger */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all shadow-xs"
          title="Download Recovery Report"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Report</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 relative transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markNotificationsRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        if (notif.link) navigate(notif.link);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
          >
            <SafeImage
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              fallbackType="initials"
              fallbackText={user?.name || 'Suraj Kumar'}
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Suraj Kumar'}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'surajkr12510@gmail.com'}</p>
                <div className="mt-1.5 inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.role?.replace(/_/g, ' ') || 'Operations Manager'}
                </div>
              </div>

              <div className="py-1 text-xs">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace & Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/audit');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audit Logs</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
