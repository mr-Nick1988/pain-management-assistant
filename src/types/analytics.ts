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
 * Технический лог из MongoDB (через монолит)
 * GET /api/analytics/logs/recent
 * GET /api/analytics/logs/level/{level}
 */
export interface LogEntry {
    id: string;
    timestamp: string; // ISO date string
    logLevel: string; // INFO, WARN, ERROR
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

// ========================================
// ANALYTICS MICROSERVICE TYPES (Port 8091)
// ========================================

/**
 * Событие аналитики из микросервиса (MongoDB)
 * GET /api/analytics/events?start={ISO}&end={ISO}
 */
export interface MicroserviceAnalyticsEvent {
    id: string;
    timestamp: string; // ISO 8601: "2025-11-11T14:30:00"
    eventType: MicroserviceEventType;
    patientMrn?: string;
    userId?: string;
    userRole?: string;
    recommendationId?: number;
    escalationId?: number;
    vasLevel?: number;
    priority?: string;
    status?: string;
    processingTimeMs?: number;
    diagnosisCodes?: string[];
    rejectionReason?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Типы событий микросервиса
 */
export type MicroserviceEventType =
    | "PERSON_CREATED"
    | "PERSON_DELETED"
    | "PERSON_UPDATED"
    | "USER_LOGIN_SUCCESS"
    | "USER_LOGIN_FAILED"
    | "PATIENT_REGISTERED"
    | "EMR_CREATED"
    | "VAS_RECORDED"
    | "RECOMMENDATION_CREATED"
    | "RECOMMENDATION_APPROVED"
    | "RECOMMENDATION_REJECTED"
    | "DOSE_ADMINISTERED"
    | "ESCALATION_CREATED"
    | "ESCALATION_RESOLVED";

/**
 * Дневной агрегированный отчет из микросервиса (PostgreSQL)
 * POST /api/reporting/aggregate/daily?date={YYYY-MM-DD}
 * GET /api/reporting/daily/{YYYY-MM-DD}
 */
export interface MicroserviceDailyReportAggregate {
    id: number;
    reportDate: string; // "2025-11-11"
    
    // Пациенты
    totalPatientsRegistered: number;
    totalVasRecords: number;
    averageVasLevel: number;
    criticalVasCount: number; // VAS >= 7
    
    // Рекомендации
    totalRecommendations: number;
    approvedRecommendations: number;
    rejectedRecommendations: number;
    approvalRate: number; // %
    
    // Эскалации
    totalEscalations: number;
    resolvedEscalations: number;
    pendingEscalations: number;
    averageResolutionTimeHours: number;
    
    // Система
    averageProcessingTimeMs: number;
    totalOperations: number;
    failedOperations: number;
    
    // Пользователи
    totalLogins: number;
    uniqueActiveUsers: number;
    failedLoginAttempts: number;
    
    // JSON поля
    topDrugsJson?: string; // {"Morphine":45,"Fentanyl":32}
    doseAdjustmentsJson?: string; // {"Renal Impairment":15}
    
    sourceEventsCount: number;
}

/**
 * Недельный агрегированный отчет
 * POST /api/reporting/aggregate/weekly?weekStart={YYYY-MM-DD}&weekEnd={YYYY-MM-DD}
 */
export interface MicroserviceWeeklyReportAggregate {
    id: number;
    weekStart: string; // "2025-11-10"
    weekEnd: string; // "2025-11-16"
    totalEvents: number;
    averageVasLevel: number;
    criticalVasCount: number;
    approvedRecommendations: number;
    rejectedRecommendations: number;
    averageProcessingTimeMs: number;
    failedOperations: number;
    uniqueActiveUsers: number;
}

/**
 * Месячный агрегированный отчет
 * POST /api/reporting/aggregate/monthly?year={YYYY}&month={MM}
 */
export interface MicroserviceMonthlyReportAggregate {
    id: number;
    year: number; // 2025
    month: number; // 11 (1-12)
    totalEvents: number;
    averageVasLevel: number;
    criticalVasCount: number;
    approvedRecommendations: number;
    rejectedRecommendations: number;
    averageProcessingTimeMs: number;
    failedOperations: number;
    uniqueActiveUsers: number;
}

/**
 * Query параметры для событий микросервиса
 */
export interface MicroserviceEventsQueryParams {
    start: string; // ISO 8601: "2025-11-11T00:00:00"
    end: string; // ISO 8601: "2025-11-11T23:59:59"
}

/**
 * Параметры для дневной агрегации
 */
export interface DailyAggregationParams {
    date: string; // "2025-11-11"
}

/**
 * Параметры для недельной агрегации
 */
export interface WeeklyAggregationParams {
    weekStart: string; // "2025-11-10"
    weekEnd: string; // "2025-11-16"
}

/**
 * Параметры для месячной агрегации
 */
export interface MonthlyAggregationParams {
    year: number; // 2025
    month: number; // 11 (1-12)
}
