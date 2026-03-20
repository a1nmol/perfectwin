import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bird, MapPin, Award, Camera, LogOut,
  TrendingUp, Shield, Zap, ChevronRight,
  Pencil, Check, X, AlertCircle, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BADGES, getLevelInfo, XP } from '../context/GameContext';
import { supabase } from '../utils/supabaseClient';

/* ── XP progress bar ────────────────────────────────────────── */
function XPBar({ xp }) {
  const { title, next, progress, level } = getLevelInfo(xp);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-emerald-400 font-semibold">{title}</span>
        {next && <span className="text-slate-500 text-xs">→ {next.title} at {next.min} XP</span>}
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{xp} XP total</span>
        <span>Level {level}</span>
      </div>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-white/3 border border-white/8">
      <div className={`w-9 h-9 flex items-center justify-center rounded-xl mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-slate-500 text-xs mt-0.5 text-center">{label}</span>
    </div>
  );
}

/* ── Badge card ─────────────────────────────────────────────── */
function BadgeCard({ badge, earned }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all ${
      earned ? 'bg-emerald-500/8 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-white/2 border-white/5 opacity-35 grayscale'
    }`}>
      <span className="text-3xl mb-2">{badge.icon}</span>
      <p className="text-white text-xs font-semibold leading-snug">{badge.name}</p>
      <p className="text-slate-500 text-[10px] mt-1 leading-snug">{badge.desc}</p>
      {earned && (
        <span className="mt-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
          Earned
        </span>
      )}
    </div>
  );
}

