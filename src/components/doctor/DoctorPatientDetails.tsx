import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useDeletePatientMutation,
    useGetAllEmrByPatientIdQuery,
    useLazyGetLastRecommendationQuery
} from "../../api/api/apiDoctorSlice";
import type {Patient, EMR} from "../../types/doctor";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;

    // Все хуки должны быть вызваны ДО любых условных return
    const [loadEmr, setLoadEmr] = useState(false);
    const [loadAllEmr, setLoadAllEmr] = useState(false);

    const {data: emrData, isFetching: emrLoading} = useGetEmrByPatientIdQuery(
        patient?.mrn ?? "",
        {skip: !loadEmr || !patient?.mrn}
    );

    const {data: allEmrData, isFetching: allEmrLoading, refetch: fetchAllEmr} = useGetAllEmrByPatientIdQuery(
        patient?.mrn ?? "",
        {skip: !loadAllEmr || !patient?.mrn}
    );

    const [fetchRecommendation, {isFetching: recommendationLoading}] = useLazyGetLastRecommendationQuery();
    const [deletePatient] = useDeletePatientMutation();

    // Проверка после вызова всех хуков
    if (!patient?.mrn || !patient) {
        return (
            <div className="p-6">
                <p>No patient data. Please navigate from the dashboard.</p>
                <button
                    onClick={() => navigate("/doctor")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }
    const handleDeletePatient = async () => {
        if (!patient) return;
        if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
            await deletePatient(patient.mrn!);
            navigate("/doctor");
        }
    };

    const handleGetAllEmr = () => {
        setLoadAllEmr(true);
        fetchAllEmr();
    };

    const handleGetRecommendation = async () => {
        const result = await fetchRecommendation(patient.mrn!);
        if (result.data) {
            navigate(`/doctor/recommendation/${patient.mrn}`, {state: result.data});
        } else {
            alert("No recommendation found for this patient");
        }
    };

    return (
        <div className="p-6">
            <button
                onClick={() => navigate("/doctor")}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold mb-4">Patient Details</h1>

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
                <p><strong>Created At:</strong> {patient.createdAt}</p>
                <p><strong>Created By:</strong> {patient.createdBy || "N/A"}</p>
            </div>

            {/* EMR Section */}
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
                            <h2 className="text-xl font-bold mb-2">Last EMR</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">Height:</span>
                                    <span>{emrData.height || "N/A"}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">Weight:</span>
                                    <span>{emrData.weight || "N/A"}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">GFR:</span>
                                    <span>{emrData.gfr}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">Child Pugh Score:</span>
                                    <span>{emrData.childPughScore}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">PLT:</span>
                                    <span>{emrData.plt}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">WBC:</span>
                                    <span>{emrData.wbc}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">SAT:</span>
                                    <span>{emrData.sat}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span className="font-semibold">Sodium:</span>
                                    <span>{emrData.sodium}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                    onClick={() =>
                                        navigate(`/doctor/emr-update/${patient.mrn}`, {
                                            state: {patient, emrData},
                                        })
                                    }
                                >
                                    Update EMR
                                </button>
                                <button
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                    onClick={handleGetAllEmr}
                                    disabled={allEmrLoading}
                                >
                                    {allEmrLoading ? "Loading..." : "Get All EMRs"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={() => navigate(`/doctor/emr-form/${patient.mrn}`, {state: patient})}
                        >
                            Create EMR
                        </button>
                    )}
                </div>
            )}

            {/* All EMRs */}
            {loadAllEmr && allEmrData && allEmrData.length > 0 && (
                <div className="border rounded p-4 mb-4 bg-white shadow">
                    <h2 className="text-xl font-bold mb-2">All EMRs History</h2>
                    {allEmrData.map((emr: EMR, index: number) => (
                        <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="font-semibold mb-2">EMR #{index + 1}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p>Height: {emr.height}</p>
                                <p>Weight: {emr.weight}</p>
                                <p>GFR: {emr.gfr}</p>
                                <p>Child Pugh: {emr.childPughScore}</p>
                                <p>PLT: {emr.plt}</p>
                                <p>WBC: {emr.wbc}</p>
                                <p>SAT: {emr.sat}</p>
                                <p>Sodium: {emr.sodium}</p>
                                <p className="col-span-2 text-gray-500">Created: {emr.createdAt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mt-6">
                <button
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    onClick={handleGetRecommendation}
                    disabled={recommendationLoading}
                >
                    {recommendationLoading ? "Loading..." : "Get Recommendation"}
                </button>

                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    onClick={() => navigate(`/doctor/update-patient/${patient.mrn}`, {state: patient})}
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
