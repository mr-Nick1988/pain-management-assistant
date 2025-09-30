import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useGetEmrByPatientIdQuery, useDeletePatientMutation} from "../../api/api/apiNurseSlice";
import type {Patient} from "../../types/nurse";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Получаем пациента из location.state
    const patient = location.state as Patient;
    /*проверка на undefined на случай, если кто-то зайдет напрямую по URL*/
    if (!patient?.mrn || !patient)
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


    // EMR
    const [loadEmr, setLoadEmr] = useState(false);
    const {data: emrData, isFetching: emrLoading} = useGetEmrByPatientIdQuery(
        patient.mrn ?? "", // если undefined, передаем пустую строку
        {skip: !loadEmr || !patient.mrn}
    );

    // Удаление пациента
    const [deletePatient] = useDeletePatientMutation();
    const handleDeletePatient = async () => {
        if (!patient) return;
        if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
            await deletePatient(patient.mrn!);
            navigate("/nurse");
        }
    };

    return (
        <div className="p-6">
            {/* Навигация назад */}
            <button
                onClick={() => navigate("/nurse")}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold mb-4">Patient Details</h1>

            {/* Детали пациента */}
            <div className="mb-6">
                <p><strong>MRN:</strong> {patient.mrn}</p>
                <p><strong>First Name:</strong> {patient.firstName}</p>
                <p><strong>Last Name:</strong> {patient.lastName}</p>
                <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Insurance Policy Number:</strong> {patient.insurancePolicyNumber || "N/A"}</p>
                <p><strong>Email:</strong> {patient.email || "N/A"}</p>
                <p><strong>Phone Number:</strong> {patient.phoneNumber}</p>
                <p><strong>Address:</strong> {patient.address}</p>
                <p><strong>Status:</strong> {patient.isActive ? "In treatment" : "Not in treatment"}</p>
                <p><strong>Additional Information:</strong> {patient.additionalInfo}</p>
                <p><strong>Created At:{patient.createdAt}</strong></p>
                <p><strong>Created By:{patient.createdBy || "N/A"}</strong></p>
                <p><strong>Updated At:{patient.updatedAt || "N/A"}</strong></p>
                <p><strong>Updated By:{patient.updatedBy || "N/A"}</strong></p>
            </div>

            {/* Загрузка EMR */}
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
                        <>
                            {/* Рост и вес */}
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Height:</span>
                                <span>{emrData.height || "N/A"}</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Weight:</span>
                                <span>{emrData.weight || "N/A"}</span>
                            </div>
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

                            {/* Update EMR */}
                            <button
                                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
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
                        // Create EMR, если данных нет
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={() => navigate(`/nurse/emr-form/${patient.mrn}`, {state: patient})}
                        >
                            Create EMR
                        </button>
                    )}
                </div>
            )}

            {/* Действия с пациентом */}
            <div className="flex space-x-2 mt-6">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => navigate(`/nurse/vas-form/${patient.mrn}`, {state: patient})}
                >
                    Register Pain Complaint
                </button>

                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    onClick={() => navigate(`/nurse/update-patient/${patient.mrn}`, {state: patient})}
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