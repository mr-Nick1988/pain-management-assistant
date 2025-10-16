import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useDeletePatientMutation,
    useGetAllEmrByPatientIdQuery,
    useLazyGetLastRecommendationQuery
} from "../../api/api/apiDoctorSlice";
import type {Patient, EMR} from "../../types/doctor";
import {Button, Card, CardContent, CardHeader, CardTitle, PageNavigation} from "../ui";
import {useToast} from "../../contexts/ToastContext";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;
    const toast = useToast();

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
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="mb-4">No patient data. Please navigate from the dashboard.</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
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
            toast.warning("No recommendation found for this patient");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
                    <p className="text-gray-600 mt-1">{patient.firstName} {patient.lastName}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/doctor")}>
                    Back to Dashboard
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Medical Record Number</p>
                            <p className="font-semibold">{patient.mrn}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-semibold">{patient.dateOfBirth}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-semibold">{patient.gender}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Insurance Policy Number</p>
                            <p className="font-semibold">{patient.insurancePolicyNumber || "N/A"}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-semibold">{patient.phoneNumber}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold">{patient.email || "N/A"}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Treatment Status</p>
                            <p className="font-semibold">
                                <span
                                    className={`px-2 py-1 rounded text-sm ${patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                    {patient.isActive ? "In Treatment" : "Not in Treatment"}
                                </span>
                            </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-semibold">{patient.address}</p>
                        </div>
                        {patient.additionalInfo && (
                            <div className="space-y-2 md:col-span-2">
                                <p className="text-sm text-gray-500">Additional Information</p>
                                <p className="font-semibold">{patient.additionalInfo}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Created At</p>
                            <p className="font-semibold text-sm">{patient.createdAt ? new Date(patient.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Created By</p>
                            <p className="font-semibold text-sm">{patient.createdBy || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* EMR Section */}
            {!loadEmr && (
                <Button variant="update" onClick={() => setLoadEmr(true)}>
                    Load EMR Data
                </Button>
            )}

            {loadEmr && (
                <Card>
                    <CardHeader>
                        <CardTitle>Electronic Medical Record (EMR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {emrLoading ? (
                            <p className="text-center py-4">Loading EMR...</p>
                        ) : emrData ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">Height</p>
                                        <p className="font-semibold">{emrData.height || "N/A"} cm</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">Weight</p>
                                        <p className="font-semibold">{emrData.weight || "N/A"} kg</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">GFR</p>
                                        <p className="font-semibold">{emrData.gfr}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">Child-Pugh</p>
                                        <p className="font-semibold">{emrData.childPughScore}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">PLT</p>
                                        <p className="font-semibold">{emrData.plt} ×10⁹/L</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">WBC</p>
                                        <p className="font-semibold">{emrData.wbc} ×10⁹/L</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">SpO₂</p>
                                        <p className="font-semibold">{emrData.sat}%</p>
                                    </div>
                                    {emrData.diagnoses && (
                                        <div className="md:col-span-2 bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">Diagnoses</p>
                                            <ul className="list-disc list-inside text-sm font-semibold text-gray-800 space-y-1">
                                                {emrData.diagnoses.map((diag, index) => (
                                                    <li key={index}>
                                                        {diag.icdCode ? `${diag.icdCode} — ${diag.description}` : diag.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm text-gray-500">Sodium</p>
                                        <p className="font-semibold">{emrData.sodium} mmol/L</p>
                                    </div>
                                </div>

                                {emrData.sensitivities && emrData.sensitivities.length > 0 && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Drug Allergies /
                                            Sensitivities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {emrData.sensitivities.map((drug, index) => (
                                                <span key={index}
                                                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                    {drug}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-2 mt-4">
                                    <Button
                                        variant="update"
                                        onClick={() =>
                                            navigate(`/doctor/emr-update/${patient.mrn}`, {
                                                state: {patient, emrData},
                                            })
                                        }
                                    >
                                        Update EMR
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={handleGetAllEmr}
                                        disabled={allEmrLoading}
                                    >
                                        {allEmrLoading ? "Loading..." : "View EMR History"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="mb-4 text-gray-600">No EMR data available for this patient</p>
                                <Button
                                    variant="approve"
                                    onClick={() => navigate(`/doctor/emr-form/${patient.mrn}`, {state: patient})}
                                >
                                    Create EMR
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* All EMRs History */}
            {loadAllEmr && allEmrData && allEmrData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>EMR History ({allEmrData.length} records)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {allEmrData.map((emr: EMR, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                <p className="font-semibold mb-3 text-gray-700">Record #{index + 1}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Height</p>
                                        <p className="font-semibold">{emr.height} cm</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Weight</p>
                                        <p className="font-semibold">{emr.weight} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">GFR</p>
                                        <p className="font-semibold">{emr.gfr}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Child-Pugh</p>
                                        <p className="font-semibold">{emr.childPughScore}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">PLT</p>
                                        <p className="font-semibold">{emr.plt} ×10⁹/L</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">WBC</p>
                                        <p className="font-semibold">{emr.wbc} ×10⁹/L</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">SpO₂</p>
                                        <p className="font-semibold">{emr.sat}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Sodium</p>
                                        <p className="font-semibold">{emr.sodium} mmol/L</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-4">
                                        <p className="text-gray-500 text-xs">Created: {emr.createdAt ? new Date(emr.createdAt).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}</p>
                                    </div>
                                </div>
                                {emr.sensitivities && emr.sensitivities.length > 0 && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs font-semibold text-red-800 mb-2">⚠️ Drug Allergies</p>
                                        <div className="flex flex-wrap gap-1">
                                            {emr.sensitivities.map((drug, idx) => (
                                                <span key={idx}
                                                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                                    {drug}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Patient Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                            variant="default"
                            onClick={handleGetRecommendation}
                            disabled={recommendationLoading}
                            className="w-full"
                        >
                            {recommendationLoading ? "Loading..." : "View Recommendation"}
                        </Button>

                        <Button
                            variant="update"
                            onClick={() => navigate(`/doctor/update-patient/${patient.mrn}`, {state: patient})}
                            className="w-full"
                        >
                            Update Patient
                        </Button>

                        <Button
                            variant="delete"
                            onClick={handleDeletePatient}
                            className="w-full"
                        >
                            Delete Patient
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <PageNavigation />
        </div>
    );
};

export default PatientDetails;
