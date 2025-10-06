import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in and admin, redirect automatically
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
    if (!authLoading && user && !isAdmin) {
      // Show a message for non-admin accounts
      toast.error('This account is not an admin');
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await signIn(normalizedEmail, password.trim());

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login successful');
        // Navigation will occur when isAdmin becomes true via the effect above
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <LockKeyhole className="text-green-600" size={22} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Login</h1>
            <p className="text-slate-600 mt-1">Access the admin dashboard • First time? Use setup link below</p>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm -mt-2">
              <button type="button" onClick={() => navigate('/admin/forgot-password')} className="text-green-700 hover:underline">
                Forgot password?
              </button>
              <button type="button" onClick={() => navigate('/admin/signup')} className="text-slate-600 hover:underline">
                First-time setup
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
