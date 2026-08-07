import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'features/auth/context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} required value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder={placeholder} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-xl font-bold">TF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Start collaborating with your team</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('Username', 'username', 'text', 'johndoe')}
            {field('Email address', 'email', 'email', 'you@example.com')}
            {field('Password', 'password', 'password', '••••••••')}
            {field('Confirm password', 'confirm', 'password', '••••••••')}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 text-sm mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

