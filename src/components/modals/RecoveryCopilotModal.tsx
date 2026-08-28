import React, { useState, useRef, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { apiClient } from '../../api/client';
import { CONTEXT_IMAGES } from '../../utils/avatarUtils';
import { SafeImage } from '../common/SafeImage';
import {
  Sparkles,
  Send,
  User,
  X,
  ChevronRight,
  Loader2,
  Shield,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Activity,
  Layers,
  Users,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecoveryCopilotModalProps {
  navigate: (path: string) => void;
}

interface Message {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  suggestedActions?: string[];
  isError?: boolean;
  rawQuery?: string;
}

const QUICK_ACTIONS = [
  { label: 'Analyze failed transactions', icon: AlertTriangle },
  { label: 'Find highest recovery opportunity', icon: TrendingUp },
  { label: "Explain today's leakage", icon: Activity },
  { label: 'Check gateway health', icon: Layers },
  { label: 'Show recovery performance', icon: CheckCircle2 },
  { label: 'Identify risky customers', icon: Users },
];

export const RecoveryCopilotModal: React.FC<RecoveryCopilotModalProps> = ({ navigate }) => {
  const { isCopilotOpen, setIsCopilotOpen } = usePlatform();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    id: 'm1',
    sender: 'COPILOT',
    text: `Hello! I am your **RecoverAI Autonomous FinOps Copilot**.\n\nI continuously monitor real-time payment ingestion streams, diagnose gateway failure reasons, and execute smart retry protocols.\n\nSelect a quick analysis below or type any question:`,
    suggestedActions: [
      'Analyze failed transactions',
      'Find highest recovery opportunity',
      "Explain today's leakage",
      'Check gateway health',
      'Show recovery performance',
      'Identify risky customers',
    ],
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isCopilotOpen) {
      scrollToBottom();
    }
  }, [messages, isCopilotOpen, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'USER',
      text: textToSend,
    };

    // Immediately display user message
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLastFailedQuery(null);

    try {
      const response = await apiClient.queryCopilot(textToSend);
      const copilotMsg: Message = {
        id: `cop_${Date.now()}`,
        sender: 'COPILOT',
        text: response.answer,
        suggestedActions: response.suggestedActions || [
          'Review Recovery Queue',
          'Run New Simulation',
          'Inspect Gateway Health',
        ],
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      setLastFailedQuery(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'COPILOT',
          text: `⚠️ RecoverAI is temporarily unavailable. Please verify your connection or click Retry.`,
          isError: true,
          rawQuery: textToSend,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (query: string) => {
    handleSend(query);
  };

  const handleClearHistory = () => {
    setMessages([initialMessage]);
    setLastFailedQuery(null);
  };

  if (!isCopilotOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col"
        >
          {/* Header with Authentic Analyst Portrait */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                <SafeImage
                  src={CONTEXT_IMAGES.recoveryCopilot}
                  alt="FinTech Analyst Copilot"
                  fallbackType="avatar"
                  fallbackText="AI Copilot"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">RecoverAI FinOps Copilot</h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Payment Telemetry & Autonomous Recovery</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Pills Grid */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Instant Intelligence Actions:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((qa, i) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(qa.label)}
                    disabled={loading}
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold text-left transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{qa.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${m.sender === 'USER' ? 'justify-end' : ''}`}
              >
                {m.sender === 'COPILOT' && (
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-slate-300">
                    <SafeImage
                      src={CONTEXT_IMAGES.recoveryCopilot}
                      alt="Copilot"
                      fallbackType="avatar"
                      fallbackText="AI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'USER'
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : m.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.isError && m.rawQuery && (
                    <div className="mt-2.5 pt-2 border-t border-rose-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-700">Failed to complete query</span>
                      <button
                        onClick={() => handleRetry(m.rawQuery!)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}

                  {/* Scannable suggestions */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested Actions & Next Steps:
                      </p>
                      {m.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.includes('Recovery Queue') || action.includes('recovery opportunities') || action.includes('opportunity')) {
                              setIsCopilotOpen(false);
                              navigate('/recovery');
                            } else if (action.includes('Simulation') || action.includes('Simulate')) {
                              setIsCopilotOpen(false);
                              navigate('/simulation');
                            } else if (action.includes('Audit')) {
                              setIsCopilotOpen(false);
                              navigate('/audit');
                            } else if (action.includes('Customers') || action.includes('risky') || action.includes('prioritize')) {
                              setIsCopilotOpen(false);
                              navigate('/customers');
                            } else if (action.includes('Analytics') || action.includes('performance')) {
                              setIsCopilotOpen(false);
                              navigate('/analytics');
                            } else {
                              handleSend(action);
                            }
                          }}
                          className="w-full text-left p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 text-[11px] font-semibold transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                        >
                          <span className="truncate">{action}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'USER' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-700 p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                <span className="font-bold">Analyzing merchant telemetry & failure logs...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Safety Guard Note */}
          <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center space-x-1.5 text-[10px] text-slate-600">
            <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Autonomous retry actions strictly bounded by RecoveryPolicyEngine guardrails.</span>
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about revenue, failed payments, policies..."
                className="flex-1 bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

