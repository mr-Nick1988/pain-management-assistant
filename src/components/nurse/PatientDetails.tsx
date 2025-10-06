import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useDeletePatientMutation,
    useGetRecommendationByPatientIdQuery
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
    const [loadRecommendation, setLoadRecommendation] = useState(false);

    const { data: emrData, isFetching: emrLoading } = useGetEmrByPatientIdQuery(patient.mrn, {
        skip: !loadEmr,
    });

    const { data: recommendation, isFetching: recLoading, isError: recError } =
        useGetRecommendationByPatientIdQuery(patient.mrn, { skip: !loadRecommendation });

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
            {!loadRecommendation && (
                <button
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 mb-6"
                    onClick={() => setLoadRecommendation(true)}
                >
                    Get Last Recommendation
                </button>
            )}

            {loadRecommendation && (
                <div className="border rounded p-4 bg-white shadow mb-6">
                    {recLoading ? (
                        <p>Loading recommendation...</p>
                    ) : recError ? (
                        <p className="text-red-600">No recommendation found.</p>
                    ) : recommendation ? (
                        <>
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">Latest Recommendation</h2>

                            <div className="space-y-1 text-sm mb-3">
                                <p><strong>Patient MRN:</strong> {recommendation.patientMrn}</p>
                                <p><strong>Status:</strong> {recommendation.status}</p>
                                <p><strong>Regimen Hierarchy:</strong> {recommendation.regimenHierarchy}</p>
                                <p><strong>Created At:</strong> {recommendation.createdAt ?? "N/A"}</p>
                                <p><strong>Created By:</strong> {recommendation.createdBy ?? "N/A"}</p>
                            </div>

                            {/*  Comments */}
                            {recommendation.comments?.length ? (
                                <div className="mt-3">
                                    <h3 className="font-semibold text-gray-700">Comments:</h3>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {recommendation.comments.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm italic text-gray-500">No comments provided.</p>
                            )}

                            {/*  Contraindications */}
                            {recommendation.contraindications?.length ? (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-700">Contraindications:</h3>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {recommendation.contraindications.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {/*  Drugs */}
                            {recommendation.drugs?.length ? (
                                <div className="mt-5">
                                    <h3 className="font-semibold mb-2 text-gray-700">Drug Recommendations:</h3>
                                    <div className="space-y-3">
                                        {recommendation.drugs.map((drug, i) => (
                                            <div key={i} className="border rounded p-3 bg-gray-50 text-sm">
                                                <p><strong>Role:</strong> {drug.role}</p>
                                                <p><strong>Drug Name:</strong> {drug.drugName}</p>
                                                <p><strong>Active Moiety:</strong> {drug.activeMoiety}</p>
                                                <p><strong>Dosing:</strong> {drug.dosing}</p>
                                                <p><strong>Interval:</strong> {drug.interval}</p>
                                                <p><strong>Route:</strong> {drug.route}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-gray-500">No drug recommendations available.</p>
                            )}
                        </>
                    ) : null}
                </div>
            )}

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