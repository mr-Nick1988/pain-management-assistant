// FHIR Integration Types

export interface FhirIdentifier {
    system: string;
    value: string;
}

export interface FhirPatientDTO {
    patientIdInFhirResource: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    identifiers: FhirIdentifier[];
    phoneNumber?: string;
    email?: string;
    address?: string;
    sourceSystemUrl: string;
    sourceType: "FHIR_SERVER" | "MOCK_GENERATOR";
}

export interface EmrImportResultDTO {
    success: boolean;
    message: string;
    externalPatientIdInFhirResource: string;
    internalPatientId: number;
    internalMrn?: string; // MRN пациента в системе
    matchConfidence: "HIGH" | "MEDIUM" | "LOW";
    newPatientCreated: boolean;
    sourceType: "FHIR_SERVER" | "MOCK_GENERATOR";
    importedAt: string;
    observationsImported: number;
    warnings: string[];
    errors: string[];
    requiresManualReview: boolean;
    reviewNotes: string | null;
}

export interface FhirObservationDTO {
    code: string;
    display: string;
    value: number;
    unit: string;
    effectiveDateTime: string;
}

export interface EmrSyncResultDTO {
    totalPatients: number;
    successfulSyncs: number;
    failedSyncs: number;
    patientsWithChanges: number;
    syncStartedAt: string;
    syncCompletedAt: string;
    errors: string[];
}

export interface ImportCheckDTO {
    alreadyImported: boolean;
    internalEmrNumber: string;
}

export interface FhirSearchParams {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
}
