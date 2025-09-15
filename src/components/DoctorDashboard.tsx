import React, {useState} from "react";
import type {Recommendation} from "../types/recommendation.ts";
import {useGetRecommendationsQuery} from "../features/api/apiDoctorSlice.ts";
import {PatientRecommendationForm} from "../exports/exports.ts";


const DoctorDashboard: React.FC = () => {
    const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
    const {data: recommendations, isLoading, error} = useGetRecommendationsQuery();

    const handleRecommendationSelect = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation);
    };
    const handleRecommendationClose = () => {
        setSelectedRecommendation(null);
    };
    //filter recommendations by status
    const pendingRecommendations = recommendations?.filter((recommendation) => recommendation.status === "PENDING") || [];
    const approvedRecommendations = recommendations?.filter((recommendation) => recommendation.status === "APPROVED") || [];
    const rejectedRecommendations = recommendations?.filter((recommendation) => recommendation.status === "REJECTED") || [];

    if (isLoading) {
        return <div className="loading">Loading recommendations...</div>;
    }
    if (error) {
        return <div className="error">Error loading recommendations: {JSON.stringify(error)}</div>;
    }
    return (
        <div className="doctor-dashboard">
            <h2>Doctor Dashboard</h2>

            {selectedRecommendation ? (
                <PatientRecommendationForm
                    recommendation={selectedRecommendation}
                    onClose={handleRecommendationClose}
                />
            ) : (
                <div className="recommendations-lists">
                    <div className="recommendations-section">
                        <h3>Pending Recommendations ({pendingRecommendations.length})</h3>
                        {pendingRecommendations.length > 0 ? (
                            <ul className="recommendations-list">
                                {pendingRecommendations.map((rec) => (
                                    <li
                                        key={rec.id}
                                        className="recommendation-item pending"
                                        onClick={() => handleRecommendationSelect(rec)}
                                    >
                                        <div className="recommendation-header">
                                            <span className="patient-name">
                                                {rec.patient?.firstName} {rec.patient?.lastName}
                                            </span>
                                            <span className="emr-number">EMR: {rec.patient?.emrNumber}</span>
                                        </div>
                                        <div className="recommendation-preview">
                                            {rec.description.substring(0, 100)}
                                            {rec.description.length > 100 ? "..." : ""}
                                        </div>
                                        <div className="recommendation-date">
                                            {new Date(rec.createdAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No pending recommendations</p>
                        )}
                    </div>

                    <div className="recommendations-section">
                        <h3>Одобренные ({approvedRecommendations.length})</h3>
                        {approvedRecommendations.length > 0 ? (
                            <ul className="recommendations-list">
                                {approvedRecommendations.map((rec) => (
                                    <li
                                        key={rec.id}
                                        className="recommendation-item approved"
                                        onClick={() => handleRecommendationSelect(rec)}
                                    >
                                        <div className="recommendation-header">
                                            <span className="patient-name">
                                                {rec.patient?.firstName} {rec.patient?.lastName}
                                            </span>
                                            <span className="emr-number">EMR: {rec.patient?.emrNumber}</span>
                                        </div>
                                        <div className="recommendation-preview">
                                            {rec.description.substring(0, 100)}
                                            {rec.description.length > 100 ? "..." : ""}
                                        </div>
                                        <div className="recommendation-date">
                                            {new Date(rec.updatedAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No approved recommendations</p>
                        )}
                    </div>

                    <div className="recommendations-section">
                        <h3>Отклоненные ({rejectedRecommendations.length})</h3>
                        {rejectedRecommendations.length > 0 ? (
                            <ul className="recommendations-list">
                                {rejectedRecommendations.map((rec) => (
                                    <li
                                        key={rec.id}
                                        className="recommendation-item rejected"
                                        onClick={() => handleRecommendationSelect(rec)}
                                    >
                                        <div className="recommendation-header">
                                            <span className="patient-name">
                                                {rec.patient?.firstName} {rec.patient?.lastName}
                                            </span>
                                            <span className="emr-number">EMR: {rec.patient?.emrNumber}</span>
                                        </div>
                                        <div className="recommendation-preview">
                                            {rec.description.substring(0, 100)}
                                            {rec.description.length > 100 ? "..." : ""}
                                        </div>
                                        <div className="recommendation-date">
                                            {new Date(rec.updatedAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No rejected recommendations</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default DoctorDashboard;