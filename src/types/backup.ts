// ========================================
// Backup & Restore Module Types
// ========================================

export type BackupType = "H2_DATABASE" | "MONGODB" | "FULL_SYSTEM";
export type BackupStatus = "IN_PROGRESS" | "SUCCESS" | "FAILED";
export type BackupTrigger = "SCHEDULED" | "MANUAL" | "PRE_OPERATION";

export interface BackupRequestDTO {
    backupType: BackupType;
    initiatedBy: string;
    metadata?: string;
}

export interface BackupResponseDTO {
    id: string;
    backupType: BackupType;
    status: BackupStatus;
    backupFilePath: string;
    fileSizeBytes: number;
    fileSizeMB: string;
    startTime: string; // ISO 8601
    endTime: string;
    durationMs: number;
    trigger: BackupTrigger;
    initiatedBy: string;
    errorMessage?: string;
    expirationDate: string;
}

export interface RestoreRequestDTO {
    backupId: string;
    initiatedBy: string;
    confirmed: boolean;
}

export interface BackupStatisticsDTO {
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    totalSizeBytes: number;
    totalSizeMB: string;
    totalSizeGB: string;
    averageBackupDurationMs: number;
    recentBackups: BackupResponseDTO[];
    h2BackupsCount: number;
    mongoBackupsCount: number;
    fullSystemBackupsCount: number;
}
