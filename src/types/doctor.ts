// DOCTOR SPECIFIC TYPES
// Currently no specific doctor types - doctor functionality uses Patient and Recommendation types
// This file is kept for future doctor-specific interfaces if needed

// Re-export common types for convenience
export type { Patient, PatientCreation } from './patient';
export type { Recommendation, RecommendationStatus, RecommendationApproval } from './recommendation';
