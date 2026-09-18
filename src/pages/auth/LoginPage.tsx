import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Building2, ShieldCheck, CheckCircle2, KeyRound, Shield, Check, X, User, ExternalLink, Copy, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role')?.toUpperCase() as UserRole) || 'STUDENT';

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toUpperCase() as UserRole;
    if (roleParam && ['STUDENT', 'STAFF', 'HOD', 'ADMIN'].includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Reset Modal state (Strict Email Code Flow)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'password'>('request');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetRequestInfo, setResetRequestInfo] = useState<{
    email: string;
    requestId: string;
    is_smtp_configured: boolean;
    preview_approval_url?: string;
    preview_code?: string;
    approval_code?: string;
    email_delivered?: boolean;
  } | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSmtpGuide, setShowSmtpGuide] = useState(false);

  const resetModalState = () => {
    setShowForgotModal(false);
    setResetStep('request');
    setResetIdentifier('');
    setResetToken('');
    setResetCodeInput('');
    setResetRequestInfo(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError(null);
    setResetSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedIn = await login(email.trim(), password, activeRole);
      if (loggedIn.role === 'STUDENT') navigate('/student/dashboard');
      else if (loggedIn.role === 'HOD') navigate('/hod/dashboard');
      else if (loggedIn.role === 'STAFF') navigate('/staff/dashboard');
      else if (loggedIn.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top action bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-3">
        <ThemeToggle variant="compact" />
        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          ← Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Apex College</span>
        </Link>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
          Sign In to Clearance Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter institutional credentials to access your designated clearance portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl shadow-xl dark:shadow-slate-950/40 border border-slate-200 dark:border-slate-800 transition-colors">
          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-6">
            <button
              type="button"
              id="tab-role-student"
              onClick={() => {
                setActiveRole('STUDENT');
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRole === 'STUDENT'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student
            </button>
            <button
              type="button"
              id="tab-role-hod"
              onClick={() => {
                setActiveRole('HOD');
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRole === 'HOD'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-200 dark:ring-indigo-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              HOD
            </button>
            <button
              type="button"
              id="tab-role-staff"
              onClick={() => {
                setActiveRole('STAFF');
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRole === 'STAFF'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-200 dark:ring-emerald-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Staff
            </button>
            <button
              type="button"
              id="tab-role-admin"
              onClick={() => {
                setActiveRole('ADMIN');
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRole === 'ADMIN'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {activeRole === 'HOD' && (
            <div className="mb-4 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 rounded-xl text-indigo-950 dark:text-indigo-200 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-100">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Head of Department (HOD) Portal
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-200 dark:border-indigo-700">
                  Admin Allocated
                </span>
              </div>
              <p className="text-indigo-800/90 dark:text-indigo-300/90 text-[11px] leading-relaxed">
                Only department HODs allocated by the College Administrator can log in with their designated email and password.
              </p>
            </div>
          )}

          {activeRole === 'STAFF' && (
            <div className="mb-4 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl text-emerald-950 dark:text-emerald-200 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Department Faculty & Staff Portal
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-700">
                  HOD Allocated
                </span>
              </div>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 text-[11px] leading-relaxed">
                Only faculty members allocated by the Head of Department (HOD) can sign in to evaluate subject dues and clearance requests.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeRole === 'STUDENT'
                  ? 'Register Number or College Email'
                  : activeRole === 'HOD'
                  ? 'HOD Institutional Email or Employee ID'
                  : activeRole === 'STAFF'
                  ? 'Employee ID or College Email'
                  : 'Admin Username or Institutional Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {activeRole === 'ADMIN' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  id="input-email"
                  type="text"
                  required
                  placeholder={
                    activeRole === 'STUDENT'
                      ? 'e.g. 732423104005 or student@college.edu'
                      : activeRole === 'HOD'
                      ? 'e.g. hod.cse@college.edu or HOD-CSE-001'
                      : activeRole === 'STAFF'
                      ? 'e.g. EMP-LIB-101 or staff.library@college.edu'
                      : 'e.g. admin or admin@college.edu'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetError(null);
                    setResetSuccess(null);
                    setResetIdentifier(email || '');
                    setResetNewPassword('');
                    setResetConfirmPassword('');
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In as {activeRole} <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Institutional Secure Access</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Clearance credentials are managed securely by the College Administration.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Credentials Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            {activeRole === 'ADMIN' ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Password Recovery</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {resetStep === 'request' && 'Email authorization request'}
                        {resetStep === 'verify' && 'Accept request via email'}
                        {resetStep === 'password' && 'Set new admin password'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetModalState}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {resetSuccess ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">Password Reset Completed!</p>
                        <p className="text-[11px] leading-relaxed">{resetSuccess}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetModalState}
                      className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In with New Password
                    </button>
                  </div>
                ) : resetStep === 'request' ? (
                  /* STEP 1: Enter current admin email */
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!resetIdentifier.trim()) {
                        setResetError('Please enter your current Admin Email.');
                        return;
                      }
                      setResetLoading(true);
                      setResetError(null);
                      try {
                        const res = await api.post('/auth/reset-password/request', {
                          email: resetIdentifier.trim(),
                          client_origin: window.location.origin
                        });
                        setResetRequestInfo(res.data);
                        setResetToken('');
                        setResetCodeInput('');
                        setResetStep('verify');
                      } catch (err: any) {
                        setResetError(err.response?.data?.detail || 'No Administrator found with this email. Please verify your current Admin Email.');
                      } finally {
                        setResetLoading(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Admin Approval Workflow
                      </p>
                      <p className="leading-relaxed">
                        Enter your registered Admin Email. An authorization request will be sent. <strong>You must accept the request</strong> before your password can be reset.
                      </p>
                    </div>

                    {resetError && (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{resetError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Current Admin Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={resetIdentifier}
                          onChange={(e) => setResetIdentifier(e.target.value)}
                          placeholder="Enter your registered Admin email"
                          className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetModalState}
                        className="w-1/2 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading || !resetIdentifier.trim()}
                        className="w-1/2 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                      >
                        {resetLoading ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </form>
                ) : resetStep === 'verify' ? (
                  /* STEP 2: Enter 6-digit approval code sent to Gmail */
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const cleanCode = resetCodeInput.trim();
                      if (!cleanCode || cleanCode.length < 6) {
                        setResetError('Please enter the complete 6-digit approval code.');
                        return;
                      }
                      setResetLoading(true);
                      setResetError(null);
                      try {
                        const res = await api.post('/auth/reset-password/accept', {
                          code: cleanCode,
                          requestId: resetRequestInfo?.requestId,
                          email: resetIdentifier.trim()
                        });
                        if (res.data.token) {
                          setResetToken(res.data.token);
                        }
                        setResetStep('password');
                      } catch (err: any) {
                        setResetError(err.response?.data?.detail || 'Invalid approval code. Please check your email and try again.');
                      } finally {
                        setResetLoading(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    {/* Status & Explanation Box */}
                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
                          <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>Check Your Email</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          Code Required
                        </span>
                      </div>

                      <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 break-all">
                        {resetRequestInfo?.email || resetIdentifier}
                      </div>

                      <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-200 text-xs space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                          <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                          Code Sent to Your Email
                        </p>
                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          A 6-digit verification approval code has been dispatched to <strong>{resetRequestInfo?.email || resetIdentifier}</strong>. Please check your Gmail inbox (and Spam folder), and enter the code below to proceed:
                        </p>
                      </div>

                      {resetRequestInfo?.fallback_code && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-amber-600" />
                              Render Free Tier Notice
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">
                              SMTP Blocked
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                            Render Free Tier blocks outbound SMTP (port 587). Your approval code is logged in Render deployment console:
                          </p>
                          <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800">
                            <span className="font-mono text-base font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                              {resetRequestInfo.fallback_code}
                            </span>
                            <button
                              type="button"
                              onClick={() => setResetCodeInput(resetRequestInfo.fallback_code)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Auto-Fill Code
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {resetError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{resetError}</span>
                      </div>
                    )}

                    {/* 6-Digit Code Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 text-center">
                        Enter 6-Digit Approval Code <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative max-w-[240px] mx-auto">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          required
                          value={resetCodeInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setResetCodeInput(val);
                            if (resetError) setResetError(null);
                          }}
                          placeholder="• • • • • •"
                          className="w-full text-center tracking-[0.4em] font-mono text-xl font-extrabold py-2.5 px-3 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all shadow-sm"
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-500 text-center">
                        Code expires in 30 minutes. Check your spam folder if not in inbox.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={resetLoading || resetCodeInput.length < 6}
                      className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {resetLoading ? 'Verifying Code...' : 'Verify Code & Set New Password'}
                    </button>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep('request');
                          setResetError(null);
                          setResetCodeInput('');
                        }}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                      >
                        &larr; Resend or Change Email
                      </button>
                      <button
                        type="button"
                        onClick={resetModalState}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STEP 3: Request Accepted! Enter new password */
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!resetNewPassword || resetNewPassword.length < 6) {
                        setResetError('New password must be at least 6 characters long.');
                        return;
                      }
                      if (resetNewPassword !== resetConfirmPassword) {
                        setResetError('New password and confirm password do not match.');
                        return;
                      }
                      setResetLoading(true);
                      setResetError(null);
                      try {
                        const res = await api.post('/auth/reset-password/confirm', {
                          token: resetToken,
                          new_password: resetNewPassword
                        });
                        const updatedUser = res.data.username || res.data.email || resetIdentifier;
                        setResetSuccess(
                          `Admin password has been updated. You can now login using "${updatedUser}" with your new password.`
                        );
                        setEmail(updatedUser);
                        setPassword('');
                      } catch (err: any) {
                        setResetError(err.response?.data?.detail || 'Failed to update admin password.');
                      } finally {
                        setResetLoading(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Request Accepted:</span> Authorized for{' '}
                        <span className="font-mono font-semibold">{resetRequestInfo?.email || resetIdentifier}</span>
                      </div>
                    </div>

                    {resetError && (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{resetError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          New Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetModalState}
                        className="w-1/2 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading || !resetNewPassword || resetNewPassword !== resetConfirmPassword}
                        className="w-1/2 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {resetLoading ? 'Updating...' : 'Save Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Clearance Account Password Help</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Student and Staff clearance accounts are centrally managed by the College Administration. If you forgot your password or need your institutional credentials, please contact the College Administration Office.
                </p>
                <button
                  type="button"
                  onClick={resetModalState}
                  className="w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
