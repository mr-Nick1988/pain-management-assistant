// COMMON TYPES - используются и Nurse, и Doctor
// Эти типы соответствуют backend DTO

// ============================================
// ENUMS
// ============================================

export enum PatientsGenders {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export enum RecommendationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ESCALATED = "ESCALATED",
    EXECUTED = "EXECUTED"
}

export enum DrugRoute {
    PO = "PO",      // per oral
    IV = "IV",      // intravenous
    IM = "IM",      // intramuscular
    SC = "SC",      // subcutaneous
    SL = "SL"       // sublingual
}

export enum DrugRole {
    MAIN = "MAIN",
    ALTERNATIVE = "ALTERNATIVE"
}

// ============================================
// PATIENT
// ============================================

export interface Patient {
    mrn?: string; // Medical Record Number - business identifier
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: PatientsGenders;
    insurancePolicyNumber: string;
    phoneNumber: string;
    email?: string;
    address: string;
    additionalInfo?: string;
    isActive?: boolean;

    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    emr?: EMR[];
    vas?: VAS[];
    recommendations?: Recommendation[];
}

export interface PatientUpdate {
    firstName?: string;
    lastName?: string;
    gender?: PatientsGenders;
    insurancePolicyNumber?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    additionalInfo?: string;
    isActive?: boolean;
    updatedAt?: string;
    updatedBy?: string;
}

// ============================================
// EMR (Electronic Medical Record)
// ============================================

export interface EMR {
    height: number;
    weight: number;
    gfr: string; // функция почек
    childPughScore?: string; // печень
    plt: number; // тромбоциты
    wbc: number; // лейкоциты
    sat: number; // сатурация
    sodium: number; // натрий
    sensitivities?: string[]; // чувствительность
    diagnoses?: Diagnosis[]; // хронические болезни

    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    patientMrn?: string; // для запросов вне контекста Patient
}

export interface EMRUpdate {
    height?: number;
    weight?: number;
    gfr?: string;
    childPughScore?: string;
    plt?: number;
    wbc?: number;
    sat?: number;
    sensitivities?: string[];
    diagnoses?: Diagnosis[];
    sodium?: number;
    updatedAt?: string;
    updatedBy?: string;
}

export interface Diagnosis {
    icdCode: string;
    description: string;
}

// ============================================
// VAS (Visual Analog Scale)
// ============================================

export interface VAS {
    painPlace: string;
    painLevel: number; // 0-10
    resolved?: boolean
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    patientMrn?: string; // для запросов вне контекста Patient
}

// ============================================
// DRUG RECOMMENDATION
// ============================================

export interface DrugRecommendation {
    drugName: string;
    activeMoiety: string; // активное вещество
    dosing: string;
    interval: string;
    route: DrugRoute;
    role: DrugRole; // основное или альтернативное

    patientMrn?: string; // для запросов вне контекста Patient
}

// ============================================
// RECOMMENDATION
// ============================================

export interface Recommendation {
    id?: number; // backend identifier
    regimenHierarchy: number; // первая линия, вторая и т.д.
    status: RecommendationStatus;
    rejectedReason?: string;

    drugs?: DrugRecommendation[];
    contraindications?: string[];
    comments?: string[];
    generationFailed?: boolean;
    rejectionReasonsSummary?:string[];
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    patientMrn?: string; // для запросов вне контекста Patient
}

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