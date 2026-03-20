import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Bird, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLevelInfo, BADGES } from '../context/GameContext';
import { supabase } from '../utils/supabaseClient';

/* Seed community data so the board looks alive from day 1 */
const SEED_USERS = [
  { username: 'pelican_pete',     xp: 2840, sightings_count: 187, badges: ['first_sighting','observer_5','watcher_10','colony_guardian','xp_500','xp_1000'], verified_count: 43 },
  { username: 'bayou_birder',     xp: 2210, sightings_count: 134, badges: ['first_sighting','observer_5','watcher_10','colony_guardian','xp_500','xp_1000'], verified_count: 28 },
  { username: 'marsh_maven',      xp: 1890, sightings_count: 112, badges: ['first_sighting','observer_5','watcher_10','xp_500','xp_1000'], verified_count: 19 },
  { username: 'tern_tracker',     xp: 1540, sightings_count: 89,  badges: ['first_sighting','observer_5','watcher_10','xp_500'], verified_count: 12 },
  { username: 'spoonbill_sara',   xp: 1230, sightings_count: 71,  badges: ['first_sighting','observer_5','watcher_10','xp_500'], verified_count: 9 },
  { username: 'egret_explorer',   xp: 960,  sightings_count: 55,  badges: ['first_sighting','observer_5','watcher_10'], verified_count: 7 },
  { username: 'heron_hunter',     xp: 780,  sightings_count: 42,  badges: ['first_sighting','observer_5'], verified_count: 5 },
  { username: 'coastal_cal',      xp: 590,  sightings_count: 31,  badges: ['first_sighting','observer_5'], verified_count: 3 },
  { username: 'ibis_investigator',xp: 420,  sightings_count: 22,  badges: ['first_sighting'], verified_count: 2 },
  { username: 'gulls_galore',     xp: 280,  sightings_count: 14,  badges: ['first_sighting'], verified_count: 1 },
];

function RankIcon({ rank }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-slate-500 font-bold text-base w-7 text-center">#{rank}</span>;
}

function LeaderRow({ rank, entry, isCurrentUser }) {
  const levelInfo = getLevelInfo(entry.xp);
  const top3 = rank <= 3;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
      isCurrentUser
        ? 'bg-emerald-500/8 border-emerald-500/25 ring-1 ring-emerald-500/20'
        : top3
          ? 'bg-white/4 border-white/10 hover:bg-white/6'
          : 'bg-white/2 border-white/6 hover:bg-white/4'
    }`}>

      {/* Rank */}
      <div className="w-8 flex-shrink-0 flex justify-center">
        <RankIcon rank={rank} />
      </div>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
        top3 ? 'bg-amber-500/15 border border-amber-500/20' : 'bg-white/5 border border-white/8'
      }`}>
        🦅
      </div>

      {/* Name + level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
            @{entry.username}
          </span>
          {isCurrentUser && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">YOU</span>
          )}
        </div>
        <p className="text-slate-500 text-xs">{levelInfo.title}</p>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-1">
        {(entry.badges || []).slice(0, 4).map((b, i) => (
          <span key={i} className="text-sm" title={BADGES.find(bd => bd.id === b)?.name || b}>
            {BADGES.find(bd => bd.id === b)?.icon || '🎯'}
          </span>
        ))}
        {(entry.badges || []).length > 4 && (
          <span className="text-slate-600 text-xs">+{entry.badges.length - 4}</span>
        )}
      </div>

      {/* Sightings */}
      <div className="hidden md:block text-right flex-shrink-0">
        <p className="text-white text-sm font-semibold">{entry.sightings_count}</p>
        <p className="text-slate-600 text-xs">sightings</p>
      </div>

      {/* XP */}
      <div className="text-right flex-shrink-0 min-w-[60px]">
        <p className={`font-bold text-base ${top3 ? 'text-amber-400' : 'text-emerald-400'}`}>{entry.xp.toLocaleString()}</p>
        <p className="text-slate-600 text-[10px] uppercase tracking-wide">XP</p>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [period, setPeriod]     = useState('all'); // 'all' | 'month' | 'week'

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('username, xp, sightings_count, verified_count, badges, level')
        .order('xp', { ascending: false })
        .limit(50);

      const real = (data || []).filter(r => r.username);
      // Merge seed + real, deduplicate by username
      const seedFiltered = SEED_USERS.filter(s => !real.find(r => r.username === s.username));
      const merged = [...real, ...seedFiltered].sort((a, b) => b.xp - a.xp);
      setEntries(merged);
      setLoading(false);
    }
    load();
  }, []); // period filtering not yet implemented server-side; fetch once

  const currentUserRank = profile
    ? entries.findIndex(e => e.username === profile?.username) + 1
    : null;

  const topThree = entries.slice(0, 3);
  const rest     = entries.slice(3);

  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-20 px-4">
      {/* Ambient */}
      <div className="fixed top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/4 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-emerald-500/4 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Community Rankings
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-2">Top citizen scientists protecting Louisiana's coast</p>
        </div>

        {/* User rank banner */}
        {user && profile && currentUserRank > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦅</span>
              <div>
                <p className="text-emerald-400 font-semibold text-sm">Your ranking</p>
                <p className="text-slate-400 text-xs">Keep submitting sightings to climb!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-2xl">#{currentUserRank}</p>
              <p className="text-emerald-400 text-xs font-semibold">{(profile?.xp || 0).toLocaleString()} XP</p>
            </div>
          </div>
        )}

        {/* Period tabs */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-6 max-w-xs mx-auto">
          {[['all','All Time'],['month','This Month'],['week','This Week']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                period === val ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[topThree[1], topThree[0], topThree[2]].map((entry, idx) => {
                  if (!entry) return <div key={idx} />;
                  const actualRank = entry === topThree[0] ? 1 : entry === topThree[1] ? 2 : 3;
                  const heights = ['h-28', 'h-36', 'h-24'];
                  const h = idx === 1 ? heights[0] : idx === 0 ? heights[1] : heights[2];
                  return (
                    <div key={entry.username} className="flex flex-col items-center gap-2">
                      <span className="text-3xl">
                        {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                        🦅
                      </div>
                      <p className="text-white text-xs font-semibold truncate max-w-full px-2 text-center">
                        @{entry.username}
                      </p>
                      <p className="text-amber-400 font-bold text-sm">{entry.xp.toLocaleString()}</p>
                      <div className={`w-full ${h} rounded-t-xl flex items-end justify-center pb-2 ${
                        actualRank === 1 ? 'bg-gradient-to-t from-amber-500/20 to-amber-500/5 border border-amber-500/20' :
                        actualRank === 2 ? 'bg-gradient-to-t from-slate-400/15 to-slate-400/5 border border-slate-400/15' :
                        'bg-gradient-to-t from-amber-700/15 to-amber-700/5 border border-amber-700/15'
                      }`}>
                        <span className="text-slate-400 text-xs">#{actualRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <LeaderRow
                  key={entry.username}
                  rank={idx + 1}
                  entry={entry}
                  isCurrentUser={profile?.username === entry.username}
                />
              ))}
            </div>

            {/* Stats footer */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: Bird,      value: entries.length,                        label: 'Active Scientists' },
                { icon: Zap,       value: entries.reduce((s,e)=>s+e.xp,0).toLocaleString(), label: 'Total XP Earned' },
                { icon: TrendingUp,value: entries.reduce((s,e)=>s+(e.sightings_count||0),0).toLocaleString(), label: 'Total Sightings' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center p-4 rounded-2xl bg-white/3 border border-white/8">
                  <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-slate-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
