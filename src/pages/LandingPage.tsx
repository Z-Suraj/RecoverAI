import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Zap,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  Users,
  Play,
  Clock,
  ArrowUpRight,
  CreditCard,
  Building2,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../utils/formatters';
import { CONTEXT_IMAGES } from '../utils/avatarUtils';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { SafeImage } from '../components/common/SafeImage';

interface LandingPageProps {
  navigate: (path: string) => void;
  onDemoLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate, onDemoLogin }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation with Dynamic Scroll Backdrop */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/40'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">RecoverAI</span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                Autonomous Revenue Operations
              </span>
            </div>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300"
          >
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Trust</a>
            <button onClick={() => navigate('/developer')} className="hover:text-white transition-colors cursor-pointer">
              Developers
            </button>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center space-x-3"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemoLogin}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer group"
            >
              <span>View Live Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section with Layered Background Artwork, Photography & Floating Cards */}
      <section className="hero relative pt-12 pb-20 overflow-hidden border-b border-slate-800 min-h-[580px] flex items-center">
        {/* Background Image Layer */}
        <div
          className="hero-background absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none"
          style={{ backgroundImage: `url(${CONTEXT_IMAGES.merchantHeroBg})` }}
        />
        {/* Balanced Gradient Overlay */}
        <div className="hero-overlay absolute inset-0 z-1 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/40 pointer-events-none" />
        
        {/* Hero Content */}
        <div className="hero-content max-w-7xl mx-auto px-6 relative z-2 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content with Staggered Entrance */}
            <div className="lg:col-span-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Financial Operations & Payment Recovery Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
              >
                Recover revenue before it disappears.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl"
              >
                RecoverAI helps businesses identify at-risk revenue, understand why payments fail, and take controlled recovery actions before revenue is lost.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDemoLogin}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group"
                >
                  <span>Start Recovery (Live Demo)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-indigo-400" />
                  <span>Merchant Sign In</span>
                </motion.button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-4 flex items-center space-x-6 text-xs text-slate-400"
              >
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Merchant Policy Bounds</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>Full Audit Trail</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Zero Risk Demo</span>
                </span>
              </motion.div>
            </div>

            {/* Right Layered Photography & Floating Cards Composition */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900"
              >
                {/* Main Realistic Business Photography with slow imperceptible scale */}
                <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden bg-slate-950">
                  <SafeImage
                    src={CONTEXT_IMAGES.merchantOperator}
                    alt="E-commerce Operator at Workstation"
                    fallbackType="hero"
                    fallbackText="FinOps Recovery Control Center"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                </div>

                {/* Floating Card 1: REVENUE RECOVERED (Top Left) with gentle levitation */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: [0, -4, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.3 },
                    y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="absolute top-6 left-6 p-4 rounded-xl bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-md w-56"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Revenue Recovered
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>↑ 18.4%</span>
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    <AnimatedCounter value={148500} prefix="₹" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    112 payments rescued this week
                  </span>
                </motion.div>

                {/* Floating Card 2: Real-time Transaction Recovered (Bottom Right) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: [0, -3, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.5 },
                    y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
                  }}
                  className="absolute bottom-6 right-6 p-3.5 rounded-xl bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-md max-w-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">Payment Recovered</span>
                        <span className="text-[10px] text-slate-400 font-mono">2s ago</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          <AnimatedCounter value={4999} prefix="₹" />
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          TXN-82941
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Aarav Sharma • Smart UPI Switch
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Demo Merchants */}
      <section className="py-10 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by modern commerce platforms & high-volume merchants (Demo Sandbox)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-75">
            {['NovaCart India', 'CloudNest Retail', 'ByteMarket POS', 'Streamly Digital', 'UrbanBox Commerce'].map((brand) => (
              <span key={brand} className="text-sm md:text-base font-bold font-mono tracking-tight text-slate-300">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Section: "Revenue doesn't disappear all at once." */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        id="solutions"
        className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-800"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Photography with Metric Overlay */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
            <div className="relative h-80 w-full overflow-hidden bg-slate-950">
              <SafeImage
                src={CONTEXT_IMAGES.onlineShopping}
                alt="Online Cart Checkout Abandonment"
                fallbackType="context"
                fallbackText="Online Checkout Cart Rescue"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
            </div>
            {/* Metric Overlay Card */}
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">
                  At-Risk Revenue Detected Today
                </span>
                <span className="text-2xl font-black font-mono text-rose-400">
                  <AnimatedCounter value={248500} prefix="₹" />
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-300 block">184 Incomplete Carts</span>
                <span className="text-[10px] text-emerald-400">70.1% Recoverable</span>
              </div>
            </div>
          </div>

          {/* Problem & Solution Explanation */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
              The Real Cost of Payment Latency
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Revenue doesn't disappear all at once.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every day, up to 14% of high-intent transactions fail due to transient gateway timeouts, expired OTP windows, and sub-optimal UPI intent routing. Without automated recovery, customers abandon their purchases forever.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Unrecovered Silent Failures</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Traditional webhooks log the dropoff, but no intervention occurs. Merchant ad spend is wasted.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                  <Zap className="w-4 h-4" />
                  <span>RecoverAI Dynamic Retries</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant smart failovers and timed WhatsApp/SMS 1-click links recover transactions within minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How RecoverAI Works (4 Step Visual Cards with Stagger) */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        id="how-it-works"
        className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-800"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Autonomous Operations</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">How RecoverAI Works</p>
          <p className="text-xs text-slate-400 mt-2">
            A continuous four-stage closed loop designed for modern digital commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Detect',
              image: CONTEXT_IMAGES.detectWebhooks,
              desc: 'Continuously ingest payment webhooks across Razorpay, Stripe, and UPI gateways to catch failures in real-time.',
              tag: '14ms Telemetry',
            },
            {
              step: '02',
              title: 'Understand',
              image: CONTEXT_IMAGES.understandAi,
              desc: 'Diagnose failure causes using customer lifetime value, historical success rates, and bank gateway telemetry.',
              tag: 'CLV & Root Cause',
            },
            {
              step: '03',
              title: 'Recover',
              image: CONTEXT_IMAGES.recoverActions,
              desc: 'Trigger policy-bounded automated retries, smart routing switches, or personalized 1-click recovery channels.',
              tag: 'Smart Switch & UPI',
            },
            {
              step: '04',
              title: 'Measure',
              image: CONTEXT_IMAGES.measureRoi,
              desc: 'Quantify incremental recovered gross merchandise value, track recovery ROI, and run A/B policy experiments.',
              tag: '+24.8% Lift ROI',
            },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group shadow-xl"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  fallbackType="hero"
                  fallbackText={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 text-xs font-mono font-black text-indigo-300 bg-slate-950/90 px-2 py-0.5 rounded border border-slate-700 backdrop-blur-xs">
                  {item.step}
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800/80 backdrop-blur-xs">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Security, Trust & Governance Section */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        id="security"
        className="py-20 bg-slate-950 max-w-7xl mx-auto px-6"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Enterprise Governance</h2>
          <p className="text-3xl font-extrabold text-white">Policy-Controlled Security & Trust</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Policy-Controlled Recovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every automated action follows merchant-defined limits. Transactions over your custom floor limit require human operator approval.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Auditable Decisions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every recovery action, gateway diagnosis, and policy check is recorded in an immutable ledger with timestamps and actor tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Demo-Safe Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run continuous realistic simulation scenarios without risking real customer funds or spamming actual messaging endpoints.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-300">RecoverAI Platform</span>
            <span>— Autonomous Revenue Operations</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[11px] bg-slate-900 px-2.5 py-1 rounded text-slate-400 border border-slate-800">
              MERCHANT SANDBOX READY
            </span>
            <button onClick={onDemoLogin} className="hover:text-white text-indigo-400 font-semibold cursor-pointer">
              Open Dashboard →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
