import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { getLevelInfo, BADGES, XP } from '../context/GameContext';
import {
  Shield, Users, Eye, CheckCircle2, XCircle, Clock,
  TrendingUp, Bird, Zap, Star, Trophy, MapPin,
  RefreshCw, Search, AlertTriangle, BarChart3,
  Activity, Camera, Award, Hash, ChevronRight,
  ArrowUpRight, Lock, Image, MessageSquare, Layers,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

/* ── Admin access guard ─────────────────────────────────────── */
// Set your admin email(s) here OR use is_admin column in profiles
// Run: UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
const ADMIN_EMAILS = []; // fallback email list — add your email here if needed

/* ── Helpers ─────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function levelColor(level) {
  const colors = ['', 'text-slate-400', 'text-sky-400', 'text-emerald-400', 'text-violet-400', 'text-amber-400', 'text-rose-400'];
  return colors[level] || 'text-slate-400';
}

const CHART_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#84cc16', '#fb923c'];

/* ── Sub-components ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color = 'text-emerald-400', bg = 'bg-emerald-500/10 border-emerald-500/20', trend }) {
  return (
    <div className="relative p-5 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5 transition-all overflow-hidden group">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${bg} rounded-2xl`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-2xl font-black text-white tabular-nums">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-slate-600 text-[10px] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function QueueCard({ obs, onApprove, onReject, busy }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="p-4 rounded-2xl bg-white/3 border border-white/8 hover:border-amber-500/20 transition-all">
      {/* Photo */}
      {obs.photo_url && !imgError ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-white/5">
          <img
            src={obs.photo_url}
            alt={obs.species}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-emerald-500/80 text-white text-[10px] font-bold flex items-center gap-1">
            <Camera className="w-3 h-3" /> Photo attached
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl bg-white/3 border border-white/6 flex flex-col items-center justify-center mb-4 py-4 px-3 gap-1">
          <Image className="w-6 h-6 text-slate-600 mb-1" />
          {obs.photo_url && imgError ? (
            <>
              <p className="text-amber-500 text-[10px] font-semibold">Photo URL saved but can't load</p>
              <p className="text-slate-600 text-[9px] break-all text-center">{obs.photo_url}</p>
              <a href={obs.photo_url} target="_blank" rel="noreferrer" className="text-sky-400 text-[10px] underline mt-1">Open URL directly</a>
            </>
          ) : (
            <>
              <p className="text-slate-600 text-[10px]">No photo</p>
              <p className="text-slate-700 text-[9px] font-mono">photo_url: null</p>
            </>
          )}
        </div>
      )}

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-semibold text-sm leading-tight">{obs.species}</p>
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">PENDING</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Hash className="w-3 h-3 flex-shrink-0" />
            <span>{obs.count} bird{obs.count !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{obs.colony_name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span className="text-sky-400 truncate">@{obs.profiles?.username || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{timeAgo(obs.created_at)}</span>
          </div>
        </div>
        {obs.behavior && (
          <p className="text-slate-500 text-[11px] italic">"{obs.behavior}"</p>
        )}
        {obs.notes && (
          <p className="text-slate-600 text-[10px] line-clamp-2">{obs.notes}</p>
        )}
        {obs.lat && (
          <p className="text-slate-600 text-[10px] font-mono">{Number(obs.lat).toFixed(4)}, {Number(obs.lng).toFixed(4)}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(obs)}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50"
        >
          {busy === `approve-${obs.id}` ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Approve
        </button>
        <button
          onClick={() => onReject(obs)}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all disabled:opacity-50"
        >
          {busy === `reject-${obs.id}` ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          Reject
        </button>
      </div>
    </div>
  );
}

function UserRow({ entry, rank }) {
  const levelInfo = getLevelInfo(entry.xp || 0);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <td className="px-4 py-3 text-slate-500 text-sm w-10">
          {rank <= 3
            ? ['🥇','🥈','🥉'][rank - 1]
            : <span className="font-bold">#{rank}</span>}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-sm flex-shrink-0">🦅</div>
            <div>
              <p className="text-white text-sm font-semibold">@{entry.username || '—'}</p>
              <p className={`text-xs ${levelColor(levelInfo.level)}`}>{levelInfo.title}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <p className="text-emerald-400 font-bold text-sm">{(entry.xp || 0).toLocaleString()}</p>
          <p className="text-slate-600 text-[10px]">XP</p>
        </td>
        <td className="px-4 py-3 text-right text-white text-sm">{entry.sightings_count || 0}</td>
        <td className="px-4 py-3 text-right">
          <span className={`text-sm font-semibold ${entry.verified_count > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{entry.verified_count || 0}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 justify-end">
            {(entry.badges || []).slice(0, 4).map((b, i) => (
              <span key={i} className="text-sm" title={BADGES.find(bd => bd.id === b)?.name || b}>
                {BADGES.find(bd => bd.id === b)?.icon || '🎯'}
              </span>
            ))}
            {(entry.badges || []).length > 4 && (
              <span className="text-slate-600 text-xs">+{entry.badges.length - 4}</span>
            )}
            {(entry.badges || []).length === 0 && <span className="text-slate-700 text-xs">—</span>}
          </div>
        </td>
        <td className="px-4 py-3 text-right text-slate-500 text-xs">
          {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '—'}
        </td>
        <td className="px-4 py-3 text-slate-600">
          {entry.is_admin && <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 text-[10px] font-bold">ADMIN</span>}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-white/2 border-b border-white/5">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Challenges Completed</p>
                <p className="text-white text-sm font-semibold">{entry.challenges_completed || 0}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Adopted Colonies</p>
                <p className="text-white text-sm font-semibold">{(entry.adopted_colonies || []).length}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Level Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${levelInfo.progress}%` }} />
                  </div>
                  <span className="text-emerald-400 text-xs">{levelInfo.progress}%</span>
                </div>
              </div>
              {(entry.adopted_colonies || []).length > 0 && (
                <div className="col-span-full">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Adopted Colonies</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.adopted_colonies.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[10px]">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a1628] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ── Main Admin Page ─────────────────────────────────────────── */
export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab]               = useState('overview');
  const [profiles, setProfiles]     = useState([]);
  const [observations, setObs]      = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy]             = useState(null);
  const [search, setSearch]         = useState('');
  const [queueFilter, setQueueFilter] = useState('pending');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [actionMsg, setActionMsg]   = useState(null);

  // Wait for auth to finish before evaluating admin status
  const isAdmin = !authLoading && (
    profile?.is_admin === true ||
    ADMIN_EMAILS.includes(user?.email || '')
  );

  const [fetchErrors, setFetchErrors] = useState([]);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    else setRefreshing(true);

    const [
      { data: p, error: pErr },
      { data: o, error: oErr },
      { data: c, error: cErr },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('xp', { ascending: false }),
      supabase.from('observations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('challenge_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    const errs = [
      pErr && `profiles: ${pErr.message}`,
      oErr && `observations: ${oErr.message}`,
      cErr && `challenge_attempts: ${cErr.message}`,
    ].filter(Boolean);

    setFetchErrors(errs);
    setProfiles(p || []);
    setObs(o || []);
    setChallenges(c || []);
    setDataLoading(false);
    setRefreshing(false);
    setLastRefresh(new Date());
  }, []);

  // Only load data after auth finishes and admin status is confirmed
  useEffect(() => {
    if (!authLoading && isAdmin) loadAll();
  }, [authLoading, isAdmin, loadAll]);

  /* ── Profile lookup map (user_id → profile) ─────────────────── */
  const profilesMap = useMemo(() => {
    const m = {};
    profiles.forEach(p => { m[p.id] = p; });
    return m;
  }, [profiles]);

  // Enrich observations with profile info (no DB join needed)
  const enrichedObs = useMemo(() =>
    observations.map(o => ({ ...o, profiles: profilesMap[o.user_id] || null })),
    [observations, profilesMap]
  );

  /* ── Computed stats ─────────────────────────────────────────── */
  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return {
      totalUsers:     profiles.length,
      pendingQueue:   enrichedObs.filter(o => !o.verified).length,
      verifiedCount:  enrichedObs.filter(o => o.verified).length,
      totalObs:       enrichedObs.length,
      totalXP:        profiles.reduce((s, p) => s + (p.xp || 0), 0),
      totalChallenges: challenges.length,
      todayObs:       enrichedObs.filter(o => new Date(o.created_at) >= today).length,
      withPhoto:      enrichedObs.filter(o => o.photo_url).length,
    };
  }, [profiles, observations, challenges]);

  const speciesChart = useMemo(() => {
    const counts = {};
    enrichedObs.forEach(o => { if (o.species) counts[o.species] = (counts[o.species] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([species, count]) => ({ species: species.split(' ').slice(-1)[0], count, full: species }));
  }, [enrichedObs]);

  const colonyChart = useMemo(() => {
    const counts = {};
    enrichedObs.forEach(o => { if (o.colony_name) counts[o.colony_name] = (counts[o.colony_name] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([colony, count]) => ({ colony: colony.split(' ').slice(0, 2).join(' '), count, full: colony }));
  }, [enrichedObs]);

  const dailyChart = useMemo(() => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    enrichedObs.forEach(o => {
      const key = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [enrichedObs]);

  const challengeChart = useMemo(() => {
    const stats = {};
    challenges.forEach(c => {
      if (!stats[c.challenge_id]) stats[c.challenge_id] = { id: c.challenge_id, total: 0, correct: 0 };
      stats[c.challenge_id].total++;
      if (c.correct) stats[c.challenge_id].correct++;
    });
    return Object.values(stats).map(s => ({
      id: s.id.replace('-', ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').slice(0, 12),
      rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      total: s.total,
    }));
  }, [challenges]);

  const levelDist = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    profiles.forEach(p => { const l = getLevelInfo(p.xp || 0).level; dist[l] = (dist[l] || 0) + 1; });
    const names = ['', 'Newcomer', 'Citizen Sci.', 'Observer', 'Contributor', 'Field Res.', 'Expert'];
    return Object.entries(dist).filter(([, v]) => v > 0).map(([level, count]) => ({
      level: names[+level],
      count,
    }));
  }, [profiles]);

  /* ── Queue actions ──────────────────────────────────────────── */
  async function approveObs(obs) {
    setBusy(`approve-${obs.id}`);
    await supabase.from('observations').update({ verified: true }).eq('id', obs.id);

    // Award full XP now (was held pending verification)
    const targetProfile = profiles.find(p => p.id === obs.user_id);
    if (targetProfile) {
      const xpReward    = obs.photo_url ? XP.SIGHTING_VERIFIED : XP.SIGHTING;
      const newXp       = (targetProfile.xp || 0) + xpReward;
      const newLevel    = getLevelInfo(newXp).level;
      const newVerified = (targetProfile.verified_count || 0) + 1;
      const newCount    = (targetProfile.sightings_count || 0) + 1;
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel, verified_count: newVerified, sightings_count: newCount })
        .eq('id', obs.user_id)
        .select();
      if (error || !updated?.length) {
        await supabase.from('profiles').upsert(
          { id: obs.user_id, xp: newXp, level: newLevel, verified_count: newVerified, sightings_count: newCount },
          { onConflict: 'id' }
        );
      }
    }

    setActionMsg({ type: 'success', text: `Approved: ${obs.species} by @${obs.profiles?.username} — XP awarded` });
    setTimeout(() => setActionMsg(null), 3000);
    await loadAll(true);
    setBusy(null);
  }

  async function rejectObs(obs) {
    setBusy(`reject-${obs.id}`);
    await supabase.from('observations').delete().eq('id', obs.id);
    setActionMsg({ type: 'error', text: `Rejected: ${obs.species} by @${obs.profiles?.username}` });
    setTimeout(() => setActionMsg(null), 3000);
    await loadAll(true);
    setBusy(null);
  }

  /* ── Filtered data ──────────────────────────────────────────── */
  const queueObs = useMemo(() => {
    if (queueFilter === 'pending')  return enrichedObs.filter(o => !o.verified);
    if (queueFilter === 'verified') return enrichedObs.filter(o => o.verified);
    return enrichedObs;
  }, [enrichedObs, queueFilter]);

  const filteredUsers = useMemo(() => {
    if (!search) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(p => (p.username || '').toLowerCase().includes(q));
  }, [profiles, search]);

  /* ── Render guards (checked in order) ───────────────────────── */

  // 1. Auth still resolving — show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  // 2. Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
          <Link to="/login" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all">
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Only</h2>
          <p className="text-slate-400 text-sm mb-2">Your account doesn't have admin privileges.</p>
          <p className="text-slate-500 text-xs mb-1">Signed in as: <span className="text-slate-300">{user.email}</span></p>
          <p className="text-slate-600 text-xs mb-6">Run in Supabase SQL Editor to grant access:<br />
            <code className="text-emerald-400 text-[10px] break-all">
              UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = '{user.email}');
            </code>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold transition-all hover:bg-white/10">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // 4. Admin confirmed, data loading
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading admin data…</p>
        </div>
      </div>
    );
  }

  /* ── NAV items ──────────────────────────────────────────────── */
  const NAV = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'queue',    icon: Clock,     label: 'Queue',    badge: stats.pendingQueue },
    { id: 'users',    icon: Users,     label: 'Users' },
    { id: 'activity', icon: Activity,  label: 'Activity' },
    { id: 'stats',    icon: TrendingUp,label: 'Analytics' },
  ];

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen bg-[#020b18] flex pt-20">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="fixed left-0 top-20 bottom-0 w-56 border-r border-white/6 bg-[#020b18] z-30 flex flex-col py-6 px-3 hidden md:flex">
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Shield className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Admin Panel</p>
            <p className="text-slate-600 text-[10px]">EcoLens Control</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-emerald-500/12 border border-emerald-500/20 text-emerald-400'
                  : 'text-slate-500 hover:text-white hover:bg-white/4'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {badge > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-3 pt-4 border-t border-white/6">
          <p className="text-slate-600 text-[10px]">Logged in as</p>
          <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          {lastRefresh && (
            <p className="text-slate-700 text-[10px] mt-1">
              Updated {timeAgo(lastRefresh.toISOString())}
            </p>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-0">

        {/* Top bar */}
        <div className="sticky top-20 z-20 bg-[#020b18]/90 backdrop-blur-xl border-b border-white/6 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            {NAV.map(({ id, icon: Icon, badge }) => (
              <button key={id} onClick={() => setTab(id)} className={`p-2 rounded-xl transition-all ${tab === id ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-600 hover:text-white'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-sm">
              {NAV.find(n => n.id === tab)?.label}
            </span>
            {stats.pendingQueue > 0 && tab !== 'queue' && (
              <button onClick={() => setTab('queue')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/15 transition-all">
                <AlertTriangle className="w-3 h-3" />
                {stats.pendingQueue} pending review
              </button>
            )}
          </div>
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 text-slate-400 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* RLS / fetch errors */}
        {fetchErrors.length > 0 && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 text-xs space-y-1">
            <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Database access blocked (RLS policy missing):</p>
            {fetchErrors.map((e, i) => <p key={i} className="font-mono pl-6">{e}</p>)}
            <p className="text-red-500/60 pl-6 mt-1">Run the SQL fix in Supabase → SQL Editor to grant admin read access.</p>
          </div>
        )}

        {/* Action toast */}
        {actionMsg && (
          <div className={`mx-6 mt-4 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
            {actionMsg.text}
          </div>
        )}

        {/* ══ Content area ══ */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">

          {/* ───── OVERVIEW ───── */}
          {tab === 'overview' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={Users}       label="Total Users"       value={stats.totalUsers}               color="text-sky-400"    bg="bg-sky-500/10 border-sky-500/20" />
                <StatCard icon={Clock}       label="Pending Review"    value={stats.pendingQueue}             color="text-amber-400"  bg="bg-amber-500/10 border-amber-500/20" />
                <StatCard icon={CheckCircle2}label="Verified Sightings" value={stats.verifiedCount}           color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
                <StatCard icon={Bird}        label="Total Observations" value={stats.totalObs}                color="text-violet-400" bg="bg-violet-500/10 border-violet-500/20" />
                <StatCard icon={Zap}         label="Total XP Awarded"  value={stats.totalXP.toLocaleString()} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
                <StatCard icon={Star}        label="Challenge Attempts" value={stats.totalChallenges}          color="text-amber-400"  bg="bg-amber-500/10 border-amber-500/20" />
                <StatCard icon={Camera}      label="With Photos"       value={stats.withPhoto}               color="text-sky-400"    bg="bg-sky-500/10 border-sky-500/20" />
                <StatCard icon={Eye}         label="Submitted Today"   value={stats.todayObs}                color="text-rose-400"   bg="bg-rose-500/10 border-rose-500/20" />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily submissions line chart */}
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Submissions — Last 7 Days
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={dailyChart}>
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" name="Sightings" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* User level distribution */}
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    User Level Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={levelDist} barSize={28}>
                      <XAxis dataKey="level" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                        {levelDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent pending */}
              {stats.pendingQueue > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Pending Review
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">{stats.pendingQueue}</span>
                    </h3>
                    <button onClick={() => setTab('queue')} className="text-emerald-400 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedObs.filter(o => !o.verified).slice(0, 3).map(obs => (
                      <QueueCard key={obs.id} obs={obs} onApprove={approveObs} onReject={rejectObs} busy={busy} />
                    ))}
                  </div>
                </div>
              )}

              {/* Top users preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Top Users by XP
                  </h3>
                  <button onClick={() => setTab('users')} className="text-emerald-400 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    All users <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {profiles.slice(0, 5).map((p, i) => {
                    const lvl = getLevelInfo(p.xp || 0);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/6 hover:bg-white/4 transition-all">
                        <span className="text-slate-600 w-6 text-center text-sm font-bold">
                          {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm">🦅</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">@{p.username}</p>
                          <p className={`text-xs ${levelColor(lvl.level)}`}>{lvl.title}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Bird className="w-3 h-3" />
                          {p.sightings_count || 0}
                        </div>
                        <p className="text-emerald-400 font-bold text-sm">{(p.xp || 0).toLocaleString()} XP</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───── QUEUE ───── */}
          {tab === 'queue' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-white font-bold text-xl">Sightings Queue</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{stats.pendingQueue} pending · {stats.verifiedCount} verified · {stats.totalObs} total</p>
                </div>
                <div className="flex rounded-xl bg-white/5 p-1 gap-0.5">
                  {[['pending','Pending'],['verified','Verified'],['all','All']].map(([val, label]) => (
                    <button key={val} onClick={() => setQueueFilter(val)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${queueFilter === val ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                      {label}
                      {val === 'pending' && stats.pendingQueue > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">{stats.pendingQueue}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {queueObs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold">All clear!</p>
                  <p className="text-slate-500 text-sm mt-1">No {queueFilter === 'all' ? '' : queueFilter} sightings to show.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {queueObs.map(obs => (
                    <QueueCard key={obs.id} obs={obs} onApprove={approveObs} onReject={rejectObs} busy={busy} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ───── USERS ───── */}
          {tab === 'users' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-white font-bold text-xl">Users</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{profiles.length} registered accounts</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by username…"
                    className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 text-sm w-64 transition-all"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 bg-white/2">
                        {['#','User','XP','Sightings','Verified','Badges','Joined',''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((entry, i) => (
                        <UserRow key={entry.id} entry={entry} rank={i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="py-16 text-center text-slate-500">No users match your search.</div>
                )}
              </div>
            </div>
          )}

          {/* ───── ACTIVITY ───── */}
          {tab === 'activity' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-white font-bold text-xl">Live Activity Feed</h2>
                <p className="text-slate-400 text-sm mt-0.5">All recent citizen science submissions</p>
              </div>

              <div className="space-y-2">
                {enrichedObs.map((obs, i) => (
                  <div key={obs.id} className="flex items-start gap-3 p-4 rounded-2xl bg-white/2 border border-white/6 hover:bg-white/4 transition-all group">
                    {/* Photo thumb or placeholder */}
                    {obs.photo_url ? (
                      <img src={obs.photo_url} alt={obs.species} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center flex-shrink-0">
                        <Bird className="w-5 h-5 text-slate-600" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{obs.species}</span>
                        <span className="text-slate-500 text-xs">×{obs.count}</span>
                        {obs.verified && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">✓ Verified</span>
                        )}
                        {obs.photo_url && (
                          <span className="px-1.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px]">📸 Photo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sky-400 text-xs">@{obs.profiles?.username || 'unknown'}</span>
                        {obs.colony_name && <span className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{obs.colony_name}</span>}
                        {obs.behavior && <span className="text-slate-600 text-xs italic">{obs.behavior}</span>}
                      </div>
                    </div>

                    <span className="text-slate-600 text-xs flex-shrink-0">{timeAgo(obs.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───── ANALYTICS ───── */}
          {tab === 'stats' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h2 className="text-white font-bold text-xl">Platform Analytics</h2>
                <p className="text-slate-400 text-sm mt-0.5">Aggregated data across all citizen science activity</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Species breakdown */}
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                    <Bird className="w-4 h-4 text-emerald-400" />
                    Top Observed Species
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={speciesChart} layout="vertical" barSize={14}>
                      <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="species" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Sightings" radius={[0, 4, 4, 0]}>
                        {speciesChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Colony hotspots */}
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Colony Hotspots
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={colonyChart} layout="vertical" barSize={14}>
                      <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="colony" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Sightings" radius={[0, 4, 4, 0]} fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Challenge accuracy */}
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Challenge Accuracy Rates
                  </h3>
                  {challengeChart.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">No challenge data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={challengeChart} barSize={28}>
                        <XAxis dataKey="id" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={30} domain={[0, 100]} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="rate" name="Accuracy %" radius={[4, 4, 0, 0]}>
                          {challengeChart.map((entry, i) => (
                            <Cell key={i} fill={entry.rate >= 70 ? '#10b981' : entry.rate >= 50 ? '#f59e0b' : '#f43f5e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* XP distribution (pie) */}
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                  <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    XP by Level Tier
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={levelDist} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                        {levelDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/3 border border-white/8 text-center">
                  <p className="text-2xl font-black text-emerald-400">{stats.totalObs > 0 ? Math.round((stats.verifiedCount / stats.totalObs) * 100) : 0}%</p>
                  <p className="text-slate-500 text-xs mt-1">Verification rate</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/3 border border-white/8 text-center">
                  <p className="text-2xl font-black text-sky-400">{stats.totalObs > 0 ? Math.round((stats.withPhoto / stats.totalObs) * 100) : 0}%</p>
                  <p className="text-slate-500 text-xs mt-1">Photo submission rate</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/3 border border-white/8 text-center">
                  <p className="text-2xl font-black text-amber-400">
                    {challenges.length > 0 ? Math.round((challenges.filter(c => c.correct).length / challenges.length) * 100) : 0}%
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Challenge avg. accuracy</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/3 border border-white/8 text-center">
                  <p className="text-2xl font-black text-violet-400">
                    {profiles.length > 0 ? Math.round(stats.totalXP / profiles.length).toLocaleString() : 0}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Avg. XP per user</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
