import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { usePlatform } from '../context/PlatformContext';
import { WebhookIngestionVisual } from '../components/dashboard/WebhookIngestionVisual';
import { VISUAL_ASSETS } from '../assets/images';
import { SafeImage } from '../components/common/SafeImage';
import {
  Code2,
  Key,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Zap,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Server,
  Play
} from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  const { addToast, triggerRefresh } = usePlatform();
  const [keys, setKeys] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [eventType, setEventType] = useState<string>('payment.failed');
  const [payloadText, setPayloadText] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [responseLog, setResponseLog] = useState<any>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'CURL' | 'NODE' | 'PYTHON' | 'GO'>('NODE');

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await apiClient.getDeveloperKeys();
        setKeys(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKeys();
  }, []);

  const samplePayloads: Record<string, any> = {
    'payment.failed': {
      event: 'payment.failed',
      timestamp: new Date().toISOString(),
      payload: {
        transaction_id: `TXN-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
        amount_inr: 6499,
        currency: 'INR',
        gateway: 'Razorpay',
        customer: {
          name: 'Vikram Malhotra',
          email: 'vikram.m@zenithretail.in',
          phone: '+91 98112 44321',
        },
        payment_method: 'UPI',
        error_code: 'BANK_TIMEOUT',
        error_description: 'Issuer bank did not respond within 45s SLA',
      },
    },
    'checkout.abandoned': {
      event: 'checkout.abandoned',
      timestamp: new Date().toISOString(),
      payload: {
        transaction_id: `CHK-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
        amount_inr: 3299,
        currency: 'INR',
        gateway: 'Shopify / Cashfree',
        customer: {
          name: 'Meera Nambiar',
          email: 'meera.n@keralacrafts.org',
          phone: '+91 94471 22890',
        },
        payment_method: 'UPI',
        error_code: 'CUSTOMER_ABANDONED',
        error_description: 'User exited 3DS authentication screen',
      },
    },
    'subscription.payment_failed': {
      event: 'subscription.payment_failed',
      timestamp: new Date().toISOString(),
      payload: {
        transaction_id: `SUB-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
        amount_inr: 12500,
        currency: 'INR',
        gateway: 'Stripe',
        customer: {
          name: 'TechMatrix Systems',
          email: 'finance@techmatrix.io',
          phone: '+91 99001 88712',
        },
        payment_method: 'CARD',
        error_code: 'EXPIRED_CARD',
        error_description: 'Stored recurring token expired on bank side',
      },
    },
  };

  useEffect(() => {
    setPayloadText(JSON.stringify(samplePayloads[eventType], null, 2));
  }, [eventType]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendWebhook = async () => {
    setSending(true);
    setResponseLog(null);
    try {
      const parsed = JSON.parse(payloadText);
      const res = await apiClient.simulateWebhook(parsed);
      setResponseLog(res);
      triggerRefresh();
      addToast({
        type: 'success',
        title: 'Webhook Ingested & AI Diagnosed',
        message: `Opportunity ${res.opportunity?.id || ''} created with autonomous strategy.`,
      });
    } catch (err: any) {
      setResponseLog({ error: err.message });
      addToast({
        type: 'error',
        title: 'Webhook Ingestion Failed',
        message: err.message,
      });
    } finally {
      setSending(false);
    }
  };

  const codeSnippets = {
    NODE: `import { RecoverAI } from '@recoverai/sdk';

const recover = new RecoverAI({
  apiKey: process.env.RECOVERAI_SECRET_KEY,
});

// Ingest webhook event
app.post('/webhooks/payment', async (req, res) => {
  const event = req.body;
  const result = await recover.events.ingest(event);
  
  console.log('AI Diagnosis:', result.diagnosis);
  res.json({ received: true });
});`,
    PYTHON: `from recoverai import RecoverAI
import os

client = RecoverAI(api_key=os.environ.get("RECOVERAI_SECRET_KEY"))

# Ingest failed payment event
response = client.events.ingest({
    "transaction_id": "TXN_98412",
    "amount_inr": 6499,
    "gateway": "Razorpay",
    "error_code": "BANK_TIMEOUT"
})

print(f"Recovery Opportunity: {response.opportunity_id}")`,
    CURL: `curl -X POST https://api.recoverai.com/v1/events \\
  -H "Authorization: Bearer pk_live_recover_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "payment.failed",
    "transaction_id": "TXN_77412",
    "amount_inr": 4999,
    "error_code": "BANK_TIMEOUT"
  }'`,
    GO: `package main

import (
  "fmt"
  "github.com/recoverai/recoverai-go"
)

func main() {
  client := recoverai.NewClient("pk_live_recover_...")
  opp, err := client.Events.Ingest(recoverai.EventParams{
    TransactionID: "TXN_88120",
    AmountINR:     5000,
    Gateway:       "Razorpay",
  })
  if err != nil {
    panic(err)
  }
  fmt.Println("Opportunity created:", opp.ID)
}`,
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner with Photorealistic Developer Datacenter Background */}
      <div className="bento-card relative overflow-hidden p-6 bg-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-800 shadow-lg">
        {/* Photorealistic Developer Cloud Datacenter Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <SafeImage
            src={VISUAL_ASSETS.developerTerminal}
            alt="Cloud Engineering & API Datacenter"
            fallbackType="hero"
            className="w-full h-full object-cover object-right md:object-center opacity-65 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shadow-inner shrink-0">
            <Code2 className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">Developer API & Webhook Ingestion</h2>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.4 REST & Webhooks
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Cryptographically signed API credentials, interactive real-time failure simulation webhooks, and production SDK client bindings.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys Bento Card */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <Key className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Authentication & Signing Secrets</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Publishable API Key</span>
              <span className="font-mono text-slate-900 font-bold mt-0.5 block">{keys?.publishableKey || 'pk_test_rec_994821a8'}</span>
            </div>
            <button
              onClick={() => copyToClipboard(keys?.publishableKey || 'pk_test_rec_994821a8', 'pk')}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Copy Key"
            >
              {copiedKey === 'pk' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Webhook Signing Secret</span>
              <span className="font-mono text-slate-900 font-bold mt-0.5 block">
                {showSecret ? 'whsec_991823901b8a1c90df81e' : keys?.webhookSecretMasked || 'whsec_••••••••••••••••••••'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                title={showSecret ? 'Hide secret' : 'Reveal secret'}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard('whsec_991823901b8a1c90df81e', 'wh')}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Copy Secret"
              >
                {copiedKey === 'wh' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Ingestion Architecture & Real-Time Engine Visual */}
      <div className="bento-card p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-xl">
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">Real-Time Ingestion Architecture Visualizer</h3>
              <p className="text-[11px] text-slate-400">Live multi-gateway webhook interception, routing, and diagnostic stream</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800/80">
            HMAC-SHA256 Verified
          </span>
        </div>
        <div className="p-3 sm:p-5 bg-slate-950">
          <WebhookIngestionVisual idPrefix="dev-ingest-" />
        </div>
      </div>

      {/* Interactive Webhook Simulator & Response Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Webhook Dispatcher */}
        <div className="lg:col-span-7 bento-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Live Webhook Simulator</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                POST /api/webhooks/ingest
              </span>
            </div>

            {/* Event selector */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Pre-built Payload Scenarios</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'payment.failed', label: 'UPI Bank Timeout' },
                  { id: 'checkout.abandoned', label: 'Cart Abandoned' },
                  { id: 'subscription.payment_failed', label: 'Card Expired' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEventType(item.id)}
                    className={`p-2 rounded-lg text-left text-xs font-bold border transition-all cursor-pointer ${
                      eventType === item.id
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code editor textarea */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">JSON Payload</label>
              <textarea
                rows={9}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setPayloadText(JSON.stringify(samplePayloads[eventType], null, 2))}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Reset to default
            </button>
            <button
              onClick={handleSendWebhook}
              disabled={sending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
              <span>{sending ? 'Dispatching & Ingesting...' : 'Dispatch Webhook Event'}</span>
            </button>
          </div>
        </div>

        {/* Live Response Inspector */}
        <div className="lg:col-span-5 bento-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">AI Diagnostic Response</h3>
              </div>
              {responseLog && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  HTTP 200 OK
                </span>
              )}
            </div>

            {responseLog ? (
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Opportunity Created
                  </span>
                  <span className="font-mono font-bold text-emerald-950 text-sm mt-0.5 block">
                    {responseLog.opportunity?.id || 'OPP-REC-LIVE'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Raw Processing Output
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-52 border border-slate-800">
                    {JSON.stringify(responseLog, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <Server className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Awaiting Webhook Trigger</p>
                <p className="text-[11px] text-slate-400">
                  Click "Dispatch Webhook Event" on the left to test live AI ingestion and autonomous diagnostic pipelines.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Snippets Tabs */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">SDK Quickstart & Integration Snippets</h3>
            <p className="text-xs text-slate-500">Copy pre-configured code to ingest payment events from your backend.</p>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['NODE', 'PYTHON', 'CURL', 'GO'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeCodeTab === tab ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {codeSnippets[activeCodeTab]}
          </pre>
          <button
            onClick={() => copyToClipboard(codeSnippets[activeCodeTab], 'snippet')}
            className="absolute right-3 top-3 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer border border-slate-700"
          >
            {copiedKey === 'snippet' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
