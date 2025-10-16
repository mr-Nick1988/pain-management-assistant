// DOCTOR SPECIFIC TYPES
// Doctor использует общие типы + свои специфичные интерфейсы

// Import types for use in this file
import type {
    Patient,
    PatientUpdate,
    EMR,
    EMRUpdate,
    VAS,
    Recommendation,
    DrugRecommendation,
    Diagnosis,
} from './common/types';

// Import enums as values
import {
    PatientsGenders,
    RecommendationStatus,
    DrugRoute,
    DrugRole
} from './common/types';

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

// Для просмотра рекомендации вместе с VAS (вне контекста Patient)
export interface RecommendationWithVas {
    recommendation: Recommendation;
    vas: VAS;
    patientMrn?: string;
}

// Для approve/reject рекомендаций
export interface RecommendationApprovalRejection {
    status: RecommendationStatus;
    comment?: string;
    rejectedReason?: string; // обязательно при REJECTED
}
