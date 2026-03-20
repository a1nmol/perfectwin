import { createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const GameContext = createContext(null);

/* ── Badge definitions ──────────────────────────────────────── */
export const BADGES = [
  { id: 'first_sighting',   name: 'First Sighting',       icon: '🔭', desc: 'Submit your first observation',    xp_reward: 25  },
  { id: 'observer_5',       name: 'Field Observer',        icon: '🦅', desc: 'Submit 5 observations',            xp_reward: 50  },
  { id: 'watcher_10',       name: 'Wildlife Watcher',      icon: '🌿', desc: 'Submit 10 observations',           xp_reward: 100 },
  { id: 'challenger',       name: 'Quiz Taker',            icon: '🎯', desc: 'Complete your first ID challenge', xp_reward: 25  },
  { id: 'streak_7',         name: 'Week Warrior',          icon: '🔥', desc: '7-day login streak',               xp_reward: 75  },
  { id: 'colony_guardian',  name: 'Colony Guardian',       icon: '🏡', desc: 'Adopt your first colony',          xp_reward: 50  },
  { id: 'trusted_reporter', name: 'Trusted Reporter',      icon: '✅', desc: '5 verified sightings',             xp_reward: 150 },
  { id: 'xp_500',           name: 'Conservation Hero',     icon: '⭐', desc: 'Earn 500 XP',                     xp_reward: 0   },
  { id: 'xp_1000',          name: 'Expert Ornithologist',  icon: '🦜', desc: 'Earn 1000 XP',                    xp_reward: 0   },
];

/* ── Level thresholds ───────────────────────────────────────── */
export const LEVELS = [
  { level: 1, title: 'Newcomer',           min: 0    },
  { level: 2, title: 'Citizen Scientist',  min: 100  },
  { level: 3, title: 'Observer',           min: 250  },
  { level: 4, title: 'Contributor',        min: 500  },
  { level: 5, title: 'Field Researcher',   min: 1000 },
  { level: 6, title: 'Expert Ornithologist', min: 2000 },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) current = l;
  }
  const next = LEVELS.find(l => l.min > xp);
  const progress = next
    ? Math.round(((xp - current.min) / (next.min - current.min)) * 100)
    : 100;
  return { ...current, next, progress };
}

/* ── XP values ──────────────────────────────────────────────── */
export const XP = {
  SIGHTING:         10,
  SIGHTING_VERIFIED:25,
  ANNOTATION:       20,
  CHALLENGE_CORRECT:50,
  DAILY_LOGIN:      5,
  ADOPT_COLONY:     15,
};

/* ── Weekly bird ID challenges ──────────────────────────────── */
export const CHALLENGES = [
  {
    id: 'brown-pelican',
    question: 'Louisiana\'s beloved state bird — which is it?',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Brown_pelican_on_post.jpg/480px-Brown_pelican_on_post.jpg',
    emoji: '🐦',
    options: ['Brown Pelican', 'Great Blue Heron', 'Double-crested Cormorant', 'White Ibis'],
    correct: 0,
    fact: 'The Brown Pelican is Louisiana\'s state bird! Removed from the Endangered Species list in 2009, it\'s a conservation success story.',
  },
  {
    id: 'roseate-spoonbill',
    question: 'This pink wading bird sweeps its spatula-shaped bill side to side. What is it?',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Roseate_Spoonbill_%28Platalea_ajaja%29_RWD4.jpg/480px-Roseate_Spoonbill_%28Platalea_ajaja%29_RWD4.jpg',
    emoji: '🦩',
    options: ['Flamingo', 'Roseate Spoonbill', 'Wood Stork', 'Pink-footed Goose'],
    correct: 1,
    fact: 'The Roseate Spoonbill gets its pink color from the crustaceans it eats! It\'s a flagship species for Louisiana wetland health.',
  },
  {
    id: 'great-blue-heron',
    question: 'This tall, slate-blue bird stands motionless waiting to strike fish. Which species?',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Great_Blue_Heron-27527-2.jpg/480px-Great_Blue_Heron-27527-2.jpg',
    emoji: '🦅',
    options: ['Sandhill Crane', 'Great Egret', 'Great Blue Heron', 'Tricolored Heron'],
    correct: 2,
    fact: 'Great Blue Herons can stand over 4 feet tall and have a wingspan of 6 feet — one of North America\'s largest wading birds.',
  },
  {
    id: 'royal-tern',
    question: 'This colonial nesting tern has an orange bill and a shaggy black crest. Name it!',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Royal_Tern_%28Thalasseus_maximus%29.jpg/480px-Royal_Tern_%28Thalasseus_maximus%29.jpg',
    emoji: '🐤',
    options: ['Caspian Tern', 'Sandwich Tern', 'Royal Tern', 'Forster\'s Tern'],
    correct: 2,
    fact: 'Royal Terns nest in massive colonies on Louisiana\'s barrier islands — sometimes over 10,000 pairs on a single island!',
  },
  {
    id: 'snowy-egret',
    question: 'Small, all-white with yellow feet and a black bill — which egret is this?',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Snowy_Egret_Stick_-_Hilton_Head.jpg/480px-Snowy_Egret_Stick_-_Hilton_Head.jpg',
    emoji: '🕊️',
    options: ['Great Egret', 'Cattle Egret', 'Snowy Egret', 'Little Blue Heron'],
    correct: 2,
    fact: 'Snowy Egrets were nearly hunted to extinction in the 1800s for their elegant breeding plumes. Now a recovery symbol of conservation success.',
  },
  {
    id: 'white-ibis',
    question: 'Bright red curved bill, all-white plumage — what coastal bird is this?',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/White_ibis_in_Florida.jpg/480px-White_ibis_in_Florida.jpg',
    emoji: '🦢',
    options: ['Wood Stork', 'White Ibis', 'American Avocet', 'Whooping Crane'],
    correct: 1,
    fact: 'White Ibis form huge feeding flocks, probing mud with their curved bills for crustaceans. They\'re a keystone species of Louisiana marshes.',
  },
  {
    id: 'laughing-gull',
    question: 'Black head, red bill, raucous "ha-ha-ha" call — which gull breeds across Louisiana?',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Larus_atricilla_-Barnegat_Inlet%2C_New_Jersey%2C_USA-8.jpg/480px-Larus_atricilla_-Barnegat_Inlet%2C_New_Jersey%2C_USA-8.jpg',
    emoji: '🐦',
    options: ['Bonaparte\'s Gull', 'Ring-billed Gull', 'Herring Gull', 'Laughing Gull'],
    correct: 3,
    fact: 'Laughing Gulls are the only gull that regularly nests in Louisiana, forming colonies of thousands on barrier islands.',
  },
];

