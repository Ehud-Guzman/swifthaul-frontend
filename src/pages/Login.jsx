import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../utils/roleGuard';
import Button from '../components/ui/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPhone = /^\+?\d[\d\s]{7,}$/.test(identifier.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const credentials = isPhone
      ? { phone: identifier.trim(), password }
      : { email: identifier.trim(), password };
    const result = await login(credentials);
    setLoading(false);
    if (result.success) {
      navigate(ROLE_HOME[result.user.role] || '/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        {/* Back to Home button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors mb-4 -mt-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
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

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
        <p className="text-sm text-slate-500 mb-6">Use your email or phone number</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email or Phone Number
            </label>
            <input
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="you@example.com"
            />
            {identifier && (
              <p className="text-xs text-slate-400 mt-1">
                Signing in with:{' '}
                <span className="text-orange-500 font-medium">
                  {isPhone ? 'phone number' : 'email'}
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full justify-center" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Need to ship cargo?{' '}
          <Link to="/register" className="text-orange-500 font-medium hover:underline">
            Create a client account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;