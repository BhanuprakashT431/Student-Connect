import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, X, MessageSquare, AlertCircle } from 'lucide-react';

export const ConnectionModal = ({ employee, isOpen, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [pitch, setPitch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !employee) return null;

  const charLimit = 300;
  const charsRemaining = charLimit - pitch.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pitch.trim()) {
      setError('Please write a short pitch to introduce yourself.');
      return;
    }
    if (pitch.length > charLimit) {
      setError(`Your pitch must be within ${charLimit} characters.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await authFetch('/api/connections', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: employee.id,
          pitch: pitch.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit connection request');
      }

      setPitch('');
      onSuccess(); // Triggers reload on parent directory
      onClose();   // Clones active modal
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Modal Container */}
      <div className="w-full max-w-lg glass-card p-6 md:p-8 animate-float shadow-glow-indigo border-slate-700/60 bg-slate-900/90 relative">
        
        {/* Absolute Close Header Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-100">Request Connection</h3>
            <p className="text-xs text-slate-400">Introduce yourself to secure a career referral</p>
          </div>
        </div>

        {/* Target Profile Summary */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-6">
          <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Target Mentor</p>
          <p className="font-display font-semibold text-slate-200 text-base mt-0.5">{employee.full_name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {employee.profile_data.title || 'Alumni Partner'} at{' '}
            <span className="text-slate-300 font-medium">{employee.profile_data.company || 'Industry Leader'}</span>
          </p>
        </div>

        {/* Pitch Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pitch" className="text-xs font-semibold text-slate-300">
                Your Pitch
              </label>
              <span className={`text-[10px] font-bold ${
                charsRemaining < 30 ? 'text-amber-400' : charsRemaining < 0 ? 'text-rose-400' : 'text-slate-500'
              }`}>
                {charsRemaining} / {charLimit} chars left
              </span>
            </div>
            
            <textarea
              id="pitch"
              rows={4}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Hi! I am super interested in your work at the company. I have built three full-stack apps and would love to ask a couple of quick questions about your career journey. Would love to connect!"
              className={`w-full bg-slate-950 border ${
                charsRemaining < 0 ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } focus:outline-none focus:ring-1 ${
                charsRemaining < 0 ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'
              } rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 transition-colors duration-200 resize-none`}
            />
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="flex items-start space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || charsRemaining < 0}
              className="btn-primary flex items-center space-x-2 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Referral Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
