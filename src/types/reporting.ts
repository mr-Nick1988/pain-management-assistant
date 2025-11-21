// ========================================
// Reporting Module Types
// ========================================

export interface DailyReportAggregate {
  id: number;
  reportDate: string; // "2025-10-18"
  
  // Пациенты
  totalPatientsRegistered: number;
  totalVasRecords: number;
  averageVasLevel: number; // 0-10
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
  
  createdAt: string;
  createdBy: string;
}

export interface SummaryStatistics {
  period: {
    startDate: string;
    endDate: string;
    daysCount: number;
  };
  patients: {
    totalRegistered: number;
    totalVasRecords: number;
    averageVasLevel: number;
  };
  recommendations: {
    total: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  escalations: {
    total: number;
    resolved: number;
    pending: number;
  };
  users: {
    totalLogins: number;
    uniqueActiveUsers: number;
  };
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface EmailReportRequest {
  date: string;
  email: string;
  attachPdf?: boolean;
  attachExcel?: boolean;
}

export interface PeriodEmailReportRequest {
  startDate: string;
  endDate: string;
  email: string;
  attachPdf?: boolean;
  attachExcel?: boolean;
}

// File download result (for Excel/PDF exports)
export interface FileDownload {
  blob: Blob;
  filename?: string;
  contentType?: string;
}

// Health endpoint
export interface ReportsHealthStatus {
  status: string;
  message?: string;
}

// Kafka command publication response
export interface ReportingCommandResponse {
  status: string; // e.g., "PUBLISHED"
  action: string; // e.g., GENERATE_DAILY
  requestId?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}
