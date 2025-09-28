
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPatientsQuery, useGetPatientQuery } from "../../api/api/apiDoctorSlice.ts";
import { AddPatient } from "../../exports/exports.ts";

const PatientsList: React.FC = () => {
    const navigate = useNavigate();

    // State for modals
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // API hooks
    const { data: patients, isLoading: patientsLoading, error: patientsError, refetch } = useGetPatientsQuery();
    const { data: selectedPatient, isLoading: patientLoading, error: patientError } =
        useGetPatientQuery(selectedPatientId || '', { skip: !selectedPatientId });

    const handleViewPatientDetails = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const handleClosePatientDetails = () => {
        setSelectedPatientId(null);
    };

    if (patientsLoading) {
        return <div className="loading">Loading patients...</div>;
    }

    if (patientsError) {
        return <div className="error">Error loading patients: {JSON.stringify(patientsError)}</div>;
    }

    return (
        <div className="patients-list-page">
            {/* HEADER */}
            <div className="admin-header">
                <h2>My Patients</h2>
                <button
                    onClick={() => navigate('/doctor')}
                    className="cancel-button"
                >
                    Back to Dashboard
                </button>
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

            {/* ADD PATIENT MODAL */}
            {isAddPatientModalOpen && (
                <div className="modal-overlay">
                    <AddPatient
                        onClose={() => setIsAddPatientModalOpen(false)}
                        onSuccess={() => {
                            setIsAddPatientModalOpen(false);
                            refetch(); // Refresh patients list after adding
                        }}
                    />
                </div>
            )}

            {/* PATIENT DETAILS MODAL */}
            {selectedPatientId && (
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
            )}

            {/* PATIENTS LIST */}
            <div className="patients-section">
                <h2>My Patients ({patients?.length || 0})</h2>
                {patients && patients.length > 0 ? (
                    <div className="patients-list">
                        {patients.map(patient => (
                            <div key={patient.id} className="patient-card">
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
                    <p className="medical-subtitle">No patients yet. Click "Add New Patient" to create your first patient.</p>
                )}
            </div>
        </div>
    );
};

export default PatientsList;