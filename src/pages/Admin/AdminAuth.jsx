import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_DASHBOARD_PATH } from '../../config/routes';

const initialLogin = { phone: '', password: '' };

export default function AdminAuth() {
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAdminAuthenticated) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      const result = await adminLogin({
        phone: loginForm.phone.trim(),
        password: loginForm.password,
      });

      if (result?.success) {
        setLoginForm(initialLogin);
        navigate(ADMIN_DASHBOARD_PATH, { replace: true });
      } else {
        setError(result?.message || 'Admin sign in failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Admin sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020208] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090914]/90 p-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#00F0FF]">
          <Shield size={11} /> Secure Portal
        </div>
        <h1 className="mt-4 text-2xl font-black">Operations Login</h1>
        <p className="mt-2 text-xs text-slate-400">
          Admin access only. Sign in to open the protected operations dashboard.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}
          <input
            value={loginForm.phone}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Admin phone"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none placeholder:text-slate-500"
          />
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={authLoading || isAdminLoading}
            className="w-full rounded-2xl bg-[#00F0FF] px-4 py-3 text-xs font-black uppercase tracking-widest text-black disabled:opacity-50"
          >
            {authLoading || isAdminLoading ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Enter Portal'}
          </button>
        </form>


      </div>
    </div>
  );
}
