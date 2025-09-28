import React, {useState} from "react";
import {useGetEscalationsQuery} from "../../api/api/apiAnesthesiologistSlice.ts";
import {EscalationStatus} from "../../types/anesthesiologist.ts";
import {EscalationsList, ProtocolEditor} from "../../exports/exports.ts";


const AnesthesiologistDashboard: React.FC = () => {
    const {data: escalations, isLoading, error} = useGetEscalationsQuery();
    const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "escalations" | "protocols">("overview");

    //СТАТИСТИКА ЭСКАЛАЦИЙ БРО
    const pendingCount = escalations?.filter(e => e.status === EscalationStatus.PENDING).length || 0;
    const inReviewCount = escalations?.filter(e => e.status === EscalationStatus.IN_REVIEW).length || 0;
    const criticalCount = escalations?.filter(e => e.priority === "CRITICAL").length || 0;
    const highPriorityCount = escalations?.filter(e => e.priority === "HIGH").length || 0;

    const handleEscalationSelect = (escalationId: string) => {
        setSelectedEscalationId(escalationId);
        setActiveTab("protocols");
    };
    if (isLoading) {
        return <div className="an-loading">Loading anesthesiologist dashboard...</div>;
    }
    if (error) {
        return <div className="an-error">Error loading data...{JSON.stringify(error)}</div>;
    }

    return (
        <div className="an-dashboard">
            <div className="an-dashboard-header">
                <h1 className="medical-title">Anesthesiologist Dashboard</h1>
                <p className="medical-subtitle">
                    Welcome, {localStorage.getItem("userFirstName") || "Anesthesiologist"}
                </p>
            </div>

            <nav className="an-tabs">
                <button
                    className={activeTab === "overview" ? "an-active" : ""}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={activeTab === "escalations" ? "an-active" : ""}
                    onClick={() => setActiveTab("escalations")}
                >
                    Escalations
                </button>
                <button
                    className={activeTab === "protocols" ? "an-active" : ""}
                    onClick={() => setActiveTab("protocols")}
                >
                    Protocols
                </button>
            </nav>

            <main className="an-content">
                {activeTab === "overview" && (
                    <div className="an-overview-section">
                        <div className="an-stats-grid">
                            <div className="an-stat-card an-priority-pending">
                                <h3>Pending Escalations</h3>
                                <div className="an-stat-number">{pendingCount}</div>
                                <p>Awaiting review</p>
                            </div>
                            <div className="an-stat-card an-priority-critical">
                                <h3>Critical Escalations</h3>
                                <div className="an-stat-number">{criticalCount}</div>
                                <p>Need immediate attention</p>
                            </div>
                            <div className="an-stat-card an-priority-high">
                                <h3>High Priority</h3>
                                <div className="an-stat-number">{highPriorityCount}</div>
                                <p>Important escalations</p>
                            </div>
                            <div className="an-stat-card an-priority-in-review">
                                <h3>In Review</h3>
                                <div className="an-stat-number">{inReviewCount}</div>
                                <p>Escalations under review</p>
                            </div>
                        </div>

                        <div className="an-quick-actions-container">
                            <h3 className="an-section-title">Quick Actions</h3>
                            <div className="an-form-actions">
                                <button
                                    className="submit-button"
                                    onClick={() => setActiveTab("escalations")}
                                >
                                    View All Escalations
                                </button>
                            </div>
                        </div>

                        <div className="an-recent-escalations-container">
                            <h3 className="an-section-title">Recent Escalations</h3>
                            {escalations && escalations.length > 0 ? (
                                <div className="an-recent-escalations-list">
                                    {escalations.slice(0, 5).map((escalation) => (
                                        <div
                                            key={escalation.id}
                                            className={`an-recent-escalation-item an-priority-${escalation.priority.toLowerCase()}`}
                                            onClick={() => handleEscalationSelect(escalation.id)}
                                        >
                                            <div className="an-item-header">
                                                <h4>{escalation.patientName}</h4>
                                                <span className={`an-status-badge an-status-${escalation.status.toLowerCase()}`}>
                                                    {escalation.status}
                                                </span>
                                            </div>
                                            <p className="an-item-details">Doctor: {escalation.doctorName}</p>
                                            <p className="an-item-details">Reason: {escalation.rejectedReason}</p>
                                            <div className="an-item-footer">
                                                 <span className={`an-priority-badge an-priority-${escalation.priority.toLowerCase()}`}>
                                                    {escalation.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="an-empty-state">
                                    <p>No active escalations at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === "escalations" && (
                    <EscalationsList
                        escalations={escalations || []}
                        onEscalationSelect={handleEscalationSelect}
                    />
                )}
                {activeTab === "protocols" && (
                    <ProtocolEditor
                        selectedEscalationId={selectedEscalationId}
                    />
                )}
            </main>
        </div>
    );
};
export default AnesthesiologistDashboard;