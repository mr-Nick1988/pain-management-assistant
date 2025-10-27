// ========================================
// External VAS Integration Types
// ========================================

// VAS Source types
export type VasSource = "VAS_MONITOR" | "MANUAL_ENTRY" | "EMR_SYSTEM" | "MOBILE_APP" | "TABLET";

// External VAS Record Request (для отправки с устройства)
export interface ExternalVasRecordRequest {
    patientMrn: string;
    vasLevel: number; // 0-10
    deviceId: string;
    location: string;
    timestamp: string; // ISO 8601
    notes?: string;
    source: VasSource;
}

// External VAS Record Response
export interface ExternalVasRecordResponse {
    status: "success" | "error";
    vasId?: number;
    patientMrn?: string;
    vasLevel?: number;
    format?: "JSON" | "XML" | "HL7_V2" | "FHIR" | "CSV";
    error?: string;
}

// Batch Import Response
export interface BatchVasImportResponse {
    totalRecords: number;
    successfulImports: number;
    failedImports: number;
    errors: string[];
}

// Health Check Response
export interface ExternalVasHealthResponse {
    status: "UP" | "DOWN";
    module: string;
    timestamp: string;
}

// External VAS Record (для отображения в мониторе)
export interface ExternalVasRecord {
    id: number;
    patientMrn: string;
    patientFirstName?: string;
    patientLastName?: string;
    vasLevel: number;
    deviceId: string;
    location: string;
    timestamp: string;
    notes?: string;
    source: VasSource;
    createdAt: string;
}

// ========================================
// API Key Management Types
// ========================================

// API Key Status
export type ApiKeyStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "DEACTIVATED";

// API Key DTO
export interface ApiKeyDTO {
    apiKey: string; // Masked: "pma_live_a1b2c3d4****"
    systemName: string;
    description?: string;
    expiresAt?: string; // ISO 8601 или null для "Never"
    ipWhitelist: string; // "*" или "192.168.1.0/24,10.0.0.0/8"
    rateLimitPerMinute: number;
    active: boolean;
    createdAt: string;
    createdBy: string;
    lastUsedAt?: string; // Последнее использование
    usageCount?: number; // Количество использований
}

// Generate API Key Request
export interface GenerateApiKeyRequest {
    systemName: string;
    description?: string;
    expiresInDays?: number; // null = never
    createdBy?: string; // default: "admin"
}

// Generate API Key Response
export interface GenerateApiKeyResponse {
    status: "success" | "error";
    message: string;
    apiKey?: string; // ПОЛНЫЙ ключ (показывается ТОЛЬКО ОДИН РАЗ!)
    systemName?: string;
    expiresAt?: string;
    ipWhitelist?: string;
    rateLimitPerMinute?: number;
    error?: string;
}

// Get All API Keys Response
export interface GetAllApiKeysResponse {
    status: "success";
    total: number;
    keys: ApiKeyDTO[];
}

// Update Response
export interface ApiKeyUpdateResponse {
    status: "success" | "error";
    message: string;
    error?: string;
}

// VAS Monitor Statistics
export interface VasMonitorStats {
    totalRecordsToday: number;
    averageVas: number;
    highPainAlerts: number; // VAS >= 7
    activeDevices: number;
}

// VAS Monitor Filters
export interface VasMonitorFilters {
    deviceId?: string;
    location?: string;
    timeRange: "1h" | "6h" | "24h" | "custom";
    customStartDate?: string;
    customEndDate?: string;
    vasLevelMin?: number;
    vasLevelMax?: number;
}
