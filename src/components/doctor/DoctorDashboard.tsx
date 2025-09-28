import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    useApproveRecommendationMutation,
    useGetRecommendationsQuery,
    useRejectRecommendationMutation
} from "../../api/api/apiDoctorSlice.ts";
import {type Recommendation, RecommendationStatus} from "../../types/recommendation.ts";
import {PatientRecommendationForm} from "../../exports/exports.ts";


const DoctorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Состояние для модалов и селектов
    const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

    // API хуки для рекомендаций
    const {data: recommendations, isLoading, error, refetch} = useGetRecommendationsQuery();

    // Мутации для рекомендаций
    const [approveRecommendation, {isLoading: isApproving}] = useApproveRecommendationMutation();
    const [rejectRecommendation, {isLoading: isRejecting}] = useRejectRecommendationMutation();

    //Обработчики навигации из SearchPatients
    useEffect(() => {
        if (location.state) {
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location.state, location.pathname, navigate]);

    // Фильтрация рекомендаций по статусу
    const pendingRecommendations = recommendations?.filter((recommendation) => recommendation.status === "PENDING") || [];
    const approvedRecommendations = recommendations?.filter((recommendation) => recommendation.status === "APPROVED") || [];
    const rejectedRecommendations = recommendations?.filter((recommendation) => recommendation.status === "REJECTED") || [];

    // HANDLERS ДЛЯ РЕКОМЕНДАЦИЙ
    const handleRecommendationSelect = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation);
    };

    const handleRecommendationClose = () => {
        setSelectedRecommendation(null);
    };

    const handleApprove = async (recommendationId: string) => {
        try {
            await approveRecommendation({
                recommendationId,
                status: RecommendationStatus.APPROVED,
                comment: "Approved by doctor"
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to approve recommendation:', error);
        }
    };

    const handleReject = async (recommendationId: string) => {
        try {
            await rejectRecommendation({
                recommendationId,
                status: RecommendationStatus.REJECTED,
                comment: "Rejected by doctor"
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to reject recommendation:', error);
        }
    };

    // LOADING & ERROR HANDLING
    if (isLoading) {
        return <div className="loading">Loading doctor dashboard...</div>;
    }

    if (error) {
        return <div className="error">
            Error loading data: {JSON.stringify(error)}
        </div>;
    }

    return (
        <div className="doctor-dashboard">
            {/* HEADER С КНОПКАМИ НАВИГАЦИИ */}
            <div className="admin-header">
                <h2>Doctor Dashboard</h2>
                <button onClick={() => navigate("/doctor/patients-list")} className="medical-btn">
                    My Patients
                </button>
                <button onClick={() => navigate("/doctor/search-patients")} className="update-button">
                    Search Patients
                </button>
                <button onClick={() => navigate("/doctor/recommendations")} className="submit-button">
                    Manage Recommendations
                </button>
            </div>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            {selectedRecommendation ? (
                /* МОДАЛ ДЕТАЛЕЙ РЕКОМЕНДАЦИИ */
                <PatientRecommendationForm
                    recommendation={selectedRecommendation}
                    onClose={handleRecommendationClose}
                />
            ) : (
                <div className="dashboard-content">
                    {/* СЕКЦИЯ РЕКОМЕНДАЦИЙ */}
                    <div className="recommendations-lists">
                        {/* PENDING RECOMMENDATIONS С КНОПКАМИ */}
                        <div className="recommendations-section">
                            <h3>Pending Recommendations ({pendingRecommendations.length})</h3>
                            {pendingRecommendations.length > 0 ? (
                                <ul className="recommendations-list">
                                    {pendingRecommendations.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="recommendation-item pending"
                                        >
                                            <div className="recommendation-header">
                                                <div className="patient-info">
                                                    <h3>{rec.patient?.firstName} {rec.patient?.lastName}</h3>
                                                    <p>MRN: {rec.patient?.mrn}</p>
                                                    <p>DOB: {rec.patient?.dateOfBirth ? new Date(rec.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    <p>Gender: {rec.patient?.gender}</p>
                                                </div>
                                                <div className="recommendation-actions">
                                                    <button
                                                        className="approve-button"
                                                        onClick={() => handleApprove(rec.id)}
                                                        disabled={isApproving}
                                                    >
                                                        {isApproving ? "Approving..." : "Approve"}
                                                    </button>
                                                    <button
                                                        className="reject-button"
                                                        onClick={() => handleReject(rec.id)}
                                                        disabled={isRejecting}
                                                    >
                                                        {isRejecting ? "Rejecting..." : "Reject"}
                                                    </button>
                                                </div>
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

                        {/* APPROVED RECOMMENDATIONS */}
                        <div className="recommendations-section">
                            <h3>Approved ({approvedRecommendations.length})</h3>
                            {approvedRecommendations.length > 0 ? (
                                <ul className="recommendations-list">
                                    {approvedRecommendations.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="recommendation-item approved"
                                            onClick={() => handleRecommendationSelect(rec)}
                                        >
                                            <div className="recommendation-header">
                                                <div className="patient-info">
                                                    <h3>{rec.patient?.firstName} {rec.patient?.lastName}</h3>
                                                    <p>MRN: {rec.patient?.mrn}</p>
                                                    <p>DOB: {rec.patient?.dateOfBirth ? new Date(rec.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    <p>Gender: {rec.patient?.gender}</p>
                                                </div>
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

                        {/* REJECTED RECOMMENDATIONS */}
                        <div className="recommendations-section">
                            <h3>Rejected ({rejectedRecommendations.length})</h3>
                            {rejectedRecommendations.length > 0 ? (
                                <ul className="recommendations-list">
                                    {rejectedRecommendations.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="recommendation-item rejected"
                                            onClick={() => handleRecommendationSelect(rec)}
                                        >
                                            <div className="recommendation-header">
                                                <div className="patient-info">
                                                    <h3>{rec.patient?.firstName} {rec.patient?.lastName}</h3>
                                                    <p>MRN: {rec.patient?.mrn}</p>
                                                    <p>DOB: {rec.patient?.dateOfBirth ? new Date(rec.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    <p>Gender: {rec.patient?.gender}</p>
                                                </div>
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
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;

