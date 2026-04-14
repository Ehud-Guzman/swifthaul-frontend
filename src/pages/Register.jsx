import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { authApi } from '../services/api';
import Button from '../components/ui/Button';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'client' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type} required={key !== 'phone'}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-7">
          <div className="p-2 bg-orange-50 rounded-xl">
            <Truck className="text-orange-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">SwiftHaul</h1>
            <p className="text-xs text-slate-400">Client Registration</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
        <p className="text-sm text-slate-500 mb-6">Ship cargo with ease</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('Full Name', 'name', 'text', 'John Doe')}
          {field('Email', 'email', 'email', 'you@example.com')}
          {field('Phone (optional)', 'phone', 'tel', '+254 7XX XXX XXX')}
          {field('Password', 'password', 'password', '••••••••')}
          {field('Confirm Password', 'confirm', 'password', '••••••••')}
          <Button type="submit" className="w-full justify-center" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
