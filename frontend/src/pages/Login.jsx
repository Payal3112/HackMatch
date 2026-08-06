import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Leaf } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function Login() {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot_password'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  const handleSuccessRedirect = () => {
    setShowAnimation(true);
    setTimeout(() => {
      navigate('/workspace');
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (authMode === 'register') {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, skills: ["React", "Python"], github_handle: githubHandle }) 
        });
        if (!res.ok) throw new Error("Registration failed");
        
        // Auto login after register
        const resLogin = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!resLogin.ok) throw new Error("Invalid credentials");
        const data = await resLogin.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        handleSuccessRedirect();
        
      } else if (authMode === 'forgot_password') {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, new_password: password }) 
        });
        if (!res.ok) throw new Error("User not found or reset failed");
        setSuccessMsg("Password reset successfully! You can now log in.");
        setAuthMode('login');
        setPassword('');
        
      } else {
        const resLogin = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!resLogin.ok) throw new Error("Invalid credentials");
        const data = await resLogin.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        handleSuccessRedirect();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex text-gray-900 font-sans animate-fade-in selection:bg-purple-500/30">
      
      {/* Login Animation Overlay */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/90 backdrop-blur-md">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400 animate-[slideUpFade_1s_ease-out_forwards]" style={{ fontFamily: "Georgia, serif" }}>
            Let's touch some grass
          </h1>
          <style>{`
            @keyframes slideUpFade {
              0% { opacity: 0; transform: translateY(40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-white/40 backdrop-blur-3xl z-10">
        <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-16">
            <BrainCircuit className="text-purple-600" size={32} />
            <span className="text-xl font-bold tracking-widest uppercase text-gray-900">HackMatch</span>
          </div>

          <h2 className="text-4xl font-black mb-2 tracking-tight text-gray-900">
            {authMode === 'register' ? "Create Account" : authMode === 'forgot_password' ? "Reset Password" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500 mb-10 font-medium">
            {authMode === 'register' ? "Register your profile to find your ideal hackathon team." : authMode === 'forgot_password' ? "Enter your email to set a new password." : "Log in to access your workspace and teams."}
          </p>

          {error && <div className="p-3 mb-6 bg-red-100 border border-red-200 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
          {successMsg && <div className="p-3 mb-6 bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2 ml-1">Display Name</label>
                  <input 
                    type="text" required
                    className="w-full bg-white/70 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder-gray-400"
                    placeholder="e.g. Neo"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2 ml-1">GitHub Handle</label>
                  <input 
                    type="text" required
                    className="w-full bg-white/70 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder-gray-400"
                    placeholder="e.g. github-username"
                    value={githubHandle} onChange={(e) => setGithubHandle(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2 ml-1">Email Address</label>
              <input 
                type="email" required
                className="w-full bg-white/70 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder-gray-400"
                placeholder="developer@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2 ml-1 pr-1">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500">{authMode === 'forgot_password' ? 'New Password' : 'Password'}</label>
                {authMode === 'login' && (
                  <button type="button" onClick={() => { setAuthMode('forgot_password'); setError(null); setSuccessMsg(null); }} className="text-[11px] font-bold text-purple-600 hover:text-purple-700 transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                type="password" required
                className="w-full bg-white/70 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder-gray-400"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full mt-8 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] hover:scale-[1.02] text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 text-sm transition-all shadow-[0_10px_20px_rgba(147,51,234,0.2)] disabled:opacity-50 disabled:transform-none"
            >
              {loading ? <span className="animate-pulse">Processing...</span> : <>{authMode === 'register' ? "Create Account" : authMode === 'forgot_password' ? "Reset Password" : "Log In"} <ArrowRight size={16} /></>}
            </button>
            

          </form>

          <div className="mt-8 text-center text-sm font-medium text-gray-500 flex flex-col gap-2">
            {authMode !== 'login' ? (
              <button onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }} className="font-bold text-purple-600 hover:text-purple-700 transition-colors">
                Back to Log In
              </button>
            ) : (
              <div>
                Don't have an account? 
                <button onClick={() => { setAuthMode('register'); setError(null); setSuccessMsg(null); }} className="ml-2 font-bold text-purple-600 hover:text-purple-700 transition-colors">
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Visual Panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-24 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 overflow-hidden text-white border-l border-white/10">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-fuchsia-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-indigo-500/30 rounded-t-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative">
             <div className="absolute inset-0 rounded-3xl border border-white/30 animate-pulse opacity-50"></div>
             <Leaf size={40} className="text-pink-500 drop-shadow-md" />
          </div>
          <h1 className="text-5xl font-black leading-tight mb-8 text-white drop-shadow-md tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            HackMatch
          </h1>
          
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 cursor-default mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
            <span className="text-white/90 font-bold tracking-wide text-sm drop-shadow-sm">
              <span className="font-black text-white">Match. Hack. Win.</span> Build your dream hackathon team today.
            </span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