/* ── Helper: award XP ───────────────────────────────────────── */
export async function awardXP(userId, amount, currentProfile, refreshProfile) {
  const newXp = (currentProfile?.xp || 0) + amount;
  const newLevel = getLevelInfo(newXp).level;

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel })
    .eq('id', userId)
    .select();

  // Treat empty data as an RLS silent block (no error thrown but 0 rows affected)
  if (error || !updated?.length) {
    console.error('[awardXP] update blocked:', error?.message || 'RLS silent failure (0 rows)');
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: userId, xp: newXp, level: newLevel }, { onConflict: 'id' });
    if (upsertError) {
      console.error('[awardXP] Upsert also failed:', upsertError.message);
      return newXp;
    }
  }

  await refreshProfile();
  return newXp;
}

/* ── Helper: check & award badges ───────────────────────────── */
export async function checkBadges(userId, profile, refreshProfile) {
  const earned = profile?.badges || [];
  const newBadges = [];

  const checks = [
    { id: 'first_sighting',   cond: profile?.sightings_count >= 1 },
    { id: 'observer_5',       cond: profile?.sightings_count >= 5 },
    { id: 'watcher_10',       cond: profile?.sightings_count >= 10 },
    { id: 'challenger',       cond: (profile?.challenges_completed || 0) >= 1 },
    { id: 'colony_guardian',  cond: (profile?.adopted_colonies?.length || 0) >= 1 },
    { id: 'trusted_reporter', cond: profile?.verified_count >= 5 },
    { id: 'xp_500',           cond: profile?.xp >= 500 },
    { id: 'xp_1000',          cond: profile?.xp >= 1000 },
  ];

  for (const check of checks) {
    if (check.cond && !earned.includes(check.id)) {
      newBadges.push(check.id);
    }
  }

  if (newBadges.length > 0) {
    const allBadges = [...earned, ...newBadges];
    // Award bonus XP for new badges
    let bonusXp = 0;
    for (const badgeId of newBadges) {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge) bonusXp += badge.xp_reward;
    }

    const newXp = (profile?.xp || 0) + bonusXp;
    const { data: badgeUpdated, error: badgeError } = await supabase
      .from('profiles')
      .update({ badges: allBadges, xp: newXp, level: getLevelInfo(newXp).level })
      .eq('id', userId)
      .select();
    if (badgeError || !badgeUpdated?.length) {
      console.error('[checkBadges] update blocked:', badgeError?.message || 'RLS silent failure');
      await supabase.from('profiles').upsert({ id: userId, badges: allBadges, xp: newXp, level: getLevelInfo(newXp).level }, { onConflict: 'id' });
    }

    await refreshProfile();
  }

  return newBadges;
}

export function GameProvider({ children }) {
  return (
    <GameContext.Provider value={{ BADGES, LEVELS, CHALLENGES, XP, getLevelInfo, awardXP, checkBadges }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
