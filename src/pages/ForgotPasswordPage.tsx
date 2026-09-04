import React, { useState } from 'react';
import { RotateCcw, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { VISUAL_ASSETS } from '../assets/images';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('surajkr12510@gmail.com');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
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
          Reset Merchant Access
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter your registered work email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-950 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400">
                A secure login link and temporary authorization token were sent to <span className="font-mono text-indigo-400">{email}</span>.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Work Email Address
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
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  Send Reset Link
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs font-medium text-slate-400 hover:text-white flex items-center justify-center space-x-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
