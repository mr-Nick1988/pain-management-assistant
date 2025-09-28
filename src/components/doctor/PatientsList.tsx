import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPatientsQuery, useGetPatientQuery } from "../../api/api/apiDoctorSlice.ts";
import { AddPatient } from "../../exports/exports.ts";
import { Button, Card, CardHeader, CardTitle } from "../ui";

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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* HEADER */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>My Patients</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="cancel" onClick={() => navigate('/doctor')}>Back to Dashboard</Button>
                        <Button variant="approve" onClick={() => setIsAddPatientModalOpen(true)}>Add New Patient</Button>
                        <Button variant="update" onClick={() => navigate("/doctor/search-patients")}>Search Patients</Button>
                        <Button variant="submit" onClick={() => navigate("/doctor/recommendations")}>Manage Recommendations</Button>
                    </div>
                </CardHeader>
            </Card>

            {/* ADD PATIENT MODAL */}
            {isAddPatientModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3>Patient Details</h3>
                            <Button variant="ghost" size="sm" onClick={handleClosePatientDetails}>×</Button>
                        </div>
                        <div className="p-4 space-y-4">
                            {patientLoading ? (
                                <div>Loading patient details...</div>
                            ) : patientError ? (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">Error loading patient: {JSON.stringify(patientError)}</div>
                            ) : selectedPatient ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label>Name:</label>
                                        <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <label>MRN:</label>
                                        <span>{selectedPatient.mrn}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <label>Date of Birth:</label>
                                        <span>{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <label>Gender:</label>
                                        <span>{selectedPatient.gender}</span>
                                    </div>
                                    {selectedPatient.insurancePolicyNumber && (
                                        <div className="flex justify-between">
                                            <label>Insurance:</label>
                                            <span>{selectedPatient.insurancePolicyNumber}</span>
                                        </div>
                                    )}
                                    {selectedPatient.phoneNumber && (
                                        <div className="flex justify-between">
                                            <label>Phone:</label>
                                            <span>{selectedPatient.phoneNumber}</span>
                                        </div>
                                    )}
                                    {selectedPatient.email && (
                                        <div className="flex justify-between">
                                            <label>Email:</label>
                                            <span>{selectedPatient.email}</span>
                                        </div>
                                    )}
                                    {selectedPatient.address && (
                                        <div className="flex justify-between">
                                            <label>Address:</label>
                                            <span>{selectedPatient.address}</span>
                                        </div>
                                    )}
                                    {selectedPatient.additionalInfo && (
                                        <div className="flex justify-between">
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
            <div className="space-y-4">
                <h2>My Patients ({patients?.length || 0})</h2>
                {patients && patients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patients.map(patient => (
                            <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="space-y-2">
                                    <h3>{patient.firstName} {patient.lastName}</h3>
                                    <p>MRN: {patient.mrn}</p>
                                    <p>DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                    <p>Gender: {patient.gender}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="update"
                                        onClick={() => handleViewPatientDetails(patient.id)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-sm">No patients yet. Click "Add New Patient" to create your first patient.</p>
                )}
            </div>
        </div>
    );
};

export default PatientsList;