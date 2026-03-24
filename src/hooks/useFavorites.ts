/**
 * useFavorites — Supabase-backed favorites hook
 *
 * Strategy:
 *  • Primary store: Supabase `user_favorites` table (persists across devices)
 *  • Fast cache:    localStorage `favoriteColleges` (for instant reads on page load)
 *  • All writes go to Supabase first, then mirror to localStorage
 *  • On mount, localStorage is used to immediately paint the UI while the
 *    Supabase fetch completes in the background. Once Supabase responds, the
 *    localStorage cache is refreshed with the canonical server data.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FavoriteCollege {
  college_code: string;
  college_name: string;
  city: string;
  branch: string;
  branch_name: string;
  branch_code: string;
  fees: number;
  placement_rate: number;
  cutoff_rank: number;
  cutoff_percentile: number;
  category: string;
  average_package_lpa: number;
  highest_package_lpa: number;
  total_intake: number;
  seats: number;
  autonomy_status: string;
  hostel_available: string;
  image: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  probability_level: string;
  is_most_probable: boolean;
  admission_chance: number;
  admission_chance_percentage: string;
  fit: string;
  fit_reason: string;
  match_score: number;
  match_percentage: string;
  display_fees: string;
  display_seats: string;
  display_cutoff: string;
  display_placement?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const LS_KEY = 'favoriteColleges';

// ── Helpers ────────────────────────────────────────────────────────────────────

function readLocalStorage(): FavoriteCollege[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as FavoriteCollege[]) : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(colleges: FavoriteCollege[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(colleges));
  } catch {
    // storage full — ignore
  }
}

function compositeKey(college_code: string, branch: string) {
  return `${college_code}_${branch}`;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useFavorites() {
  const queryClient = useQueryClient();

  // ── 1. Immediate paint from localStorage ─────────────────────────────────────
  const [favorites, setFavorites] = useState<FavoriteCollege[]>(readLocalStorage);

  // Set of composite keys for O(1) membership checks
  const favoriteKeys = new Set(favorites.map(c => compositeKey(c.college_code, c.branch)));

  // Track whether we have an authenticated session
  const [userId, setUserId] = useState<string | null>(null);

  // Prevent duplicate Supabase fetches on first render
  const hasFetched = useRef(false);

  // ── 2. Resolve auth session ───────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── 3. Fetch from Supabase once we know the user ─────────────────────────────
  const { data: supabaseFavorites, isLoading } = useQuery({
    queryKey: ['user_favorites', userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
            // Table doesn't exist yet, gracefully use local storage
            return null;
        }
        console.warn('[useFavorites] fetch error:', error);
        return null;
      }
      return data as FavoriteCollege[];
    },
  });

  // ── 4. Sync Supabase → state → localStorage ───────────────────────────────────
  useEffect(() => {
    if (supabaseFavorites !== undefined && supabaseFavorites !== null) {
      setFavorites(supabaseFavorites);
      writeLocalStorage(supabaseFavorites);
      hasFetched.current = true;
    }
  }, [supabaseFavorites]);

  // ── 5. Add Favorite ───────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (college: FavoriteCollege) => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .upsert(
          { user_id: userId, ...college },
          { onConflict: 'user_id,college_code,branch', ignoreDuplicates: true }
        );

      if (error) throw error;
      return college;
    },
    // Optimistic update: show immediately in UI
    onMutate: async (college) => {
      const key = compositeKey(college.college_code, college.branch);
      setFavorites(prev => {
        if (prev.some(c => compositeKey(c.college_code, c.branch) === key)) return prev;
        const next = [college, ...prev];
        writeLocalStorage(next);
        return next;
      });
    },
    onError: (err, college) => {
      // Rollback optimistic update
      console.error('[useFavorites] add error:', err);
      setFavorites(prev => {
        const next = prev.filter(
          c => compositeKey(c.college_code, c.branch) !== compositeKey(college.college_code, college.branch)
        );
        writeLocalStorage(next);
        return next;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_favorites', userId] });
    },
  });

  // ── 6. Remove Favorite ────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async ({ college_code, branch }: { college_code: string; branch: string }) => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('college_code', college_code)
        .eq('branch', branch);

      if (error) throw error;
    },
    // Optimistic update: remove immediately from UI
    onMutate: async ({ college_code, branch }) => {
      const key = compositeKey(college_code, branch);
      setFavorites(prev => {
        const next = prev.filter(c => compositeKey(c.college_code, c.branch) !== key);
        writeLocalStorage(next);
        return next;
      });
    },
    onError: (err) => {
      console.error('[useFavorites] remove error:', err);
      // Re-fetch from Supabase to restore correct state
      queryClient.invalidateQueries({ queryKey: ['user_favorites', userId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_favorites', userId] });
    },
  });

  // ── 7. Toggle helper (used by Dashboard cards) ────────────────────────────────
  const toggleFavorite = useCallback((college: FavoriteCollege) => {
    const key = compositeKey(college.college_code, college.branch);
    if (favoriteKeys.has(key)) {
      removeMutation.mutate({ college_code: college.college_code, branch: college.branch });
    } else {
      addMutation.mutate(college);
    }
  }, [favoriteKeys, addMutation, removeMutation]);

  // ── 8. Quick membership check ──────────────────────────────────────────────────
  const isFavorite = useCallback(
    (college_code: string, branch: string) =>
      favoriteKeys.has(compositeKey(college_code, branch)),
    [favoriteKeys]
  );

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isAuthenticated: !!userId,
  };
}
