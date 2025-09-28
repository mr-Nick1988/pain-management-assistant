import React, {useEffect, useState} from "react";
import {
    useApproveRecommendationMutation,
    useGetPatientQuery,
    useGetPatientsQuery,
    useGetRecommendationsQuery, useRejectRecommendationMutation
} from "../../api/api/apiDoctorSlice.ts";

import {AddPatient, PatientRecommendationForm} from "../../exports/exports.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {type Recommendation, RecommendationStatus} from "../../types/recommendation.ts";

const DoctorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Состояние для модалов и селектов
    const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // API хуки для рекомендаций
    const {data: recommendations, isLoading, error, refetch} = useGetRecommendationsQuery();

    // API хуки для пациентов
    const {data: patients, isLoading: patientsLoading, error: patientsError} = useGetPatientsQuery();
    const {data: selectedPatient, isLoading: patientLoading, error: patientError} =
        useGetPatientQuery(selectedPatientId || '', {skip: !selectedPatientId});

    // Мутации для рекомендаций
    const [approveRecommendation, {isLoading: isApproving}] = useApproveRecommendationMutation();
    const [rejectRecommendation, {isLoading: isRejecting}] = useRejectRecommendationMutation();

    //Обработчики навигации из SearchPatients
    useEffect(() => {
        if (location.state) {
            if (location.state.selectedPatient) {
                setSelectedPatientId(location.state.selectedPatient);
            }
            if (location.state.createRecommendationFor) {
                setSelectedPatientId(location.state.createRecommendationFor);
            }
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location.state, navigate]);


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

    const handleApproveRecommendation = async (recommendationId: string) => {
        try {
            await approveRecommendation({
                recommendationId,
                status: RecommendationStatus.APPROVED,
                comment: "Approved by doctor"
            }).unwrap();
            refetch(); // Обновляем список после изменения
        } catch (error) {
            console.error('Failed to approve recommendation:', error);
        }
    };

    const handleRejectRecommendation = async (recommendationId: string) => {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
            try {
                await rejectRecommendation({
                    recommendationId,
                    status: RecommendationStatus.REJECTED,
                    comment: reason
                }).unwrap();
                refetch(); // Обновляем список после изменения
            } catch (error) {
                console.error('Failed to reject recommendation:', error);
            }
        }
    };

    // HANDLERS ДЛЯ ПАЦИЕНТОВ
    const handleViewPatientDetails = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const handleClosePatientDetails = () => {
        setSelectedPatientId(null);
    };

    // LOADING & ERROR HANDLING
    if (isLoading || patientsLoading) {
        return <div className="loading">Loading doctor dashboard...</div>;
    }

    if (error || patientsError) {
        return <div className="error">
            Error loading data: {JSON.stringify(error || patientsError)}
        </div>;
    }

    return (
        <div className="doctor-dashboard">
            {/* HEADER С КНОПКОЙ ДОБАВЛЕНИЯ ПАЦИЕНТА */}
            <div className="admin-header">
                <h2>Doctor Dashboard</h2>
                <button
                    onClick={() => setIsAddPatientModalOpen(true)}
                    className="approve-button"
                >
                    Add New Patient
                </button>
                <button onClick={() => navigate("/doctor/search-patients")} className="update-button">
                    Search Patients
                </button>
                <button onClick={() => navigate("/doctor/recommendations")} className="submit-button">
                    Manage Recommendations
                </button>
            </div>

            {/* МОДАЛ ДОБАВЛЕНИЯ ПАЦИЕНТА */}
            {isAddPatientModalOpen && (
                <div className="modal-overlay">
                    <AddPatient
                        onClose={() => setIsAddPatientModalOpen(false)}
                        onSuccess={() => {
                            setIsAddPatientModalOpen(false);
                            refetch(); // Обновляем данные после создания пациента
                        }}
                    />
                </div>
            )}

            {/* ОСНОВНОЙ КОНТЕНТ */}
            {selectedRecommendation ? (
                /* МОДАЛ ДЕТАЛЕЙ РЕКОМЕНДАЦИИ */
                <PatientRecommendationForm
                    recommendation={selectedRecommendation}
                    onClose={handleRecommendationClose}
                />
            ) : selectedPatientId ? (
                /* МОДАЛ ДЕТАЛЕЙ ПАЦИЕНТА */
                <div className="modal-overlay">
                    <div className="modal-content patient-details-modal">
                        <div className="modal-header">
                            <h3>Patient Details</h3>
                            <button
                                className="close-button"
                                onClick={handleClosePatientDetails}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {patientLoading ? (
                                <div>Loading patient details...</div>
                            ) : patientError ? (
                                <div className="error">Error loading patient: {JSON.stringify(patientError)}</div>
                            ) : selectedPatient ? (
                                <div className="patient-details">
                                    <div className="detail-row">
                                        <label>Name:</label>
                                        <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>MRN:</label>
                                        <span>{selectedPatient.mrn}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Date of Birth:</label>
                                        <span>{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Gender:</label>
                                        <span>{selectedPatient.gender}</span>
                                    </div>
                                    {selectedPatient.insurancePolicyNumber && (
                                        <div className="detail-row">
                                            <label>Insurance:</label>
                                            <span>{selectedPatient.insurancePolicyNumber}</span>
                                        </div>
                                    )}
                                    {selectedPatient.phoneNumber && (
                                        <div className="detail-row">
                                            <label>Phone:</label>
                                            <span>{selectedPatient.phoneNumber}</span>
                                        </div>
                                    )}
                                    {selectedPatient.email && (
                                        <div className="detail-row">
                                            <label>Email:</label>
                                            <span>{selectedPatient.email}</span>
                                        </div>
                                    )}
                                    {selectedPatient.address && (
                                        <div className="detail-row">
                                            <label>Address:</label>
                                            <span>{selectedPatient.address}</span>
                                        </div>
                                    )}
                                    {selectedPatient.additionalInfo && (
                                        <div className="detail-row">
                                            <label>Additional Info:</label>
                                            <span>{selectedPatient.additionalInfo}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>Patient not found</div>
                            )}
                        </div>
                    </div>
                </div>
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
                                            </div>
                                            <div className="recommendation-preview">
                                                {rec.description.substring(0, 100)}
                                                {rec.description.length > 100 ? "..." : ""}
                                            </div>
                                            <div className="recommendation-date">
                                                {new Date(rec.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="recommendation-actions">
                                                <button
                                                    className="approve-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApproveRecommendation(rec.id);
                                                    }}
                                                    disabled={isApproving}
                                                >
                                                    {isApproving ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button
                                                    className="reject-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRejectRecommendation(rec.id);
                                                    }}
                                                    disabled={isRejecting}
                                                >
                                                    {isRejecting ? 'Rejecting...' : 'Reject'}
                                                </button>
                                                <button
                                                    className="view-button"
                                                    onClick={() => handleRecommendationSelect(rec)}
                                                >
                                                    View Details
                                                </button>
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

                    {/* СЕКЦИЯ ПАЦИЕНТОВ */}
                    <div className="patients-section">
                        <h2>My Patients ({patients?.length || 0})</h2>
                        {patients && patients.length > 0 ? (
                            <div className="patients-list">
                                {patients.map(patient => (
                                    <div key={patient.id} className="">
                                        <div className="an-add-comment-form">
                                            <h3>{patient.firstName} {patient.lastName}</h3>
                                            <p>MRN: {patient.mrn}</p>
                                            <p>DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                            <p>Gender: {patient.gender}</p>
                                        </div>
                                        <div className="patient-actions">
                                            <button
                                                className="update-button"
                                                onClick={() => handleViewPatientDetails(patient.id)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="medical-subtitle">No patients yet. Click "Add New Patient" to create your
                                first patient.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;