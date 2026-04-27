/**
 * App Configuration Constants
 * Centralized place for years, versions, and session-specific labels.
 */

export const APP_CONFIG = {
  CURRENT_YEAR: "2024-25",
  UPCOMING_YEAR: "2025-26",
  NEXT_YEAR: "2026",
  ACADEMIC_SESSION: "2024-25",
  
  // Versions
  API_VERSION: "v3.0",
  
  // Labels
  PLATFORM_NAME: "SmartCF",
  PLATFORM_TAGLINE: "Maharashtra's #1 Engineering Admission Predictor",
  
  // Cutoff Reference
  CUTOFF_YEAR_LABEL: "Historical DSE CAP Round cutoffs",
  DATA_SOURCE_LABEL: "Based on 2024-25 CAP Rounds",
} as const;

export const ROUTES_CONFIG = {
  // Any specific route-based config can go here
};
