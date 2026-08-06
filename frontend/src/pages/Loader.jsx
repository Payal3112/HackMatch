import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/login'), 800); // Route directly to login with slight delay
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col items-center z-10">
        <div className="w-24 h-24 mb-12 relative flex items-center justify-center">
          <div className="absolute inset-0 border-[3px] border-indigo-600/30 rounded-2xl animate-[spin_4s_linear_infinite]"></div>
          <div className="absolute inset-2 border-[3px] border-indigo-500/50 rounded-xl animate-[spin_3s_linear_infinite_reverse]"></div>
          <Code2 size={40} className="text-indigo-400 animate-pulse drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
        </div>
        
        <div className="flex items-baseline gap-1 mb-4 text-white">
          <span className="text-3xl font-black tracking-tighter">HackMatch</span>
          <span className="text-indigo-500 font-bold">.AI</span>
        </div>

        <div className="text-indigo-400 text-sm tracking-[0.3em] font-medium mb-6 uppercase">
          Initializing Engine
        </div>
        
        <div className="flex items-center gap-4 w-64">
          <div className="h-[2px] flex-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.8)]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="text-indigo-300 text-xs font-mono font-bold w-8 text-right">
            {Math.min(progress, 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
