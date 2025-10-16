// Analytics Types based on Backend AnalyticsController

/**
 * DTO для общей статистики событий
 * GET /api/analytics/events/stats
 */
export interface EventStatsDTO {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByRole: Record<string, number>;
    eventsByStatus: Record<string, number>;
}

/**
 * DTO для активности пользователя
 * GET /api/analytics/users/{userId}/activity
 */
export interface UserActivityDTO {
    userId: string;
    userRole: string;
    totalActions: number;
    lastActivity: string; // ISO date string
    loginCount: number;
    failedLoginCount: number;
}

/**
 * DTO для метрик производительности
 * GET /api/analytics/performance
 */
export interface PerformanceStatsDTO {
    averageProcessingTimeMs: number;
    totalRecommendations: number;
    approvedRecommendations: number;
    rejectedRecommendations: number;
    totalEscalations: number;
    resolvedEscalations: number;
    averageEscalationResolutionTimeMs: number;
}

/**
 * DTO для статистики пациентов
 * GET /api/analytics/patients/stats
 */
export interface PatientStatsDTO {
    totalPatients: number;
    patientsByGender: Record<string, number>;
    patientsByAgeGroup: Record<string, number>;
    totalVasRecords: number;
    criticalVasRecords: number;
    averageVasLevel: number;
}

/**
 * Событие аналитики из MongoDB
 * GET /api/analytics/events/recent
 * GET /api/analytics/events/type/{eventType}
 */
export interface AnalyticsEvent {
    id: string;
    timestamp: string; // ISO date string
    eventType: string;
    userId: string;
    userRole: string;
    patientMrn?: string;
    recommendationId?: number;
    escalationId?: number;
    status?: string;
    priority?: string;
    processingTimeMs?: number;
    vasLevel?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Технический лог из MongoDB
 * GET /api/analytics/logs/recent
 * GET /api/analytics/logs/level/{level}
 */
export interface LogEntry {
    id: string;
    timestamp: string; // ISO date string
    level: string; // INFO, WARN, ERROR
    logCategory: string;
    className: string;
    methodName: string;
    methodSignature: string;
    arguments: string;
    durationMs: number;
    success: boolean;
    errorMessage?: string;
    errorStackTrace?: string;
    userId?: string;
    sessionId?: string;
    module: string; // nurse, doctor, anesthesiologist, admin, emr_integration, treatment_protocol
}

/**
 * Query параметры для фильтрации по датам
 */
export interface DateRangeParams {
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
}

/**
 * Query параметры для получения событий
 */
export interface EventsQueryParams extends DateRangeParams {
    limit?: number;
}

/**
 * Query параметры для получения логов
 */
export interface LogsQueryParams extends DateRangeParams {
    limit?: number;
}
