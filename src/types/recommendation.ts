export enum RecommendationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export interface Patient {
    id: string; // Technical database ID (not shown to users)
    mrn: string; // Medical Record Number - business identifier
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    insurancePolicyNumber?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    additionalInfo?: string;
    createdBy: number;
    updatedBy?: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Recommendation {
    id: string;
    patientId: string;
    patient?: Patient;
    description: string;
    justification: string;
    status: RecommendationStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    rejectionReason?: string;
    doctorComment?: string;
}

export interface RecommendationApproval {
    recommendationId: string;
    status: RecommendationStatus;
    comment: string;
    rejectedReason?: string;
}

export interface PatientCreation {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date string
    gender: string;
    insurancePolicyNumber?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    additionalInfo?: string;
    createdBy: string;
}
