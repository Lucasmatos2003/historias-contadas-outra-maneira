import { useEffect, useState } from 'react';
import { getAccessToken, mapUser, supabase } from '../supabase';

export function useAuth() {
  const [state, setState] = useState({ user: null, profile: null, loading: Boolean(supabase) });

  const refreshUser = async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const mapped = mapUser(data.user);
    setState((current) => ({ ...current, user: mapped }));
    return mapped;
  };

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    const update = async (userOrSession) => {
      const user = userOrSession?.user || userOrSession;
      if (!user) return setState({ user: null, profile: null, loading: false });
      const mappedUser = mapUser(user);
      let profile = { role: 'writer', displayName: mappedUser.displayName, photoURL: mappedUser.photoURL };
      try {
        const token = await getAccessToken();
        const response = await fetch('/api/profiles/upsert', { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o perfil.');
        profile = { ...profile, ...result };
      } catch (error) {
        console.error('Não foi possível carregar o perfil salvo.', error);
      }
      if (active) setState({ user: mappedUser, profile, loading: false });
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        update(data.user);
      } else {
        supabase.auth.getSession().then(({ data: sessionData }) => update(sessionData.session?.user)).catch(() => {
          if (active) setState({ user: null, profile: null, loading: false });
        });
      }
    }).catch(() => {
      supabase.auth.getSession().then(({ data: sessionData }) => update(sessionData.session?.user)).catch(() => {
        if (active) setState({ user: null, profile: null, loading: false });
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        const user = session?.user ?? null;
        update(user);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const updateProfileState = (data) => setState((current) => ({
    ...current,
    profile: { ...current.profile, ...data },
    user: current.user ? { ...current.user, displayName: data.displayName ?? current.user.displayName, photoURL: data.photoURL ?? current.user.photoURL } : current.user
  }));

  return { ...state, refreshUser, updateProfileState };
}
