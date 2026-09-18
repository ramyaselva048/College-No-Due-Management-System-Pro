import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Shield, CheckCircle2, AlertCircle, ArrowLeft, Mail, Lock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'EXPIRED' | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No verification token found in link. Please initiate a new password reset request.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/auth/reset-password/verify-token?token=${encodeURIComponent(token)}`);
        setRequestStatus(res.data.status);
        setAdminEmail(res.data.email || '');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Invalid or expired password reset link.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleAcceptRequest = async () => {
    setAccepting(true);
    setError(null);
    try {
      const res = await api.post('/auth/reset-password/accept', { token });
      setRequestStatus('ACCEPTED');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to accept reset request.');
    } finally {
      setAccepting(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/auth/reset-password/confirm', {
        token,
        new_password: newPassword
      });
      setSuccess(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        navigate('/login', {
          state: {
            notification: {
              type: 'success',
              message: 'Password updated. You can now sign in with your updated admin credentials.'
            }
          }
        });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Password Reset</h1>
          <p className="text-xs text-slate-400 mt-1">Verification and approval workflow</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Verifying reset request authorization...
          </div>
        ) : error && !requestStatus ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold">Verification Failed</p>
                <p className="text-[11px] mt-1 text-rose-300/80 leading-relaxed">{error}</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Sign In
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-bold">Password Reset Confirmed</p>
                <p className="text-[11px] mt-1 text-emerald-300/80 leading-relaxed">{success}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Redirecting to login portal...</p>
          </div>
        ) : requestStatus === 'PENDING' ? (
          /* Step 1: User must accept the request first */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Reset Request Received</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                A password reset request was initiated for administrator account:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-indigo-200 break-all font-semibold">
                {adminEmail}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px] flex items-start gap-2.5">
              <Shield className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold">Acceptance Required:</span> You must click &quot;Accept Reset Request&quot; to authorize setting a new password. If you did not make this request, simply close this window.
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAcceptRequest}
              disabled={accepting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {accepting ? 'Accepting Request...' : 'Accept Password Reset Request'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                Cancel and return to Sign In
              </Link>
            </div>
          </div>
        ) : requestStatus === 'ACCEPTED' ? (
          /* Step 2: Request is accepted -> User can now set new password */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <div>
                <span className="font-bold">Request Accepted:</span> Authorized for <span className="font-mono font-semibold">{adminEmail}</span>. Enter your new password below.
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSetNewPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !newPassword || newPassword !== confirmPassword}
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                {submitting ? 'Updating Password...' : 'Confirm & Save New Password'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
              This reset link is {requestStatus?.toLowerCase() || 'invalid'}. Please request a new link from the login page.
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
