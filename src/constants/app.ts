/**
 * APP.ts — Global application constants for Ikigai
 */

export const CATEGORIES = [
  'OPEN',
  'OBC',
  'SC',
  'ST',
  'EWS',
  'VJNT',
  'NT',
  'VJ',
  'NT-A',
  'NT-B',
  'NT-C',
  'NT-D',
  'SEBC',
  'SBC',
] as const;

export type Category = typeof CATEGORIES[number];

export const EXAM_TYPES = ['CET', 'Diploma'] as const;
export type ExamType = typeof EXAM_TYPES[number];

export const ADMISSION_PHASES = [
  { id: 'pre-registration', name: 'Pre-Registration' },
  { id: 'registration', name: 'Registration & Verification' },
  { id: 'cap-round-1', name: 'CAP Round 1' },
  { id: 'cap-round-2', name: 'CAP Round 2' },
  { id: 'cap-round-3', name: 'CAP Round 3' },
  { id: 'reporting', name: 'Reporting & Admission' },
] as const;

export const FILTERS = {
  SORT_OPTIONS: [
    { value: 'cutoff', label: 'Cutoff (Latest Year)' },
    { value: 'match', label: 'Match Score (AI)' },
    { value: 'fees', label: 'Fees (Low to High)' },
    { value: 'placement', label: 'Placement Rate' },
  ],
} as const;

export const ML_API_FALLBACK_URL = 'http://127.0.0.1:5001';
