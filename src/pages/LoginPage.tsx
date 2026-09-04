import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RotateCcw, ArrowRight, ShieldCheck, Zap, Lock, Mail } from 'lucide-react';
import { VISUAL_ASSETS } from '../assets/images';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('surajkr12510@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoRole: string) => {
    let demoEmail = 'surajkr12510@gmail.com';
    if (demoRole === 'FINANCE') demoEmail = 'priya.finance@novacart.in';
    if (demoRole === 'ADMIN') demoEmail = 'ananya.vp@novacart.in';

    setEmail(demoEmail);
    setLoading(true);
    try {
      await login(demoEmail);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-600/40 border border-slate-700/80 bg-slate-950 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            title="Return to Home"
          >
            <img
              src={VISUAL_ASSETS.brandLogo}
              alt="RecoverAI Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Sign in to RecoverAI
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Autonomous FinOps & Revenue Recovery Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-950 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {/* 1-Click Quick Demo Sign-ins */}
          <div className="mb-6 p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-2">
              ⚡ 1-Click Instant Demo Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('OPS')}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
              >
                <span>Ops Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('FINANCE')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 border border-slate-700 transition-all"
              >
                <span>Finance Lead</span>
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Merchant Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="suraj@novacart.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-700 rounded bg-slate-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                  Remember merchant workspace
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Authenticating with Policy Gateway...' : 'Sign in to Workspace'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <p className="text-xs text-slate-400">
              New merchant organization?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-bold text-indigo-400 hover:text-indigo-300"
              >
                Create Workspace
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
