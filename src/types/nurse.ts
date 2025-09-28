export interface Patient {
    email?: string;
    firstName: string;
    lastName: string;
    personId: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE";
    height: number;
    weight: number;

    createdAt?: string;
    createdBy?: string;

    emr?: EMR[];
    vas?: VAS[];
    recommendations?: Recommendation[];
}

export interface PatientUpdate {
    firstName?: string;
    lastName?: string;
    gender?: "MALE" | "FEMALE";
    height?: number;
    weight?: number;
    updatedAt?: string;
    updatedBy?: string;
}

export interface EMR {
    gfr: string;
    childPughScore: string;
    plt: number;
    wbc: number;
    sat: number;
    sodium: number;
    createdAt?: string;
    createdBy?: string;
}

export interface EMRUpdate {
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
}



export interface Recommendation {
    regimenHierarchy: number;
    drugs?: DrugRecommendation[];
    alternativeDrugs?: DrugRecommendation[];
    avoidIfSensitivity?: string[];
    contraindications?: string[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    notes?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface DrugRecommendation {
    drugName: string;
    firstActiveMoiety: string;
    dosing: string;
    interval:string;
    route:string;
    ageAdjustment:string;
    weightAdjustment:string;
    childPugh:string;

}