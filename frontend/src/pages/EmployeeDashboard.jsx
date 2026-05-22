import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MessageSquare, Check, X, FileText, Sparkles, GraduationCap, AlertCircle, Bookmark, PlusCircle, CheckCircle2 } from 'lucide-react';

export const EmployeeDashboard = () => {
  const { authFetch, user } = useAuth();
  
  // Data lists
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myPostings, setMyPostings] = useState([]);
  
  // Form variables
  const [oppTitle, setOppTitle] = useState('');
  const [oppCompany, setOppCompany] = useState(user?.profile_data?.company || '');
  const [oppType, setOppType] = useState('job'); // 'job' | 'internship'
  const [oppDescription, setOppDescription] = useState('');
  
  // UI metrics
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadEmployeeData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [reqRes, oppRes] = await Promise.all([
        authFetch('/api/connections/pending'),
        authFetch('/api/opportunities')
      ]);

      if (!reqRes.ok || !oppRes.ok) {
        throw new Error('Failed to load employee pipeline data');
      }

      const reqData = await reqRes.json();
      const oppData = await oppRes.json();

      setPendingRequests(reqData);
      
      // Filter opportunities posted by this employee
      const filtered = oppData.filter(opp => opp.posted_by === user.id);
      setMyPostings(filtered);
    } catch (err) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const handleAction = async (requestId, statusValue) => {
    try {
      const res = await authFetch(`/api/connections/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusValue })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update request status');
      }

      // Re-fetch pipeline after successful status update
      loadEmployeeData();
    } catch (err) {
      alert(`Error updating connection: ${err.message}`);
    }
  };

  const handleCreatePosting = async (e) => {
    e.preventDefault();
    if (!oppTitle || !oppCompany || !oppDescription) {
      setError('Please provide all opportunity details.');
      return;
    }

    setFormSubmitting(true);
    setError('');
    setFormSuccess('');

    try {
      const res = await authFetch('/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: oppTitle.trim(),
          company: oppCompany.trim(),
          type: oppType,
          description: oppDescription.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to publish opportunity');
      }

      setFormSuccess('Opportunity published successfully!');
      setOppTitle('');
      setOppDescription('');
      
      // Refresh local posts list
      loadEmployeeData();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Background orbs */}
      <div className="bg-orb from-violet-500/10 top-20 left-20 animate-float" />
      <div className="bg-orb from-indigo-500/10 bottom-20 right-20" />

      {/* Title Header Banner */}
      <div className="mb-8 z-10 relative">
        <div className="inline-flex items-center space-x-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Alumni Workspace</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight">
          Support the <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Next Generation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5">Manage referral pitches, accept connection requests, and publish new opportunities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
        
        {/* LEFT COMPONENT COLUMN (60%): PENDING PIPELINE & MY POSTS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section: Connection Requests */}
          <div className="glass-card p-6 border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="font-display font-bold text-lg text-slate-200">Pending Referral Pitches</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {pendingRequests.length} requests
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-8 text-center text-xs text-slate-500">
                <Bookmark className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-slate-400">All caught up!</p>
                <p className="mt-0.5">Incoming referral pitches from students will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => {
                  const student = req.student || {};
                  return (
                    <div key={req.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
                      
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-sm text-slate-200">{student.full_name}</p>
                            <p className="text-[10px] text-slate-400">
                              {student.profile_data?.title || 'Student'} • {student.profile_data?.company || 'University'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAction(req.id, 'declined')}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/5 transition-all"
                            title="Decline request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'accepted')}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 bg-slate-900/60 hover:bg-emerald-500/5 transition-all"
                            title="Accept request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Pitch container */}
                      <div className="mt-3.5 bg-slate-900/50 border border-slate-800/60 p-3.5 rounded-xl">
                        <div className="flex items-center space-x-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wide mb-1">
                          <FileText className="w-3 h-3" />
                          <span>Student pitch</span>
                        </div>
                        <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                          "{req.pitch}"
                        </p>
                      </div>
                      
                      <div className="text-[9px] text-slate-600 mt-2 text-right">
                        Received {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: My Opportunity Postings */}
          <div className="glass-card p-6 border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="font-display font-bold text-lg text-slate-200">My Opportunity Postings</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {myPostings.length} active
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : myPostings.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-8 text-center text-xs text-slate-500">
                <Briefcase className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-slate-400">No active posts</p>
                <p className="mt-0.5">Use the adjacent panel to publish job opportunities.</p>
              </div>
            ) : (
              <div className="space-y-4.5">
                {myPostings.map((opp) => (
                  <div key={opp.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-slate-200 text-sm leading-snug">{opp.title}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        opp.type === 'job' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{opp.company}</p>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT FORM COLUMN (40%): CREATE NEW POSTING */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border-slate-800/80 sticky top-20 bg-slate-900/40">
            
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-200">Post Opportunity</h2>
            </div>

            <form onSubmit={handleCreatePosting} className="space-y-4.5">
              
              {/* Job Title */}
              <div>
                <label htmlFor="oppTitle" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Opportunity Title
                </label>
                <input
                  id="oppTitle"
                  type="text"
                  required
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="e.g. Frontend Engineering Intern"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="oppCompany" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company / Organization
                </label>
                <input
                  id="oppCompany"
                  type="text"
                  required
                  value={oppCompany}
                  onChange={(e) => setOppCompany(e.target.value)}
                  placeholder="e.g. Acme Tech"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                />
              </div>

              {/* Opportunity Type toggles */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Opportunity Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOppType('job')}
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      oppType === 'job'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700/80 hover:bg-slate-900/60'
                    }`}
                  >
                    Full-Time Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setOppType('internship')}
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      oppType === 'internship'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700/80 hover:bg-slate-900/60'
                    }`}
                  >
                    Internship
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="oppDescription" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description & Requirements
                </label>
                <textarea
                  id="oppDescription"
                  rows={4}
                  required
                  value={oppDescription}
                  onChange={(e) => setOppDescription(e.target.value)}
                  placeholder="Describe roles, tasks, stack configurations, and application requirements..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors resize-none"
                />
              </div>

              {/* Success Notification */}
              {formSuccess && (
                <div className="flex items-start space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Error Notification */}
              {error && !formSuccess && (
                <div className="flex items-start space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
                  <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full btn-primary flex items-center justify-center space-x-2 text-xs py-2.5 mt-2"
              >
                <span>{formSubmitting ? 'Publishing Opportunity...' : 'Publish Opportunity'}</span>
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
