// RECOMMENDATION TYPES
import type {Patient} from "./doctor.ts";

export enum RecommendationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
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
