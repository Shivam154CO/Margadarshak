/**
 * STORAGE.ts — Centralized local storage keys for Ikigai
 */

export const STORAGE_KEYS = {
  FAVORITES: 'favoriteColleges', // Now mostly unified via useFavorites
  POST_ADMISSION: 'ikigai-post-admission',
  THEME: 'ikigai-theme',
  USER_PROFILE: 'ikigai-user-profile-cache',
  SCORECARD_RESULTS: 'ikigai-scorecard-results',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
