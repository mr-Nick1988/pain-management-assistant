// DOCTOR SPECIFIC TYPES
// Doctor использует общие типы + свои специфичные интерфейсы

// Import types for use in this file
import type {
    Diagnosis,
    DrugRecommendation,
    EMR,
    EMRUpdate,
    Patient,
    PatientUpdate,
    Recommendation,
    VAS,
} from './common/types';
// Import enums as values
import {DrugRole, DrugRoute, PatientsGenders, RecommendationStatus} from './common/types';

// Re-export everything for convenience
export type {
    Patient,
    PatientUpdate,
    EMR,
    EMRUpdate,
    VAS,
    Recommendation,
    DrugRecommendation,
    Diagnosis
};

export {
    PatientsGenders,
    RecommendationStatus,
    DrugRoute,
    DrugRole
};

// ============================================
// DOCTOR-SPECIFIC INTERFACES
// ============================================

