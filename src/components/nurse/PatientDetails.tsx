import React, {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useGetPatientByIdQuery, useGetEmrByPatientIdQuery, useDeletePatientMutation} from "../../api/api/apiNurseSlice";
import type {Patient} from "../../types/nurse";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {personId} = useParams<{ personId: string }>();

    // Если есть state, берем пациента из него
    const statePatient = location.state as Patient | undefined;
    const [patient, setPatient] = useState<Patient | null>(statePatient || null);

    // Если state отсутствует, подгружаем пациента с сервера
    const {data: fetchedPatient, isLoading: patientLoading, error: patientError} = useGetPatientByIdQuery(personId!, {
        skip: !!statePatient, // если state есть — не запрашиваем
    });

    useEffect(() => {
        if (!statePatient && fetchedPatient) {
            setPatient(fetchedPatient);
        }
    }, [statePatient, fetchedPatient]);

    const [loadEmr, setLoadEmr] = useState(false);
    const {data: emrData, isFetching: emrLoading} = useGetEmrByPatientIdQuery(
        patient?.personId!,
        {skip: !loadEmr}
    );

    const [deletePatient] = useDeletePatientMutation();

    const handleDeletePatient = async () => {
        if (!patient) return;
        if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
            await deletePatient(patient.personId);
            navigate("/nurse"); // возвращаемся на главную
        }
    };

    if (patientLoading) return <p>Loading patient...</p>;
    if (patientError || !patient) return <p>Error loading patient</p>;

    return (
        <div className="p-6">
            <button
                onClick={() => navigate("/nurse")}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold mb-4">Patient Details</h1>

            <div className="mb-6">
                <p><strong>First Name:</strong> {patient.firstName}</p>
                <p><strong>Last Name:</strong> {patient.lastName}</p>
                <p><strong>Person ID:</strong> {patient.personId}</p>
                <p><strong>Email:</strong> {patient.email || "N/A"}</p>
                <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Height:</strong> {patient.height} cm</p>
                <p><strong>Weight:</strong> {patient.weight} kg</p>
            </div>

            {!loadEmr && (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
                    onClick={() => setLoadEmr(true)}
                >
                    Load EMR
                </button>
            )}

            {loadEmr && (
                <div className="border rounded p-4 mb-4 bg-white shadow">
                    {emrLoading ? (
                        <p>Loading EMR...</p>
                    ) : emrData ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">GFR:</span>
                                <span>{emrData.gfr}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Child Pugh Score:</span>
                                <span>{emrData.childPughScore}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Platelets (PLT):</span>
                                <span>{emrData.plt}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">White Blood Cells (WBC):</span>
                                <span>{emrData.wbc}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Oxygen Saturation (SAT):</span>
                                <span>{emrData.sat}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Sodium (Na):</span>
                                <span>{emrData.sodium}</span>
                            </div>
                            {emrData.createdAt && (
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">Created At:</span>
                                    <span>{emrData.createdAt}</span>
                                </div>
                            )}
                            {emrData.createdBy && (
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">Created By:</span>
                                    <span>{emrData.createdBy}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>No EMR data yet</p>
                    )}
                </div>
            )}
            <div className="flex space-x-2 mt-6">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => navigate(`/nurse/vas-form/${patient.personId}`, {state: patient})}
                >
                    Register Pain Complaint
                </button>

                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    onClick={() => navigate(`/nurse/update-patient/${patient.personId}`, {state: patient})}
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