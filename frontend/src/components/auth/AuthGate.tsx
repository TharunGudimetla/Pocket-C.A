import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader } from '../chat/Loader';
import { useAuth } from '../../hooks/useAuth';

type Mode = 'login' | 'register';

export function AuthGate({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await auth.login(email, password);
      } else {
        await auth.register(name, email, password);
      }
    } catch {
      // error is surfaced via auth.error
    }
  };

  const handleDemoLogin = async () => {
    try {
      await auth.login('demo@pocketca.com', 'password123');
    } catch {
      // fallback if demo fails
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-floating"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <Logo size={48} className="mb-3" />
          <h1 className="text-[20px] font-bold text-ink">
            Pocket <span className="text-brand-teal">C.A.</span>
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-muted">Your AI Accounting & Finance Assistant</p>
        </div>

        {/* Demo Access Button in Distinct Purple/Indigo Color */}
        <div className="mb-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={auth.loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            <Sparkles size={14} />
            Quick Demo Login (1-Click)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {auth.error && <p className="text-[13px] text-red-500 font-medium">{auth.error}</p>}

          <Button type="submit" className="w-full justify-center" disabled={auth.loading}>
            {auth.loading ? (
              <Loader size={16} className="text-white" />
            ) : mode === 'login' ? (
              'Log in'
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-ink-muted">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-semibold text-brand-blue hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
