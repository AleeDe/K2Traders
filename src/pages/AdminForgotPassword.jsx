import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await sendPasswordResetEmail(normalizedEmail);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Reset email sent. Check your inbox.');
      navigate('/admin/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <MailCheck className="text-green-600" size={22} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Forgot Password</h1>
            <p className="text-slate-600 mt-1">We'll send you a password reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="admin@example.com"
                autoComplete="username"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
