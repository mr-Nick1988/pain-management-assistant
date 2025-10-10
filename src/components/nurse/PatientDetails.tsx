import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useDeletePatientMutation,
} from "../../api/api/apiNurseSlice";
import type { Patient } from "../../types/nurse";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;

    if (!patient?.mrn)
        return (
            <div className="p-6">
                <p>No patient data. Please navigate from the dashboard.</p>
                <button
                    onClick={() => navigate("/nurse")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );

    const [loadEmr, setLoadEmr] = useState(false);

    const { data: emrData, isFetching: emrLoading } = useGetEmrByPatientIdQuery(patient.mrn, {
        skip: !loadEmr,
    });

    const [deletePatient] = useDeletePatientMutation();

    const handleDeletePatient = async () => {
        if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
            await deletePatient(patient.mrn!);
            navigate("/nurse");
        }
    };

    return (
        <div className="p-6">
            {/* 🔙 Навигация */}
            <button
                onClick={() => navigate("/nurse")}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold mb-4">Patient Details</h1>

            {/* 👤 Информация о пациенте */}
            <div className="mb-6 space-y-1">
                <p><strong>MRN:</strong> {patient.mrn}</p>
                <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
                <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Status:</strong> {patient.isActive ? "In treatment" : "Not in treatment"}</p>
            </div>

            {/* 🧬 EMR */}
            {!loadEmr && (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
                    onClick={() => setLoadEmr(true)}
                >
                    Load EMR
                </button>
            )}

            {loadEmr && (
                <div className="border rounded p-4 mb-6 bg-white shadow">
                    {emrLoading ? (
                        <p>Loading EMR...</p>
                    ) : emrData ? (
                        <>
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">EMR Details</h2>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <p><strong>Height:</strong> {emrData.height ?? "N/A"} cm</p>
                                <p><strong>Weight:</strong> {emrData.weight ?? "N/A"} kg</p>
                                <p><strong>GFR:</strong> {emrData.gfr ?? "N/A"}</p>
                                <p><strong>Child-Pugh Score:</strong> {emrData.childPughScore ?? "N/A"}</p>
                                <p><strong>PLT:</strong> {emrData.plt ?? "N/A"}</p>
                                <p><strong>WBC:</strong> {emrData.wbc ?? "N/A"}</p>
                                <p><strong>Oxygen Saturation (SAT):</strong> {emrData.sat ?? "N/A"}%</p>
                                <p><strong>Sodium (Na):</strong> {emrData.sodium ?? "N/A"}</p>
                            </div>

                            {emrData.sensitivities?.length ? (
                                <div className="mt-3">
                                    <p><strong>Sensitivities:</strong></p>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {emrData.sensitivities.map((s: string, i: number) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-gray-500 italic">No sensitivities recorded.</p>
                            )}

                            <button
                                className="mt-5 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                onClick={() =>
                                    navigate(`/nurse/emr-update/${patient.mrn}`, {
                                        state: { patient, emrData },
                                    })
                                }
                            >
                                Update EMR
                            </button>
                        </>
                    ) : (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={() => navigate(`/nurse/emr-form/${patient.mrn}`, { state: patient })}
                        >
                            Create EMR
                        </button>
                    )}
                </div>
            )}

            {/* 💊 Recommendation */}
            <div className="flex gap-3 mb-8">
                <button
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                    onClick={() => navigate(`/nurse/recommendation-details/${patient.mrn}`)}
                >
                    View Last Recommendation
                </button>
            </div>

            {/* ⚙ Кнопки действий */}
            <div className="flex flex-wrap gap-2 mt-6">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => navigate(`/nurse/vas-form/${patient.mrn}`, { state: patient })}
                >
                    Register Pain Complaint
                </button>

                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    onClick={() => navigate(`/nurse/update-patient/${patient.mrn}`, { state: patient })}
                >
                    Update Patient Data
                </button>

                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={handleDeletePatient}
                >
                    Delete Patient
                </button>
            </div>
        </div>
    );
};

export default PatientDetails;