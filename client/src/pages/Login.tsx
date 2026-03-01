import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: res } = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[380px]"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-b from-[#5C6BF1] to-[#283188] flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
        </div>

        <h1 className="text-[18px] font-semibold text-text-primary text-center mb-1">
          Sign in to CollabBoard
        </h1>
        <p className="text-[13px] text-text-tertiary text-center mb-8">
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@collabboard.dev"
              required
              className="w-full h-9 bg-input border border-border-strong rounded px-3 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[12px] font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-9 bg-input border border-border-strong rounded px-3 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-primary hover:bg-primary-hover text-white rounded text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[12px] text-text-muted text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-hover transition-colors">
            Create one
          </Link>
        </p>

        {/* Dev hint */}
        <div className="mt-8 p-3 rounded bg-surface border border-border">
          <p className="text-[11px] text-text-muted mb-1 font-medium">Dev credentials:</p>
          <p className="text-[11px] text-text-tertiary font-mono">admin@collabboard.dev / password123</p>
        </div>
      </motion.div>
    </div>
  );
}
