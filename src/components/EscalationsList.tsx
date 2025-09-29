import React, {useMemo, useState} from "react";
import {type Escalation, EscalationStatus} from "../types/anesthesiologist.ts";
import {useSendQuestionToDoctorMutation, useTakeEscalationMutation} from "../api/api/apiAnesthesiologistSlice.ts";

interface EscalationListProps {
    escalations: Escalation[];
    onEscalationSelect: (escalationId: string) => void;
}

const EscalationsList: React.FC<EscalationListProps> = ({escalations, onEscalationSelect}) => {
    const [filteredStatus, setFilteredStatus] = useState<EscalationStatus | "ALL">("ALL");
    const [filterPriority, setFilterPriority] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
    const [sortBy, setSortBy] = useState<"date" | "priority" | "status">("date");
    const [searchTherm, setSearchTerm] = useState<string>("");
    const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
    const [questionText, setQuestionText] = useState<string>("");

    const [takeEscalation, {isLoading: isTaking}] = useTakeEscalationMutation();
    const [sendQuestionToDoctor, {isLoading: isSendingQuestion}] = useSendQuestionToDoctorMutation();

    const filteredAndSortedEscalations = useMemo(() => {
        const filteredEscalations = escalations.filter((escalation) => {
            const matchesStatus = filteredStatus === "ALL" || escalation.status === filteredStatus;
            const matchesPriority = filterPriority === "ALL" || escalation.priority === filterPriority;
            const MatchesSearch = searchTherm === "" ||
                escalation.patientName.toLowerCase().includes(searchTherm.toLowerCase()) ||
                escalation.doctorName.toLowerCase().includes(searchTherm.toLowerCase()) ||
                escalation.rejectedReason.toLowerCase().includes(searchTherm.toLowerCase());
            return matchesStatus && matchesPriority && MatchesSearch;
        });

        filteredEscalations.sort((a, b) => {
            switch (sortBy) {
                case "date":
                    return new Date(b.escalationDate).getTime() - new Date(a.escalationDate).getTime();
                case "priority":
                    { const priorityOrder = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1};
                    return priorityOrder[b.priority] - priorityOrder[a.priority]; }
                case "status":
                    return b.status.localeCompare(a.status);
                default:
                    return 0;
            }
        });
        return filteredEscalations;
    }, [escalations, filteredStatus, filterPriority, sortBy, searchTherm]);

    const handleTakeEscalation = async (escalationId: string) => {
        try {
            await takeEscalation(escalationId).unwrap();
        } catch (error) {
            console.error("Error taking escalation:", error);
        }
    };

    const handleSendQuestionToDoctor = async () => {
        if (!selectedEscalation || !questionText.trim()) return;
        try {
            await sendQuestionToDoctor({
                escalationId: selectedEscalation.id,
                question: questionText
            }).unwrap();
            setQuestionText("");
            setSelectedEscalation(null);
        } catch (error) {
            console.error("Error sending question to doctor:", error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "CRITICAL":
                return "priority-critical";
            case "HIGH":
                return "priority-high";
            case "MEDIUM":
                return "priority-medium";
            case "LOW":
                return "priority-low";
            default:
                return "";
        }
    };

    const getStatusColor = (status: EscalationStatus) => {
        switch (status) {
            case EscalationStatus.PENDING:
                return "status-pending";
            case EscalationStatus.IN_REVIEW:
                return "status-in-review";
            case EscalationStatus.RESOLVED:
                return "status-resolved";
            case EscalationStatus.REQUIRES_CLARIFICATION:
                return "status-requires-clarification";
            default:
                return "";
        }
    };

    return (
        <div className="escalations-list-container">
            <div className="section-title">
                All Escalations ({filteredAndSortedEscalations.length})
            </div>

            <div className="escalation-controls">
                <div className="form-group search-box">
                    <input
                        type="text"
                        placeholder="Search escalations..."
                        value={searchTherm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <div className="form-group">
                        <select
                            value={filteredStatus}
                            onChange={(e) => setFilteredStatus(e.target.value as EscalationStatus | "ALL")}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={EscalationStatus.PENDING}>Pending</option>
                            <option value={EscalationStatus.IN_REVIEW}>In Review</option>
                            <option value={EscalationStatus.REQUIRES_CLARIFICATION}>Requires Clarification</option>
                            <option value={EscalationStatus.RESOLVED}>Resolved</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW")}
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "status")}
                        >
                            <option value="date">Sort by Date</option>
                            <option value="priority">Sort by Priority</option>
                            <option value="status">Sort by Status</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="escalation-grid">
                {filteredAndSortedEscalations.map((escalation) => (
                    <div key={escalation.id} className={`escalation-card ${getPriorityColor(escalation.priority)}`}>
                        <div className="escalation-card-header">
                            <h3>{escalation.patientName}</h3>
                            <span className={`status-badge ${getStatusColor(escalation.status)}`}>
                                {escalation.status}
                            </span>
                        </div>
                        <div className="escalation-card-body">
                            <p><strong>Doctor:</strong> {escalation.doctorName}</p>
                            <p><strong>Date:</strong> {new Date(escalation.escalationDate).toLocaleDateString()}</p>
                            <p><strong>Reason:</strong> {escalation.rejectedReason}</p>
                        </div>
                        <div className="escalation-card-footer">
                             <span className={`priority-badge ${getPriorityColor(escalation.priority)}`}>
                                {escalation.priority}
                            </span>
                            <div className="action-buttons">
                                {escalation.status === EscalationStatus.PENDING && (
                                    <button
                                        onClick={() => handleTakeEscalation(escalation.id)}
                                        disabled={isTaking}
                                        className="update-button small-button"
                                    >
                                        {isTaking ? "Taking..." : "Take"}
                                    </button>
                                )}
                                <button
                                    onClick={() => onEscalationSelect(escalation.id)}
                                    className="submit-button small-button"
                                >
                                    Protocol
                                </button>
                                <button
                                    onClick={() => setSelectedEscalation(escalation)}
                                    className="cancel-button small-button"
                                >
                                    Ask
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAndSortedEscalations.length === 0 && (
                <div className="empty-state">
                    <p>No escalations found for the selected criteria.</p>
                </div>
            )}

            {selectedEscalation && (
                <div className="anesthesiologist-modal-overlay">
                    <div className="question-modal">
                        <div className="add-patient-modal-header">
                            <h3>Ask a Question</h3>
                            <button
                                onClick={() => setSelectedEscalation(null)}
                                className="close-button"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="info-row">
                                <span className="label">Patient:</span>
                                <span className="value">{selectedEscalation.patientName}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Doctor:</span>
                                <span className="value">{selectedEscalation.doctorName}</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="question">Your Question:</label>
                                <textarea
                                    id="question"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="Enter your question to the doctor..."
                                    rows={5}
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                onClick={() => setSelectedEscalation(null)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendQuestionToDoctor}
                                disabled={!questionText.trim() || isSendingQuestion}
                                className="submit-button"
                            >
                                {isSendingQuestion ? "Sending..." : "Send Question"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EscalationsList;