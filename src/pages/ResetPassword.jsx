import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const missingLink = !email || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    try {
      await authApi.resetPassword({ email, token, new_password: password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors mb-4 -mt-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center gap-2 mb-7">
          <div className="p-2 bg-orange-50 rounded-xl">
            <Truck className="text-orange-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">SwiftHaul</h1>
            <p className="text-xs text-slate-400">Logistics Management</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset password</h2>
        <p className="text-sm text-slate-500 mb-6">Choose a new password for your account</p>

        {missingLink ? (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            This reset link is missing required information. Please request a new one.
          </div>
        ) : done ? (
          <div className="space-y-4">
            <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              Your password has been reset.
            </div>
            <Button className="w-full justify-center" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full justify-center" loading={loading}>
                Reset Password
              </Button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/login" className="text-orange-500 font-medium hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
