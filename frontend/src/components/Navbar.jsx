import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Award, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="w-full sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-glow-indigo">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">
              Altaria Connect
            </span>
          </div>

          {/* Right Profile / Logout Options */}
          <div className="flex items-center space-x-4">
            
            {/* User Meta Card */}
            <div className="hidden sm:flex items-center space-x-3 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="p-1 rounded-lg bg-slate-800 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-200 leading-tight">{user.full_name}</p>
                <div className="flex items-center mt-0.5 space-x-1">
                  <Award className="w-3 h-3 text-slate-400" />
                  <span className={`capitalize font-medium text-[10px] ${
                    user.role === 'employee' ? 'text-violet-400' : 'text-emerald-400'
                  }`}>
                    {user.role === 'employee' ? 'Alumni / Employee' : 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro role badge for small mobile devices */}
            <span className={`sm:hidden text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
              user.role === 'employee' 
                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {user.role === 'employee' ? 'Alumni' : 'Student'}
            </span>

            {/* Logout Button */}
            <button 
              onClick={logout} 
              className="flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 text-sm font-medium border border-slate-800 hover:border-rose-500/20 bg-slate-900/40 hover:bg-rose-500/5 px-3 py-2 rounded-xl transition-all duration-200"
              title="Logout from Account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            
          </div>
        </div>
      </div>
    </nav>
  );
};
