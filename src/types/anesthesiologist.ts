export enum EscalationStatus {
    PENDING = "PENDING",
    IN_REVIEW = "IN_REVIEW",
    RESOLVED = "RESOLVED",
    REQUIRES_CLARIFICATION = "REQUIRES_CLARIFICATION"
}

export enum ProtocolStatus {
    DRAFT = "DRAFT",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    NEEDS_REVISION = "NEEDS_REVISION"
}

export interface Escalation {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    originalRecommendationId: string;
    rejectedReason: string;
    escalationDate: string;
    status: EscalationStatus;
    priority: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL";
    description: string;
    currentProtocol?:Protocol;
}

export interface Protocol {
    id: string;
    escalationId: string;
    title: string;
    content: string;
    version: string;
    status: ProtocolStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    comments?:ProtocolComment[];
}

export interface ProtocolComment {
    id:string;
    protocolId:string;
    authorId:string;
    authorName:string;
    content:string;
    createdAt:string;
    isQuestion:boolean;
}

export interface CreateProtocolRequest {
    escalationId:string;
    title:string;
    content:string;
}

export interface UpdateProtocolRequest {
    id:string;
    title?:string;
    content?:string;
    status?:ProtocolStatus;
}

export interface CreateProtocolCommentRequest {
    protocolId:string;
    content:string;
    isQuestion:boolean;
}