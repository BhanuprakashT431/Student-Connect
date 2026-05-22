import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, BookOpen } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Orbs */}
      <div className="bg-orb from-indigo-600/20 top-20 left-10 animate-float" />
      <div className="bg-orb from-violet-600/20 bottom-10 right-10" />

      {/* Main Login Card */}
      <div className="w-full max-w-md glass-card p-8 md:p-10 shadow-glow-indigo border-slate-800 bg-slate-900/40 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-glow-indigo mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-100 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1.5">Sign in to browse referrals and manage connections</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          {/* Display Login Errors */}
          {error && (
            <div className="flex items-start space-x-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs">
              <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full btn-primary flex items-center justify-center space-x-2 text-xs py-3 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoggingIn ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer Redirect */}
        <p className="text-center text-xs text-slate-400 mt-6">
          New to the portal?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 underline transition-colors">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};
