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

    //Filtration and sorting escalations
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

        //Sorting escalations
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
        <div className="escalation-list">
            <div className="escalation-list-header">
                <h2>Escalations{filteredAndSortedEscalations.length}</h2>
                {/*filter and search*/}
                <div className="escalation-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search escalations by patient name, doctor name or rejected reason..."
                            value={searchTherm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter">
                        <select
                            value={filteredStatus}
                            onChange={(e) => setFilteredStatus(e.target.value as EscalationStatus | "ALL")}
                            className="filter-select"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={EscalationStatus.PENDING}>Pending</option>
                            <option value={EscalationStatus.IN_REVIEW}>In Review</option>
                            <option value={EscalationStatus.REQUIRES_CLARIFICATION}>Requires Clarification</option>
                            <option value={EscalationStatus.RESOLVED}>Resolved</option>
                        </select>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW")}
                            className="filter-select"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "status")}
                            className="filter-select"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="priority">Sort by Priority</option>
                            <option value="status">Sort by Status</option>
                        </select>
                    </div>
                </div>
            </div>
            {/*List of escalations*/}
            <div className="escalation-grid">
                {filteredAndSortedEscalations.map((escalation) => (
                    <div key={escalation.id} className="escalation-card">
                        <div className="escalation-card-header">
                            <h3>{escalation.patientName}</h3>
                            <div className="escalation-badges">
                                <span className={`priority-badge ${getPriorityColor(escalation.priority)}`}>
                                    {escalation.priority}
                                </span>
                                <span className={`status-badge ${getStatusColor(escalation.status)}`}>
                                    {escalation.status}
                                </span>
                            </div>
                        </div>
                        <div className="escalation-card-body">
                            <p><strong>Doctor:</strong>{escalation.doctorName}</p>
                            <p><strong>Escalation
                                Date:</strong>{new Date(escalation.escalationDate).toLocaleDateString()}</p>
                            <p><strong>Rejected Reason:</strong>{escalation.rejectedReason}</p>
                            <p><strong>Description:</strong>{escalation.description}</p>
                        </div>
                        <div className="escalation-card-actions">
                            {escalation.status === EscalationStatus.PENDING && (
                                <button
                                    onClick={() => handleTakeEscalation(escalation.id)}
                                    disabled={isTaking}
                                    className="btn btn-primary"
                                >
                                    {isTaking ? "Taking..." : "Take in review"}
                                </button>
                            )}
                            <button
                                onClick={() => onEscalationSelect(escalation.id)}
                                className="btn btn-secondary"
                            >
                                Create protocol
                            </button>
                            <button
                                onClick={() => setSelectedEscalation(escalation)}
                                className="btn btn-outline"
                            >
                                Ask questions
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {filteredAndSortedEscalations.length === 0 && (
                <div className="no-escalations">
                    <p>No escalations found</p>
                </div>
            )}
            {/*Modal window for ask questions*/}
            {selectedEscalation && (
                <div className="modal-overal">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Ask questions</h3>
                            <button
                                onClick={() => setSelectedEscalation(null)}
                                className="madal-close"
                            >
                                x
                            </button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Patient name:</strong>{selectedEscalation.patientName}</p>
                            <p><strong>Doctor name:</strong>{selectedEscalation.doctorName}</p>

                            <div className="form-group">
                                <label htmlFor="question">Question</label>
                                <textarea
                                    id="question"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="Enter your question"
                                    rows={4}
                                    className="form-textarea"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setSelectedEscalation(null)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendQuestionToDoctor}
                                disabled={!questionText.trim() || isSendingQuestion}
                                className="btn btn-primary"
                            >
                                {isSendingQuestion ? "Sending..." : "Send question"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EscalationsList;