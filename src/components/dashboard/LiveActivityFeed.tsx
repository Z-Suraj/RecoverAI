import React, { useState, useEffect } from 'react';
import { formatINR, formatRelativeTime } from '../../utils/formatters';
import { CheckCircle2, AlertTriangle, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveEvent {
  id: string;
  type: 'RECOVERED' | 'DETECTED' | 'STARTED' | 'RETRY';
  title: string;
  amount: number;
  customer: string;
  channel: string;
  timestamp: string;
}

interface LiveActivityFeedProps {
  onSelectEvent?: (eventId: string) => void;
}

const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: 'evt_1',
    type: 'RECOVERED',
    title: 'Payment recovered via Smart UPI Switch',
    amount: 4999,
    customer: 'Aarav Sharma',
    channel: 'Razorpay UPI',
    timestamp: new Date(Date.now() - 1000 * 20).toISOString(),
  },
  {
    id: 'evt_2',
    type: 'DETECTED',
    title: 'Recovery opportunity detected (504 Timeout)',
    amount: 8450,
    customer: 'Sneha Patel',
    channel: 'HDFC SmartHub',
    timestamp: new Date(Date.now() - 1000 * 55).toISOString(),
  },
  {
    id: 'evt_3',
    type: 'STARTED',
    title: 'Subscription recovery WhatsApp link sent',
    amount: 12999,
    customer: 'Rohan Mehta',
    channel: 'Stripe Card',
    timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
  },
  {
    id: 'evt_4',
    type: 'RECOVERED',
    title: 'Abandoned cart checkout recovered',
    amount: 2499,
    customer: 'Priya Nair',
    channel: 'PhonePe PG',
    timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
  },
];

const STREAM_POOL: Omit<LiveEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'RECOVERED',
    title: 'OTP expiry auto-rescued via 1-click fallback',
    amount: 3899,
    customer: 'Vikram Singh',
    channel: 'Paytm UPI',
  },
  {
    type: 'DETECTED',
    title: 'Card 3DS timeout auto-detected',
    amount: 14500,
    customer: 'Ananya Deshmukh',
    channel: 'Stripe Global',
  },
  {
    type: 'STARTED',
    title: 'Autonomous smart retry scheduled',
    amount: 6200,
    customer: 'Kavita Iyer',
    channel: 'Razorpay Direct',
  },
  {
    type: 'RECOVERED',
    title: 'Overdue invoice recovered via Instant UPI Link',
    amount: 9800,
    customer: 'Aditya Verma',
    channel: 'Cashfree PG',
  },
];

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = () => {
  const [events, setEvents] = useState<LiveEvent[]>(INITIAL_EVENTS);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // Periodically ingest a subtle new real-time event
  useEffect(() => {
    if (!isLiveActive) return;

    const timer = setInterval(() => {
      const template = STREAM_POOL[Math.floor(Math.random() * STREAM_POOL.length)];
      const newEvent: LiveEvent = {
        ...template,
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toISOString(),
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 5)]);
    }, 9000);

    return () => clearInterval(timer);
  }, [isLiveActive]);

  return (
    <div className="bento-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-mono">
            Live Stream Feed
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Real-Time Ingestion</span>
      </div>

      {/* Stream List with Layout Animations */}
      <div className="space-y-2.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            let badgeBg = 'bg-slate-100 text-slate-700';
            let Icon = RotateCcw;
            let amountColor = 'text-slate-900';

            if (event.type === 'RECOVERED') {
              badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              Icon = CheckCircle2;
              amountColor = 'text-emerald-600';
            } else if (event.type === 'DETECTED') {
              badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
              Icon = AlertTriangle;
              amountColor = 'text-rose-600';
            } else if (event.type === 'STARTED') {
              badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              Icon = Sparkles;
              amountColor = 'text-indigo-600';
            }

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${badgeBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate leading-snug">{event.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {event.customer} • {event.channel}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-xs ${amountColor} block`}>
                    {event.type === 'RECOVERED' ? `+${formatINR(event.amount)}` : formatINR(event.amount)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
