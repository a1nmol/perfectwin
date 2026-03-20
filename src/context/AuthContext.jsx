import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

/* ── cache helpers (module-level — stable references, no re-creation) ── */
const cacheKey    = uid  => `ecolens_profile_${uid}`;
const loadFromCache = uid => { try { const r = localStorage.getItem(cacheKey(uid)); return r ? JSON.parse(r) : null; } catch (_) { return null; } };
const saveToCache = (uid, d) => { try { localStorage.setItem(cacheKey(uid), JSON.stringify(d)); } catch (_) {} };
const clearCache  = uid  => { try { localStorage.removeItem(cacheKey(uid)); } catch (_) {} };

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── fetch profile from DB (background, non-blocking) ────── */
  async function fetchProfileFromDB(authUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setProfile(data);
      saveToCache(authUser.id, data);
      return;
    }

    // Profile row missing — create it (trigger fallback)
    const base     = (authUser.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
    const username = authUser.user_metadata?.username || base;

    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: authUser.id, username }, { onConflict: 'id' })
      .select()
      .single();

    if (created) {
      setProfile(created);
      saveToCache(authUser.id, created);
    }
  }

  /* ── initialise session ──────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        // Load from cache FIRST → instant render, no spinner
        const cached = loadFromCache(u.id);
        if (cached) {
          setProfile(cached);
          setLoading(false);           // unblock UI immediately
          fetchProfileFromDB(u);       // refresh in background (no await)
        } else {
          // No cache — fetch from DB, THEN unblock
          fetchProfileFromDB(u).finally(() => setLoading(false));
        }
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESHED is just a silent JWT rotation — no need to re-fetch the profile
      if (event === 'TOKEN_REFRESHED') return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const cached = loadFromCache(u.id);
        if (cached) setProfile(cached);
        fetchProfileFromDB(u);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line

  /* ── auth actions ────────────────────────────────────────── */
  async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    if (user) clearCache(user.id);
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  }

  async function refreshProfile() {
    if (user) await fetchProfileFromDB(user);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
