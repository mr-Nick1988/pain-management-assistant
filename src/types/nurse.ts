// Re-export common types for convenience

export interface Patient {
    mrn?: string; // Medical Record Number - business identifier
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    insurancePolicyNumber: string;
    phoneNumber: string;
    email?: string;
    address: string;
    additionalInfo?: string;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
    updatedBy?: string;
    isActive: boolean;

    emr?: EMR[];
    vas?: VAS[];
    recommendations?: Recommendation[];
}

export interface PatientUpdate {
    firstName?: string;
    lastName?: string;
    gender?: string;
    insurancePolicyNumber?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    additionalInfo?: string;
    isActive?: boolean;
    updatedAt?: string;
    updatedBy?: string;
}

export interface EMR {
    height?: number;
    weight?: number;
    gfr: string;
    childPughScore: string;
    plt: number;
    wbc: number;
    sat: number;
    sodium: number;
    createdAt?: string;
    createdBy?: string;
    patientMrn?: string;
}

export interface EMRUpdate {
    height?: number;
    weight?: number;
    gfr?: string;
    childPughScore?: string;
    plt?: number;
    wbc?: number;
    sat?: number;
    sodium?: number;
    updatedAt?: string;
    updatedBy?: string;
}

export interface VAS {
    painPlace: string;
    painLevel: number;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    patientMrn?: string;
}


export interface Recommendation {
    regimenHierarchy: number;
    drugs?: DrugRecommendation[];
    avoidIfSensitivity?: string[];
    contraindications?: string[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectedReason?: string;
    comments?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    patientMrn?: string;
}

export interface DrugRecommendation {
    drugName: string;
    activeMoiety: string;
    dosing: string;
    interval: string;
    route: string;
    ageAdjustment: string;
    weightAdjustment: string;
    drugRole: string;  // основное лекарство или альтернативное
    childPugh: string;
    patientMrn?: string;


}