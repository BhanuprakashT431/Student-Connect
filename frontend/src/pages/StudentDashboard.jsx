import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConnectionModal } from '../components/ConnectionModal';
import { Briefcase, Users, MessageSquare, Linkedin, Mail, ExternalLink, Search, Sparkles, Send, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

export const StudentDashboard = () => {
  const { authFetch } = useAuth();
  
  // Dashboard Tabs: 'opportunities' | 'directory' | 'requests'
  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [opportunities, setOpportunities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // Modal States
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Parallel fetches for standard responsiveness
      const [oppRes, empRes, reqRes] = await Promise.all([
        authFetch('/api/opportunities'),
        authFetch('/api/employees'),
        authFetch('/api/connections/my-requests')
      ]);

      if (!oppRes.ok || !empRes.ok || !reqRes.ok) {
        throw new Error('Failed to load portal dashboards data');
      }

      const oppData = await oppRes.json();
      const empData = await empRes.json();
      const reqData = await reqRes.json();

      setOpportunities(oppData);
      setEmployees(empData);
      setSentRequests(reqData);
    } catch (err) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Filter Functions
  const filteredOpps = opportunities.filter(opp => 
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.profile_data?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.profile_data?.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Background Glow Orbs */}
      <div className="bg-orb from-indigo-500/10 top-20 right-20 animate-float" />
      <div className="bg-orb from-emerald-500/10 bottom-20 left-20" />

      {/* Greeting Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 relative">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight">
            Elevate Your <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Career Network</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">Apply for jobs, connect with alumni, and secure mentorship referrals</p>
        </div>

        {/* Global Tab Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === 'opportunities' ? "Search jobs or companies..." :
              activeTab === 'directory' ? "Search mentors or companies..." : "Search pitches..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
          />
        </div>
      </div>

      {/* Main Glass Tab Navigation Controls */}
      <div className="flex border-b border-slate-800/80 mb-8 p-1 bg-slate-900/20 rounded-xl max-w-lg z-10 relative">
        <button
          onClick={() => { setActiveTab('opportunities'); setSearchTerm(''); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'opportunities'
              ? 'bg-slate-900 border border-slate-800 text-indigo-400 shadow-glow-indigo'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Opportunities</span>
        </button>
        <button
          onClick={() => { setActiveTab('directory'); setSearchTerm(''); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'directory'
              ? 'bg-slate-900 border border-slate-800 text-indigo-400 shadow-glow-indigo'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumni Directory</span>
        </button>
        <button
          onClick={() => { setActiveTab('requests'); setSearchTerm(''); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'requests'
              ? 'bg-slate-900 border border-slate-800 text-indigo-400 shadow-glow-indigo'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent Requests</span>
          {sentRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-1 block" />
          )}
        </button>
      </div>

      {/* Loading & Error Screens */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-xs text-slate-500">Loading resources...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-2xl text-xs text-center">
          <p className="font-semibold">Failed to fetch data</p>
          <p className="mt-1 opacity-80">{error}</p>
          <button onClick={loadDashboardData} className="btn-secondary text-xs mt-4">Retry Now</button>
        </div>
      ) : (
        <div className="z-10 relative">
          
          {/* TAB 1: OPPORTUNITIES VIEW */}
          {activeTab === 'opportunities' && (
            <div>
              {filteredOpps.length === 0 ? (
                <div className="glass-card text-center py-16 px-6">
                  <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-lg text-slate-200">No Opportunities Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">There are no job or internship opportunities matching your search query at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpps.map((opp) => (
                    <div key={opp.id} className="glass-card glass-card-hover p-6 flex flex-col justify-between">
                      <div>
                        {/* Upper Badge Line */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            opp.type === 'job' 
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {opp.type}
                          </span>
                        </div>
                        
                        <h3 className="font-display font-bold text-lg text-slate-100 leading-snug">{opp.title}</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">{opp.company}</p>
                        
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-4">
                          {opp.description}
                        </p>
                      </div>

                      {/* Action Request footer */}
                      <div className="border-t border-slate-800/80 pt-4 mt-6 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Self-Managed Referral</span>
                        <button 
                          onClick={() => {
                            // Automatically search or locate employee that posted
                            const match = employees.find(e => e.id === opp.posted_by);
                            if (match) {
                              handleOpenModal(match);
                            } else {
                              // If employee directory not fully populated, create temporary object
                              handleOpenModal({
                                id: opp.posted_by,
                                full_name: 'Opportunity Poster',
                                profile_data: { company: opp.company, title: 'Employer Representative' }
                              });
                            }
                          }}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
                        >
                          <span>Ask poster for referral</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALUMNI DIRECTORY VIEW */}
          {activeTab === 'directory' && (
            <div>
              {filteredEmployees.length === 0 ? (
                <div className="glass-card text-center py-16 px-6">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-lg text-slate-200">No Alumni Directory Listings</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">We couldn't find any registered employee or alumni guides matching your search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEmployees.map((emp) => {
                    const profile = emp.profile_data || {};
                    const isConnected = emp.connection_status === 'accepted';
                    const isPending = emp.connection_status === 'pending';
                    const isDeclined = emp.connection_status === 'declined';

                    return (
                      <div key={emp.id} className="glass-card glass-card-hover p-6 flex flex-col justify-between">
                        <div>
                          
                          {/* Profile Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-display font-bold text-base text-slate-100">{emp.full_name}</h3>
                              <p className="text-xs text-indigo-400 mt-0.5">
                                {profile.title || 'Alumni Partner'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                                {profile.company || 'Industry Leader'}
                              </p>
                            </div>
                            
                            {/* Connection Indicator Icon Badges */}
                            {isConnected && (
                              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Connected">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                            {isPending && (
                              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" title="Request Pending">
                                <Clock className="w-4 h-4" />
                              </span>
                            )}
                            {isDeclined && (
                              <span className="p-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20" title="Declined">
                                <XCircle className="w-4 h-4" />
                              </span>
                            )}
                          </div>

                          {/* Profile Bio */}
                          <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-3">
                            {profile.bio || "No professional overview bio provided by this alum. Send a request to establish connection."}
                          </p>

                          {/* SECURE DYNAMIC REVEAL LAYOUT */}
                          {isConnected && (
                            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
                              <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Unlocked Contact Credentials</p>
                              
                              <div className="flex items-center space-x-2 text-xs">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <a href={`mailto:${profile.contact_email || emp.email}`} className="text-slate-300 hover:text-indigo-400 transition-colors truncate">
                                  {profile.contact_email || emp.email}
                                </a>
                              </div>
                              
                              {profile.linkedin_url && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-400 flex items-center space-x-0.5 transition-colors truncate">
                                    <span className="truncate">View LinkedIn Profile</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-6 pt-4 border-t border-slate-800/80">
                          {emp.connection_status === 'none' ? (
                            <button
                              onClick={() => handleOpenModal(emp)}
                              className="w-full btn-primary flex items-center justify-center space-x-1.5 text-xs py-2"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Request Connection</span>
                            </button>
                          ) : (
                            <div className="w-full text-center py-2 bg-slate-950/40 rounded-xl border border-slate-800 text-[10px] font-semibold tracking-wide uppercase text-slate-500">
                              {isPending ? 'Referral Request Pending' : isDeclined ? 'Request Declined' : 'Successfully Connected'}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SENT REQUEST PIPELINE VIEW */}
          {activeTab === 'requests' && (
            <div>
              {sentRequests.length === 0 ? (
                <div className="glass-card text-center py-16 px-6">
                  <Send className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-lg text-slate-200">No Connection History</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">You haven't initiated connection referral pitches to any alumni yet. Access the directory to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((req) => {
                    const emp = req.employee || {};
                    const isAccepted = req.status === 'accepted';
                    const isPending = req.status === 'pending';
                    const isDeclined = req.status === 'declined';

                    return (
                      <div key={req.id} className="glass-card p-5 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                          
                          {/* Request Details Header */}
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-display font-bold text-base text-slate-200">{emp.full_name}</h3>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-400">
                              {emp.profile_data?.title || 'Alumni Partner'} at <span className="font-medium text-slate-300">{emp.profile_data?.company || 'Industry Partner'}</span>
                            </span>
                          </div>

                          {/* Pitch Snippet */}
                          <div className="mt-3 bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide flex items-center space-x-1.5 mb-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Your pitch</span>
                            </p>
                            <p className="text-xs text-slate-400 italic font-sans leading-relaxed">
                              "{req.pitch}"
                            </p>
                          </div>

                          {/* Reveal Section inside Pipeline */}
                          {isAccepted && (
                            <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-wrap gap-x-6 gap-y-2">
                              <div className="flex items-center space-x-2 text-xs">
                                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-slate-400">Email:</span>
                                <a href={`mailto:${emp.profile_data?.contact_email}`} className="text-emerald-300 hover:underline">
                                  {emp.profile_data?.contact_email}
                                </a>
                              </div>
                              {emp.profile_data?.linkedin_url && (
                                <div className="flex items-center space-x-2 text-xs">
                                  <Linkedin className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-slate-400">LinkedIn:</span>
                                  <a href={emp.profile_data?.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline flex items-center space-x-0.5">
                                    <span>Profile</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Status Column Badge */}
                        <div className="flex flex-col items-start md:items-end justify-between self-stretch">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            isAccepted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            isPending ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {req.status}
                          </span>
                          <span className="text-[10px] text-slate-600 mt-2 md:mt-0">
                            Submitted {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Connection pitch submission modal */}
      <ConnectionModal
        isOpen={isModalOpen}
        employee={selectedEmployee}
        onClose={() => { setIsModalOpen(false); setSelectedEmployee(null); }}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
