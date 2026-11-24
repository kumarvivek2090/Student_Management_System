import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ClipboardCheck,
  FileText,
  Users2,
  Loader2,
  ChevronDown
} from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Check URL query parameters for pre-selected role (e.g. from role portals on homepage)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin') {
      setEmail('admin@studentreport.com');
      setPassword('Password@123');
    } else if (roleParam === 'teacher') {
      setEmail('eleanor.vance@studentreport.com');
      setPassword('Password@123');
    } else if (roleParam === 'student') {
      setEmail('sophia.miller@studentreport.com');
      setPassword('Password@123');
    } else if (roleParam === 'parent') {
      setEmail('robert.miller@studentreport.com');
      setPassword('Password@123');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Field validation
    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid institutional email format (e.g. user@studentreport.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      setLoading(false);

      if (result.success) {
        const role = result.user?.role;
        if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (role === 'TEACHER') navigate('/teacher/dashboard');
        else if (role === 'STUDENT') navigate('/student/dashboard');
        else if (role === 'PARENT') navigate('/parent/dashboard');
        else navigate('/admin/dashboard');
      } else {
        const msg = result.message || '';
        if (msg.toLowerCase().includes('bad credentials') || msg.toLowerCase().includes('invalid')) {
          setErrorMessage('Incorrect email or password. Please verify your credentials and try again.');
        } else if (msg.toLowerCase().includes('not found')) {
          setErrorMessage('Account not found. Please contact your institution administrator.');
        } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('server')) {
          setErrorMessage('Server unavailable. Please verify your connection or try again shortly.');
        } else {
          setErrorMessage(msg || 'Authentication failed. Please verify your email and password.');
        }
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('A connection error occurred while contacting the server. Please check your network and retry.');
    }
  };

  const setDemoAccount = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col justify-center lg:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* ================================================================== */}
        {/* LEFT COLUMN: BRANDING & ACADEMIC VALUE PANEL (Desktop)             */}
        {/* ================================================================== */}
        <div className="hidden lg:flex lg:col-span-6 bg-[#293526] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-[#42533D]">
          
          {/* Subtle background decorative shapes */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[420px] h-[420px] rounded-full bg-[#52613B]/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[420px] h-[420px] rounded-full bg-[#3F4D2D]/35 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#CAD6B7_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Top Brand Banner */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-card group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7 text-[#CAD6B7]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#FFFFFF] block font-serif">
                  Oakridge Academy
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D2B66F] block">
                  UNIFIED ACADEMIC REPORTING PLATFORM
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Value Proposition & 4 Required Highlights */}
          <div className="relative z-10 max-w-lg space-y-7 my-auto py-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#E2E8D8] font-medium backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D2B66F]" />
              <span>Verified Institutional Access</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FFFFFF] leading-[1.15] font-serif">
              One Platform. <br />
              <span className="text-[#CAD6B7] underline decoration-[#A58A50]/40 underline-offset-8">Every Academic Journey.</span>
            </h1>

            <p className="text-sm text-[#E2E8D8] leading-relaxed">
              Empowering institutions with intelligent academic management, transparent performance tracking, and meaningful connections between educators, students, and families.
            </p>

            {/* The 4 Platform Highlights */}
            <div className="space-y-3.5 pt-2">
              
              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#334230]/75 border border-[#42533D] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-[#293526] text-[#D2B66F] flex items-center justify-center shrink-0 mt-0.5 border border-[#42533D]">
                  <BarChart3 className="w-4 h-4 text-[#CAD6B7]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FFFFFF] block">Intelligent Academic Analytics</span>
                  <span className="text-[11px] text-[#C0C9B2] block mt-0.5">
                    Real-time grade averages, cohort performance trends, and statistical insights.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#334230]/75 border border-[#42533D] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-[#293526] text-[#D2B66F] flex items-center justify-center shrink-0 mt-0.5 border border-[#42533D]">
                  <ClipboardCheck className="w-4 h-4 text-[#CAD6B7]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FFFFFF] block">Real-Time Attendance Management</span>
                  <span className="text-[11px] text-[#C0C9B2] block mt-0.5">
                    Daily class register with attendance percentage calculation and notifications.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#334230]/75 border border-[#42533D] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-[#293526] text-[#D2B66F] flex items-center justify-center shrink-0 mt-0.5 border border-[#42533D]">
                  <FileText className="w-4 h-4 text-[#CAD6B7]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FFFFFF] block">Automated Academic Reporting</span>
                  <span className="text-[11px] text-[#C0C9B2] block mt-0.5">
                    Instant publication and download of official OpenPDF digital report cards.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#334230]/75 border border-[#42533D] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-[#293526] text-[#D2B66F] flex items-center justify-center shrink-0 mt-0.5 border border-[#42533D]">
                  <Users2 className="w-4 h-4 text-[#CAD6B7]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FFFFFF] block">Connected Institutional Ecosystem</span>
                  <span className="text-[11px] text-[#C0C9B2] block mt-0.5">
                    Seamless coordination across Administrators, Faculty, Students, and Guardians.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Security Assurance Badge */}
          <div className="relative z-10 pt-6 border-t border-[#42533D] flex items-center justify-between text-xs text-[#C0C9B2]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#247A55]" />
              <span>TLS 1.3 Encryption • HttpOnly JWT Security</span>
            </div>
            <span className="font-mono text-[11px] text-[#CAD6B7]">Neon PostgreSQL Serverless</span>
          </div>

        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: AUTHENTICATION PANEL                                 */}
        {/* ================================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-[#F8F7F2]">
          <div className="max-w-md w-full mx-auto">
            
            {/* Elevated White Card for Form */}
            <div className="bg-white rounded-2xl border border-[#E3E1D6] p-7 sm:p-9 shadow-card space-y-6">

              {/* Header */}
              <div>
                <div className="lg:hidden w-12 h-12 rounded-xl bg-[#52613B] flex items-center justify-center text-white shadow-card mb-4">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242820] tracking-tight font-serif">
                  Welcome Back
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#555B50]">
                  Sign in to access your academic workspace.
                </p>
              </div>

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#B84040] text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-[#B84040] mt-0.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form className="space-y-4.5" onSubmit={handleSubmit} noValidate>
                
                {/* Field 1: Institutional Email */}
                <div>
                  <label className="block text-xs font-bold text-[#242820] mb-1.5 uppercase tracking-wider">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#555B50] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@studentreport.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full bg-[#FFFFFF] border border-[#E3E1D6] rounded-xl pl-10 pr-3.5 py-3 text-xs text-[#242820] placeholder-[#74796D] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Password with Show/Hide toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#242820] uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#52613B] hover:text-[#3F4D2D] font-semibold transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#555B50] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full bg-[#FFFFFF] border border-[#E3E1D6] rounded-xl pl-10 pr-10 py-3 text-xs text-[#242820] placeholder-[#74796D] focus:border-[#52613B] focus:ring-1 focus:ring-[#52613B] shadow-xs outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555B50] hover:text-[#242820] cursor-pointer p-0.5 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#E3E1D6] text-[#52613B] focus:ring-[#52613B] cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-[#242820] font-medium cursor-pointer">
                    Remember me on this browser
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#52613B] hover:bg-[#3F4D2D] text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-card hover:shadow-card-hover transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Authenticating with Neon Cloud DB...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sub-Form Security Text */}
              <div className="text-center pt-1">
                <span className="text-xs text-[#74796D] block">
                  Secure access for authorized institutional users.
                </span>
              </div>

              {/* Development / Evaluator Role Fast-Loader (Clean collapsible drawer) */}
              <div className="pt-2 border-t border-[#E3E1D6]">
                <button
                  type="button"
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                  className="w-full flex items-center justify-between py-2 text-[11px] font-semibold text-[#555B50] hover:text-[#242820] cursor-pointer transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#52613B]" />
                    <span>Institutional Evaluation Accounts (Click to test roles)</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoCredentials ? 'rotate-180' : ''}`} />
                </button>

                {showDemoCredentials && (
                  <div className="mt-2.5 grid grid-cols-2 gap-2 p-3 bg-[#F0EFE6] rounded-xl border border-[#E3E1D6] text-[11px] animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => setDemoAccount('admin@studentreport.com')}
                      className="p-2.5 rounded-lg bg-white hover:bg-[#F8F7F2] text-left border border-[#E3E1D6] cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="font-bold text-[#242820] block">Administrator</span>
                      <span className="text-[10px] text-[#555B50] font-mono truncate block mt-0.5">admin@studentreport.com</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoAccount('eleanor.vance@studentreport.com')}
                      className="p-2.5 rounded-lg bg-white hover:bg-[#F8F7F2] text-left border border-[#E3E1D6] cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="font-bold text-[#242820] block">Faculty</span>
                      <span className="text-[10px] text-[#555B50] font-mono truncate block mt-0.5">eleanor.vance@studentreport.com</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoAccount('sophia.miller@studentreport.com')}
                      className="p-2.5 rounded-lg bg-white hover:bg-[#F8F7F2] text-left border border-[#E3E1D6] cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="font-bold text-[#242820] block">Student</span>
                      <span className="text-[10px] text-[#555B50] font-mono truncate block mt-0.5">sophia.miller@studentreport.com</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoAccount('robert.miller@studentreport.com')}
                      className="p-2.5 rounded-lg bg-white hover:bg-[#F8F7F2] text-left border border-[#E3E1D6] cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="font-bold text-[#242820] block">Guardian</span>
                      <span className="text-[10px] text-[#555B50] font-mono truncate block mt-0.5">robert.miller@studentreport.com</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Back to Homepage Link */}
              <div className="text-center pt-2">
                <Link
                  to="/"
                  className="text-xs font-semibold text-[#52613B] hover:text-[#3F4D2D] inline-flex items-center space-x-1.5 transition-colors"
                >
                  <span>← Return to Oakridge Academy Homepage</span>
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
