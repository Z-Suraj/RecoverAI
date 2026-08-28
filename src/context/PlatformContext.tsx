import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SystemNotification, ConnectionStatus } from '../types';
import { apiClient } from '../api/client';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface PlatformContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  toasts: ToastMessage[];
  liveEventPulse: boolean;
  connectionStatus: ConnectionStatus;
  eventsPerSec: number;
  lastSyncTime: Date;
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
  reconnectNow: () => void;
  dateRange: 'TODAY' | '7D' | '30D' | '90D';
  setDateRange: (range: 'TODAY' | '7D' | '30D' | '90D') => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  markNotificationsRead: () => Promise<void>;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [liveEventPulse, setLiveEventPulse] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('LIVE');
  const [eventsPerSec, setEventsPerSec] = useState(1.4);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dateRange, setDateRange] = useState<'TODAY' | '7D' | '30D' | '90D'>('7D');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const fallbackPollingRef = useRef<NodeJS.Timeout | null>(null);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLastSyncTime(new Date());
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiClient.getNotifications();
      setNotifications(data);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Error fetching notifications (fallback active):', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, refreshKey]);

  // Robust SSE Connection Lifecycle with Safe Exponential Backoff & Polling Fallback
  const connectSSE = useCallback(() => {
    // Clear any pending reconnect timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clean up existing EventSource to avoid duplicate listeners or sockets
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const es = new EventSource('/api/events');
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionStatus('LIVE');
        reconnectAttemptRef.current = 0;
        setLastSyncTime(new Date());
      };

      es.addEventListener('CONNECTED', (event) => {
        setConnectionStatus('LIVE');
        reconnectAttemptRef.current = 0;
        setLastSyncTime(new Date());
        try {
          const payload = JSON.parse(event.data);
          if (payload.eventsPerSec) setEventsPerSec(payload.eventsPerSec);
        } catch {
          // ignore
        }
      });

      es.addEventListener('HEARTBEAT', (event) => {
        setConnectionStatus('LIVE');
        setLastSyncTime(new Date());
        try {
          const payload = JSON.parse(event.data);
          if (payload.eventsPerSec) setEventsPerSec(payload.eventsPerSec);
        } catch {
          // ignore
        }
      });

      es.addEventListener('RECOVERY_COMPLETED', (event) => {
        setLiveEventPulse(true);
        setTimeout(() => setLiveEventPulse(false), 2000);
        triggerRefresh();
        fetchNotifications();

        try {
          const payload = JSON.parse(event.data);
          if (payload.action?.status === 'EXECUTED' && payload.opportunity?.status === 'RECOVERED') {
            addToast({
              type: 'success',
              title: 'Revenue Recovered!',
              message: `Successfully recovered ₹${(payload.opportunity.amount || 0).toLocaleString('en-IN')} for ${payload.opportunity.customerName}.`,
            });
          }
        } catch {
          // ignore
        }
      });

      es.addEventListener('WEBHOOK_INGESTED', (event) => {
        setLiveEventPulse(true);
        setTimeout(() => setLiveEventPulse(false), 2000);
        triggerRefresh();
        fetchNotifications();

        try {
          const payload = JSON.parse(event.data);
          addToast({
            type: 'info',
            title: 'New Revenue Risk Ingested',
            message: `At-risk opportunity for ₹${(payload.opportunity?.amount || 0).toLocaleString('en-IN')} identified via webhook.`,
          });
        } catch {
          // ignore
        }
      });

      es.addEventListener('AUDIT_LOG_ADDED', () => {
        triggerRefresh();
      });

      es.addEventListener('STATE_RESET', () => {
        triggerRefresh();
        fetchNotifications();
        addToast({
          type: 'info',
          title: 'Demo State Reset',
          message: 'Pristine fintech dataset restored.',
        });
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) {
          es.close();
          eventSourceRef.current = null;
        }

        reconnectAttemptRef.current += 1;
        const attempts = reconnectAttemptRef.current;

        if (attempts <= 3) {
          setConnectionStatus('RECONNECTING');
        } else {
          setConnectionStatus('DEGRADED');
        }

        // Exponential backoff: 1s, 2s, 4s, 8s (capped at 10s)
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, delay);
      };
    } catch (e) {
      console.warn('Real-time SSE stream unavailable, switching to polling fallback:', e);
      setConnectionStatus('DEGRADED');
    }
  }, [triggerRefresh, fetchNotifications, addToast]);

  const reconnectNow = useCallback(() => {
    reconnectAttemptRef.current = 0;
    setConnectionStatus('RECONNECTING');
    connectSSE();
  }, [connectSSE]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [connectSSE]);

  // Secondary Fallback: When SSE is degraded or offline, poll API every 10s to keep state fresh
  useEffect(() => {
    if (connectionStatus === 'DEGRADED' || connectionStatus === 'OFFLINE') {
      fallbackPollingRef.current = setInterval(async () => {
        try {
          await fetchNotifications();
          triggerRefresh();
          setLastSyncTime(new Date());
          if (connectionStatus === 'OFFLINE') {
            setConnectionStatus('DEGRADED');
          }
        } catch {
          setConnectionStatus('OFFLINE');
        }
      }, 10000);
    } else {
      if (fallbackPollingRef.current) {
        clearInterval(fallbackPollingRef.current);
        fallbackPollingRef.current = null;
      }
    }

    return () => {
      if (fallbackPollingRef.current) {
        clearInterval(fallbackPollingRef.current);
      }
    };
  }, [connectionStatus, fetchNotifications, triggerRefresh]);

  // Global keyboard shortcuts (Cmd+K for search, Cmd+J for copilot)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const markNotificationsRead = async () => {
    try {
      await apiClient.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Error marking notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PlatformContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        liveEventPulse,
        connectionStatus,
        eventsPerSec,
        lastSyncTime,
        isDemoMode,
        setIsDemoMode,
        reconnectNow,
        dateRange,
        setDateRange,
        isSearchOpen,
        setIsSearchOpen,
        isCopilotOpen,
        setIsCopilotOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        refreshKey,
        triggerRefresh,
        markNotificationsRead,
        addToast,
        removeToast,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
