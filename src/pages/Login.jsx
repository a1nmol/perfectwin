import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bird, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode]           = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [username, setUsername]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        if (username.length < 3) throw new Error('Username must be at least 3 characters.');
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-sky-500/6 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border border-emerald-500/30 group-hover:border-emerald-400/60 transition-all">
              <Bird className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-white">Eco<span className="text-emerald-400">Lens</span></span>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Louisiana · Citizen Science</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/3 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40">

          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-8">
            {[['signin', 'Sign In'], ['signup', 'Join Now']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setMode(val); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === val
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Become a Guardian'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'signin'
                ? 'Sign in to track your sightings, XP and badges.'
                : 'Join thousands monitoring Louisiana\'s coastal birds.'}
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5">
              <Bird className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="coastal_guardian"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* What you get on signup */}
          {mode === 'signup' && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">You'll unlock</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['🔭', 'Submit Sightings'],
                  ['⭐', 'Earn XP & Badges'],
                  ['🏆', 'Leaderboard Rank'],
                  ['🏡', 'Adopt a Colony'],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          By joining you agree to help protect Louisiana's coastal birds.{' '}
          <Link to="/about" className="text-emerald-500 hover:text-emerald-400">Learn more</Link>
        </p>
      </div>
    </div>
  );
}