/* ── Edit profile modal ─────────────────────────────────────── */
function EditProfileModal({ profile, user, onClose, onSaved }) {
  const [username,    setUsername]    = useState(profile?.username || '');
  const [fullName,    setFullName]    = useState(profile?.full_name || '');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  async function handleSave() {
    setError('');
    if (username.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers and underscores.'); return; }

    setSaving(true);
    try {
      // Check username taken (excluding self)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single();

      if (existing) { setError('That username is already taken. Choose another.'); setSaving(false); return; }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ username: username.trim(), full_name: fullName.trim() })
        .eq('id', user.id);

      if (updateErr) throw updateErr;
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0a1628] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-2xl font-bold text-emerald-300 flex-shrink-0">
              {username[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-semibold">@{username || '…'}</p>
              <p className="text-slate-500 text-xs">{fullName || 'No display name set'}</p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                placeholder="coastal_guardian"
                maxLength={30}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
              />
            </div>
            <p className="text-slate-600 text-xs mt-1">Letters, numbers and underscores only</p>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Display Name <span className="text-slate-600">(optional)</span></label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your real name"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Email <span className="text-slate-600">(cannot change)</span></label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full px-4 py-3 rounded-xl bg-white/2 border border-white/6 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <><Check className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Profile page ──────────────────────────────────────── */
export default function Profile() {
  const { user, profile, signOut, loading, refreshProfile } = useAuth();
  const [observations,  setObservations]  = useState([]);
  const [obsLoading,    setObsLoading]    = useState(true);
  const [showEdit,      setShowEdit]      = useState(false);
  const navigate       = useNavigate();
  const [searchParams]  = useSearchParams();

  // Auto-open edit modal if ?edit=1 in URL (from navbar link)
  useEffect(() => {
    if (searchParams.get('edit') === '1' && profile) {
      setShowEdit(true);
    }
  }, [searchParams, profile]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('observations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (!cancelled) { setObservations(data || []); setObsLoading(false); }
      });
    return () => { cancelled = true; };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  // Only block render while auth is initialising (not while profile loads)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  const earned      = profile?.badges || [];
  const xp          = profile?.xp || 0;
  const levelInfo   = getLevelInfo(xp);
  const adopted     = profile?.adopted_colonies || [];
  const displayName = profile?.username || user?.email?.split('@')[0] || 'user';

  return (
    <>
      {/* Edit modal */}
      {showEdit && (
        <EditProfileModal
          profile={profile}
          user={user}
          onClose={() => setShowEdit(false)}
          onSaved={refreshProfile}
        />
      )}

      <div className="min-h-screen bg-[#020b18] pt-24 pb-20 px-4">
        <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Profile header ──────────────────────────────── */}
          <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white/4 to-white/2 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-4xl font-black text-emerald-300">
                  {(displayName[0] || '?').toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#020b18] flex items-center justify-center text-xs font-black text-white">
                  {levelInfo.level}
                </div>
              </div>

              {/* Info + actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-white truncate">@{displayName}</h1>
                      {profile?.full_name && (
                        <span className="text-slate-400 text-sm">{profile.full_name}</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        {levelInfo.title}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs">
                        {xp} XP
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                        {earned.length} badge{earned.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowEdit(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-xs font-semibold"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/20 transition-all text-xs font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <XPBar xp={xp} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Camera}  value={profile?.sightings_count || 0} label="Sightings"        color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={Shield}  value={profile?.verified_count  || 0} label="Verified"          color="bg-sky-500/15 text-sky-400" />
            <StatCard icon={MapPin}  value={adopted.length}               label="Colonies Adopted"  color="bg-violet-500/15 text-violet-400" />
            <StatCard icon={Award}   value={earned.length}                label="Badges Earned"     color="bg-amber-500/15 text-amber-400" />
          </div>

          {/* ── Quick actions ────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Camera,      label: 'Log a Sighting',    sub: '+10 XP per observation', href: '/submit',      color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40' },
              { icon: Zap,         label: 'Bird ID Challenge', sub: 'Win up to +50 XP today', href: '/challenge',   color: 'from-sky-500/10 to-sky-600/5 border-sky-500/20 hover:border-sky-500/40' },
              { icon: TrendingUp,  label: 'Leaderboard',       sub: 'See your global rank',   href: '/leaderboard', color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40' },
            ].map(({ icon: Icon, label, sub, href, color }) => (
              <Link key={href} to={href} className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br border transition-all group ${color}`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 ml-auto flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>

          {/* ── Badges ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Badges</h2>
              <span className="text-slate-500 text-sm">{earned.length} / {BADGES.length}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {BADGES.map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned={earned.includes(badge.id)} />
              ))}
            </div>
          </div>

          {/* ── Adopted colonies ─────────────────────────────── */}
          {adopted.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-lg mb-4">Your Adopted Colonies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adopted.map(colony => (
                  <Link key={colony} to="/analytics" className="flex items-center gap-3 p-4 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/30 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-lg">🏡</div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{colony}</p>
                      <p className="text-slate-500 text-xs">View on map →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Recent sightings ─────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Recent Sightings</h2>
              <Link to="/submit" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">+ Log new</Link>
            </div>

            {obsLoading ? (
              <div className="p-8 rounded-2xl bg-white/3 border border-white/8 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              </div>
            ) : observations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/3 border border-white/8 text-center">
                <div className="text-4xl mb-3">🔭</div>
                <p className="text-slate-400 text-sm">No sightings yet — get out there!</p>
                <Link to="/submit" className="inline-flex items-center gap-1.5 mt-3 text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                  Log your first observation <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {observations.map(obs => (
                  <div key={obs.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-2xl flex items-center justify-center flex-shrink-0">🦅</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{obs.species}</p>
                      <p className="text-slate-500 text-xs">
                        {obs.colony_name || 'Open coast'} · {obs.count} bird{obs.count !== 1 ? 's' : ''}
                        {obs.behavior ? ` · ${obs.behavior}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {obs.verified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">✅ Verified</span>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">⏳ Pending</span>
                          <span className="text-amber-500/70 text-[10px] font-semibold">+{obs.photo_url ? XP.SIGHTING_VERIFIED : XP.SIGHTING} XP pending</span>
                        </div>
                      )}
                      <p className="text-slate-600 text-[10px] mt-1">{new Date(obs.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
