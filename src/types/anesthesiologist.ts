import type {DrugRecommendation,} from './common/types';





// ============================================
// ANESTHESIOLOGIST EXCLUSIVE TYPES
// ============================================

/**
 * Соответствует backend классу AnesthesiologistRecommendationCreateDTO
 * Используется при создании новой рекомендации после отклонения.
 */
export interface AnesthesiologistRecommendationCreate {
    previousRecommendationId: number; // ID старой рекомендации (для связи)
    patientMrn: string;               // идентификатор пациента
    regimenHierarchy: number;         // линия терапии
    drugs: DrugRecommendation[];   // препараты (main + alternative)
    contraindications?: string[];
    comments?: string[];
}

/**
 * Соответствует backend классу AnesthesiologistRecommendationUpdateDTO
 * Используется для корректировки существующей рекомендации перед одобрением.
 */
export interface AnesthesiologistRecommendationUpdate {
    drugs?: DrugRecommendation[];
    contraindications?: string[];
    comment: string; // пояснительный комментарий (обязателен)
}