import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Users, Zap, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white font-sans selection:bg-white/30">
      
      {/* NAVBAR */}
      <nav className="w-full border-b border-white/[0.05] sticky top-0 z-50 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="text-white" size={24} />
            <span className="text-xl font-bold tracking-tight">HackMatch</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/login" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-neutral-300 mb-8 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          System Online
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] text-gradient">
          Find your dream team.<br />
          Ship the impossible.
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          HackMatch connects you with elite developers and designers. Build products that break the internet without the friction of finding co-founders.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/login" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            Start Building <ArrowRight size={16} />
          </Link>
          <Link to="/dashboard" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <LayoutDashboard size={16} className="text-neutral-400" /> Browse Feed
          </Link>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="border-t border-white/[0.05] py-24 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-panel p-8">
              <div className="w-10 h-10 border border-white/[0.1] bg-white/[0.03] rounded-lg flex items-center justify-center mb-6">
                <Users size={20} className="text-neutral-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Targeted Recruiting</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Filter teams by the exact skills they are missing. Find a team that desperately needs your specific frontend or backend expertise.
              </p>
            </div>
            
            <div className="glass-panel p-8">
              <div className="w-10 h-10 border border-white/[0.1] bg-white/[0.03] rounded-lg flex items-center justify-center mb-6">
                <Zap size={20} className="text-neutral-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Applications</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Apply to teams with a single click. Leaders can review your profile and accept you instantly into their workspace.
              </p>
            </div>
            
            <div className="glass-panel p-8">
              <div className="w-10 h-10 border border-white/[0.1] bg-white/[0.03] rounded-lg flex items-center justify-center mb-6">
                <Terminal size={20} className="text-neutral-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Developer First</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Designed for builders. Connect your GitHub, showcase your portfolio, and find people who match your work ethic and tech stack.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
