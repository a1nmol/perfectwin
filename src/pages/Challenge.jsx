import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Timer, CheckCircle2, XCircle, Zap, Trophy, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHALLENGES, BADGES, getLevelInfo, checkBadges, XP } from '../context/GameContext';
import { supabase } from '../utils/supabaseClient';

const TIMER_SECONDS  = 30;
const ANSWER_LABELS  = ['A', 'B', 'C', 'D'];

/* Get this week's challenge (rotates weekly) */
function getWeeklyChallenge() {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return CHALLENGES[weekNumber % CHALLENGES.length];
}

function TimerRing({ seconds, total }) {
  const pct = seconds / total;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = seconds > 15 ? '#10b981' : seconds > 7 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="font-black text-white text-lg z-10">{seconds}</span>
    </div>
  );
}

export default function Challenge() {
  const { user, profile, refreshProfile } = useAuth();
  const challenge = getWeeklyChallenge();

  const [phase, setPhase]         = useState('intro'); // intro | playing | result
  const [selected, setSelected]   = useState(null);
  const [timeLeft, setTimeLeft]   = useState(TIMER_SECONDS);
  const [xpEarned, setXpEarned]   = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const timerRef      = useRef(null);
  const handleAnswerRef = useRef(null); // stable ref to avoid stale closure in timer

  /* Check if already attempted this week */
  useEffect(() => {
    if (!user) return;
    supabase
      .from('challenge_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challenge.id)
      .single()
      .then(({ data }) => { if (data) setAlreadyDone(true); });
  }, [user, challenge.id]);

  /* Timer — calls handleAnswerRef to always get fresh closure */
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswerRef.current(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  async function handleAnswer(idx) {
    clearInterval(timerRef.current);
    setSelected(idx);
    setPhase('result');

    const correct = idx === challenge.correct;
    const earned  = correct ? XP.CHALLENGE_CORRECT : 0;

    if (user) {
      await supabase.from('challenge_attempts').insert({
        user_id:      user.id,
        challenge_id: challenge.id,
        correct,
        xp_earned:    earned,
      });

      if (correct && earned > 0) {
        const challenges_completed = (profile?.challenges_completed || 0) + 1;
        const newXp  = (profile?.xp || 0) + earned;
        const newLevel = getLevelInfo(newXp).level;

        const { error: xpError } = await supabase
          .from('profiles')
          .update({ xp: newXp, level: newLevel, challenges_completed })
          .eq('id', user.id)
          .select();

        if (xpError) {
          console.error('[Challenge] XP update error:', xpError.message, xpError.hint);
          await supabase.from('profiles').upsert(
            { id: user.id, xp: newXp, level: newLevel, challenges_completed },
            { onConflict: 'id' }
          );
        }

        setXpEarned(earned);

        // checkBadges calls refreshProfile internally — no need to call separately
        const badges = await checkBadges(
          user.id,
          { ...profile, challenges_completed, xp: newXp },
          refreshProfile
        );
        setNewBadges(badges);

        // Only refresh if no badges were earned (checkBadges already refreshed if badges found)
        if (badges.length === 0) await refreshProfile();
      }
    }
  }
  // Keep ref current so the timer closure always calls the latest version
  handleAnswerRef.current = handleAnswer;

  function startChallenge() {
    setPhase('playing');
    setSelected(null);
    setTimeLeft(TIMER_SECONDS);
    setXpEarned(0);
    setNewBadges([]);
  }

  const correct = selected === challenge.correct;

  /* ── Auth gate ─────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-5 text-3xl">
            🎯
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to play</h2>
          <p className="text-slate-400 text-sm mb-6">Identify birds and earn up to +{XP.CHALLENGE_CORRECT} XP weekly.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all">
            Sign In / Join <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Already done this week ───────────────────────────── */
  if (alreadyDone && phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.06),transparent_60%)] pointer-events-none" />
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
          <p className="text-slate-400 text-sm mb-2">You've already completed this week's challenge.</p>
          <p className="text-slate-500 text-xs mb-8">Next challenge unlocks Monday. Keep logging sightings for more XP!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/submit" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all text-sm">
              Log a Sighting
            </Link>
            <Link to="/leaderboard" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all text-sm">
              Leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4 py-20">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            Weekly Bird ID Challenge · +{XP.CHALLENGE_CORRECT} XP
          </div>
          <h1 className="text-3xl font-black text-white">Can You Identify It?</h1>
        </div>

        {/* Intro */}
        {phase === 'intro' && (
          <div className="bg-white/3 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="relative h-48 sm:h-64 bg-slate-800 overflow-hidden">
              <img
                src={challenge.image}
                alt="Mystery bird"
                className="w-full h-full object-cover opacity-50 blur-sm scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">{challenge.emoji}</div>
                  <p className="text-white font-semibold text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                    Reveal on start
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-white font-bold text-lg mb-2">{challenge.question}</h2>
              <p className="text-slate-400 text-sm mb-6">You have {TIMER_SECONDS} seconds. Answer correctly to earn +{XP.CHALLENGE_CORRECT} XP.</p>
              <button
                onClick={startChallenge}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-base transition-all shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" /> Start Challenge
              </button>
            </div>
          </div>
        )}

        {/* Playing */}
        {phase === 'playing' && (
          <div className="bg-white/3 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="relative h-48 sm:h-64 bg-slate-800 overflow-hidden">
              <img
                src={challenge.image}
                alt="Bird to identify"
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display='none'; }}
              />
              <div className="absolute top-4 right-4">
                <TimerRing seconds={timeLeft} total={TIMER_SECONDS} />
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-white font-bold text-base mb-5">{challenge.question}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium text-left hover:bg-white/10 hover:border-sky-500/30 hover:text-sky-300 transition-all"
                  >
                    <span className="text-slate-500 mr-2">{ANSWER_LABELS[idx]}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="bg-white/3 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="relative h-48 sm:h-56 bg-slate-800 overflow-hidden">
              <img
                src={challenge.image}
                alt={challenge.options[challenge.correct]}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display='none'; }}
              />
              <div className={`absolute inset-0 flex items-end p-4 bg-gradient-to-t ${correct ? 'from-emerald-900/70' : 'from-red-900/70'} to-transparent`}>
                <div className="flex items-center gap-3">
                  {correct
                    ? <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    : <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                  }
                  <div>
                    <p className={`font-bold text-lg ${correct ? 'text-emerald-300' : 'text-red-300'}`}>
                      {correct ? 'Correct!' : selected === null ? 'Time\'s up!' : 'Not quite!'}
                    </p>
                    <p className="text-white text-sm">{challenge.options[challenge.correct]}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* XP */}
              {correct && xpEarned > 0 && (
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  <Zap className="w-5 h-5" /> +{xpEarned} XP earned!
                </div>
              )}

              {/* New badges */}
              {newBadges.length > 0 && (
                <div className="flex items-center justify-center gap-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-400 text-sm font-semibold">
                  {newBadges.map(b => (
                    <span key={b} className="text-2xl" title={BADGES.find(bd => bd.id === b)?.name}>
                      {BADGES.find(bd => bd.id === b)?.icon || '🏅'}
                    </span>
                  ))}
                  New badge{newBadges.length > 1 ? 's' : ''} unlocked!
                </div>
              )}

              {/* Options review */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challenge.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border ${
                      idx === challenge.correct
                        ? 'bg-emerald-500/12 border-emerald-500/25 text-emerald-400'
                        : idx === selected && idx !== challenge.correct
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-white/2 border-white/6 text-slate-600'
                    }`}
                  >
                    {idx === challenge.correct ? '✓' : idx === selected ? '✗' : <span className="text-slate-700">{ANSWER_LABELS[idx]}.</span>} {opt}
                  </div>
                ))}
              </div>

              {/* Fact */}
              <div className="p-4 rounded-2xl bg-sky-500/8 border border-sky-500/15">
                <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">Did you know?</p>
                <p className="text-slate-300 text-sm leading-relaxed">{challenge.fact}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  to="/submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all text-sm"
                >
                  Log a Sighting
                </Link>
                <Link
                  to="/leaderboard"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all text-sm"
                >
                  Leaderboard <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* All challenges preview */}
        {phase === 'intro' && (
          <div className="mt-5 p-4 rounded-2xl bg-white/2 border border-white/6">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Coming up</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CHALLENGES.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${
                    c.id === challenge.id
                      ? 'border-sky-500/40 bg-sky-500/10'
                      : 'border-white/6 bg-white/3 opacity-50'
                  }`}
                  title={c.options[c.correct]}
                >
                  {c.emoji}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
