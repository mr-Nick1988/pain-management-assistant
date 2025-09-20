import React, {useState} from "react";
import {useGetEscalationsQuery} from "../api/api/apiAnesthesiologistSlice.ts";
import {EscalationStatus} from "../types/anesthesiologist.ts";
import {EscalationsList, ProtocolEditor} from "../exports/exports.ts";


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
        return <div className="loading-container">Loading anesthesiologist dashboard...</div>;
    }
    if (error) {
        return <div className="error-container">Error loading data...{JSON.stringify(error)}</div>;
    }

    return (
        <div className="anesthesiologist-dashboard">
            <header className="dashboard-header">
                <h1>Anesthesiologist Dashboard</h1>
                <div className="user-info">
                    Welcome , {localStorage.getItem("userFirstName") || "Anesthesiologist"}
                </div>
            </header>
            <nav className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={`tab-button ${activeTab === "escalations" ? "active" : ""}`}
                    onClick={() => setActiveTab("escalations")}
                >
                    Escalations
                </button>
                <button
                    className={`tab-button ${activeTab === "protocols" ? "active" : ""}`}
                    onClick={() => setActiveTab("protocols")}
                >
                    Protocols
                </button>
            </nav>
            <main className="dashboard-content">
                {activeTab === "overview" && (
                    <div className="overview-section">
                        <h2>Overview</h2>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Pending Escalations</h3>
                                <div className="stat-number">{pendingCount}</div>
                                <p>Awaiting review</p>
                            </div>
                            <div className="stat-card">
                                <h3>Critical Escalations</h3>
                                <div className="stat-number">{criticalCount}</div>
                                <p>Need immediate attention</p>
                            </div>
                            <div className="stat-card">
                                <h3>High Priority</h3>
                                <div className="stat-number">{highPriorityCount}</div>
                                <p>Important escalations</p>
                            </div>

                            <div className="stat-card-sucsess">
                                <h3>In Review</h3>
                                <div className="stat-number">{inReviewCount}</div>
                                <p>Escalations under review</p>
                            </div>
                        </div>
                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="action-buttons">
                                <button
                                    className="action-button-primary"
                                    onClick={() => setActiveTab("escalations")}
                                >
                                    Watch Escalations
                                </button>
                                <button
                                    className="action-button-secondary"
                                    onClick={() => setActiveTab("protocols")}
                                >
                                    Create Protocol
                                </button>
                            </div>
                        </div>

                        <div className="recent-escalations">
                            <h3>Last Escalations</h3>
                            {escalations && escalations.length > 0 ? (
                                <div className="escalations-preview">
                                    {escalations.slice(0, 5).map((escalation) => (
                                        <div
                                            key={escalation.id}
                                            className={`escalation-preview-item priority-${escalation.priority.toLowerCase()}`}
                                            onClick={() => handleEscalationSelect(escalation.id)}
                                        >
                                            <div className="escalation-info">
                                                <h4>{escalation.patientName}</h4>
                                                <p>Doctor: {escalation.doctorName}</p>
                                                <p>Reason: {escalation.rejectedReason}</p>
                                            </div>
                                            <div className="escalation-meta">
                                                <span className={`status ${escalation.status.toLowerCase()}`}>
                                                    {escalation.status}
                                                </span>
                                                <span className={`priority ${escalation.priority.toLowerCase()}`}>
                                                    {escalation.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No active escalations</p>
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