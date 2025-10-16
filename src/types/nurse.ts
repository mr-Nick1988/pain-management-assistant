// NURSE TYPES - Re-export all common types for convenience
// Nurse использует все общие типы без изменений

export type {
    Patient,
    PatientUpdate,
    EMR,
    EMRUpdate,
    VAS,
    Recommendation,
    DrugRecommendation,
    Diagnosis

} from './common/types';

export {
    PatientsGenders,
    RecommendationStatus,
    DrugRoute,
    DrugRole
} from './common/types';