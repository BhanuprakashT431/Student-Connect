import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserCheck, AlertCircle, BookOpen, Briefcase, GraduationCap, Globe, Link2 } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Basic states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'employee'
  
  // Profile specific states (Student)
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('');
  
  // Profile specific states (Employee)
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Common profile state
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all core credentials.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsRegistering(true);
    setError('');

    // Package profile_data based on role selection
    const profileData = {};
    profileData.bio = bio.trim();

    if (role === 'student') {
      profileData.title = major ? `${major} Student` : 'Student';
      profileData.company = gradYear ? `Class of ${gradYear}` : 'University';
      profileData.major = major.trim();
      profileData.grad_year = gradYear.trim();
    } else {
      profileData.title = title.trim() || 'Alumni Partner';
      profileData.company = company.trim() || 'Industry Member';
      profileData.linkedin_url = linkedinUrl.trim();
      profileData.contact_email = contactEmail.trim() || email;
    }

    const res = await register(fullName, email, password, role, profileData);
    if (res.success) {
      // Navigate to login after successful register
      navigate('/login');
    } else {
      setError(res.error || 'Registration failed. Please check your fields.');
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Orbs */}
      <div className="bg-orb from-indigo-600/20 top-20 right-10" />
      <div className="bg-orb from-violet-600/20 bottom-10 left-10 animate-float" />

      {/* Register Card */}
      <div className="w-full max-w-2xl glass-card p-8 md:p-10 shadow-glow-indigo border-slate-800 bg-slate-900/40 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-glow-indigo mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-100 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-400 mt-1.5">Join a growing network of students and mentoring alumni</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="jane.doe@university.edu"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Password
            </label>
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
                placeholder="Password (minimum 6 characters)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          {/* Role Custom Tab Selectors */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Student Option */}
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  role === 'student'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200 shadow-glow-indigo'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/60'
                }`}
              >
                <GraduationCap className={`w-6 h-6 mb-2 ${role === 'student' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Student Account</span>
                <span className="text-[10px] opacity-75 mt-0.5">Find jobs & request referrals</span>
              </button>

              {/* Alumni Option */}
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  role === 'employee'
                    ? 'border-violet-500 bg-violet-500/10 text-violet-200 shadow-glow-violet'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/60'
                }`}
              >
                <Briefcase className={`w-6 h-6 mb-2 ${role === 'employee' ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Alumni / Employee</span>
                <span className="text-[10px] opacity-75 mt-0.5">Post jobs & support students</span>
              </button>
              
            </div>
          </div>

          {/* Dynamic Role-Based Parameters */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl transition-all duration-300">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              {role === 'student' ? 'Student Profile Details' : 'Professional Profile Details'}
            </h4>

            {role === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Major */}
                <div>
                  <label htmlFor="major" className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Course / Major
                  </label>
                  <input
                    id="major"
                    type="text"
                    required={role === 'student'}
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                  />
                </div>

                {/* Grad Year */}
                <div>
                  <label htmlFor="gradYear" className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Expected Graduation Year
                  </label>
                  <input
                    id="gradYear"
                    type="text"
                    required={role === 'student'}
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g. 2027"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Job Title */}
                  <div>
                    <label htmlFor="title" className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Professional Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      required={role === 'employee'}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      required={role === 'employee'}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Email */}
                  <div>
                    <label htmlFor="contactEmail" className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Contact Email <span className="text-[10px] text-slate-500">(revealed on accepted connections)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="jane.doe@workplace.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-xs font-semibold text-slate-400 mb-1.5">
                      LinkedIn Profile <span className="text-[10px] text-slate-500">(revealed on accepted connections)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/janedoe"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Bio field */}
            <div className="mt-4">
              <label htmlFor="bio" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Biography / Brief Intro
              </label>
              <textarea
                id="bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief overview of your background, experience, and what you're hoping to achieve..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 transition-colors resize-none"
              />
            </div>

          </div>

          {/* Validation Alert */}
          {error && (
            <div className="flex items-start space-x-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs">
              <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Register Action Button */}
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full btn-primary flex items-center justify-center space-x-2 text-xs py-3"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isRegistering ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Direct Login Page Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 underline transition-colors">
            Sign in instead
          </Link>
        </p>

      </div>
    </div>
  );
};
