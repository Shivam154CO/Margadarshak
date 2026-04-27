/**
 * ROUTES.ts — Centralized routing constants for Ikigai
 */

export const ROUTES = {
  HOME: '/',
  SIGNUP: '/signup',
  LOGIN: '/login',
  HELP: '/help',
  COMMUNITY: '/community',
  
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_VIEW: '/profile-view',
  FAVORITES: '/favorites',
  ANALYTICS: '/analytics',
  
  COLLEGE_EXPLORER: '/college-explorer',
  COLLEGE_DETAILS: '/college-details',
  COLLEGE_BY_CODE: '/college/:code',
  COLLEGE_MAP: '/college-map',
  COLLEGE_COMPARISON: '/compare-college',
  
  OVERVIEW: '/overview',
  CAP_ROUND_GENERATOR: '/cap-generator',
  SCORECARD_OCR: '/scorecard-ocr',
  RANK_PREDICTOR: '/rank-predictor',
  ADMISSION_TIMELINE: '/admission-timeline',
  DOCUMENT_CHECKLIST: '/documents',
  
  SCHOLARSHIP_FINDER: '/scholarships',
  CUTOFF_TRENDS: '/cutoff-trends',
  POST_ADMISSION: '/post-admission',
  SEAT_VACANCY: '/seat-vacancy',
  DSE_OPTION_FORM: '/dse-option-form',
  
  DATA_PIPELINE: '/data-pipeline', // Admin / dev only
  ADMIN: '/admin',
  
  // New features
  PRICING: '/pricing',
  MENTORSHIP: '/mentorship',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',

  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
