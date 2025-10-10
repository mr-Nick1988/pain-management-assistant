// ============================================
// ENUMS - соответствуют backend
// ============================================

export enum EscalationStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED"
}

export enum EscalationPriority {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}

export enum ProtocolStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

// ============================================
// ESCALATION - соответствует backend Escalation entity
// ============================================

export interface EscalationResponse {
    id: number;
    recommendationId: number;
    status: EscalationStatus;
    priority: EscalationPriority;
    
    // Escalation info
    escalatedBy: string; // Doctor ID
    escalatedAt: string;
    escalationReason: string;
    description?: string;
    
    // Resolution info
    resolvedBy?: string; // Anesthesiologist ID
    resolvedAt?: string;
    resolution?: string;
    
    // Audit
    createdAt: string;
    updatedAt: string;
}

export interface EscalationResolution {
    resolvedBy: string; // Anesthesiologist ID
    resolution: string;
    comment?: string;
    approved?: boolean; // true = approve, false = reject
}

export interface EscalationStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    high: number;
    medium: number;
    low: number;
}

// ============================================
// PROTOCOL - соответствует backend TreatmentsProtocol entity
// ============================================

export interface ProtocolResponse {
    id: number;
    escalationId: number;
    title: string;
    content: string;
    version: number;
    status: ProtocolStatus;
    
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    
    approvedBy?: string;
    approvedAt?: string;
    rejectedReason?: string;
}

export interface ProtocolRequest {
    escalationId: number;
    title: string;
    content: string;
}

export interface ProtocolUpdate {
    id: number;
    title?: string;
    content?: string;
}

// ============================================
// PROTOCOL COMMENT - соответствует backend TreatmentProtocolComment entity
// ============================================

export interface CommentResponse {
    id: number;
    protocolId: number;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
}

export interface CommentRequest {
    protocolId: number;
    content: string;
}