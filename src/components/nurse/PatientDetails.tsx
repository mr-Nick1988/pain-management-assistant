import React, {useState, useEffect} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useGetRecommendationByPatientIdQuery,
    useDeletePatientMutation,
    useGetPatientByMrnQuery,
    useGetLastVasByPatientIdQuery,
} from "../../api/api/apiNurseSlice";
import {type Patient, RecommendationStatus} from "../../types/nurse";
import type {Diagnosis} from "../../types/common/types.ts";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    LoadingSpinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    PageNavigation,
} from "../ui";
import { useToast } from "../../contexts/ToastContext";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {mrn} = useParams<{ mrn: string }>();
    const { success, error } = useToast();

    const autoShowRecommendation = location.state?.autoShowRecommendation || false;
    const fromExternalVas = location.state?.fromExternalVas || false;

    const {
        data: patientData,
        isLoading: isLoadingPatient,
        isError: isErrorPatient,
    } = useGetPatientByMrnQuery(mrn || "", {
        skip: !mrn,
        refetchOnMountOrArgChange: true,
    });

    const patient: Patient = patientData as Patient;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loadEmr, setLoadEmr] = useState(false);
    const [showRecommendation, setShowRecommendation] = useState(autoShowRecommendation);

    const {data: emrData, isFetching: emrLoading} = useGetEmrByPatientIdQuery(
        mrn || "",
        {skip: !loadEmr || !mrn}
    );

    const { data: lastVas, isLoading: isVasLoading } =
        useGetLastVasByPatientIdQuery(mrn || "", { skip: !mrn });

    const { data: lastRecommendation, isLoading: isRecLoading, isError: isRecError } =
        useGetRecommendationByPatientIdQuery(mrn || "", {
            skip: !mrn,
            refetchOnMountOrArgChange: true,
        });

    useEffect(() => {
        if (fromExternalVas && autoShowRecommendation) {
            setShowRecommendation(true);
            const timer = setTimeout(() => {
                if (!lastRecommendation && !isRecLoading) {
                    error(" Recommendation was NOT created! Check backend logs. Possible reasons: Previous recommendation is still unresolved, or Pain Trend Rule blocked it.");
                } else if (lastRecommendation) {
                    success("📋 Showing automatically generated recommendation from External VAS");
                }
            }, 1000);
            
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromExternalVas, autoShowRecommendation, lastRecommendation, isRecLoading]);

    const [deletePatient] = useDeletePatientMutation();

    const isRecommendationPending = lastRecommendation?.status === "PENDING";

    const confirmDelete = async () => {
        await deletePatient(patient.mrn!);
        setIsDeleteModalOpen(false);
        navigate("/nurse");
    };

    const handlePainComplaint = () => {
        if (isVasLoading || isRecLoading) return;

        if (isRecommendationPending) {
            alert("You cannot register a new pain complaint until the current recommendation is approved.");
            return;
        }

        if (lastVas && lastVas.resolved === false) {
            navigate(`/nurse/recommendation/${patient.mrn}`, {
                state: { patient, vasData: lastVas },
            });
        } else {
            navigate(`/nurse/vas-form/${patient.mrn}`, { state: patient });
        }
    };

    const isRecommendationLocked =
        lastRecommendation && lastRecommendation.status !== "EXECUTED";
    const isRecommendationExecuted = lastRecommendation?.status === "EXECUTED";
    const isRecommendationApproved = lastRecommendation?.status === "APPROVED";

    if (isLoadingPatient && !patient)
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4">Loading patient data...</p>
                    </CardContent>
                </Card>
            </div>
        );

    if (isErrorPatient || !patient)
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-500 mb-4">No patient data available. Please return to the Dashboard.</p>
                        <Button variant="update" onClick={() => navigate("/nurse")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
                    <p className="text-gray-600 mt-1">{patient.firstName} {patient.lastName}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/nurse")}>
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
                                                {emrData.diagnoses.map((diag: Diagnosis, index: number) => (
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
                                            {emrData.sensitivities.map((drug: string, index: number) => (
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
                                            navigate(`../emr-update/${patient.mrn}`, {
                                                state: {patient, emrData},
                                            })
                                        }
                                    >
                                        Update EMR
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="mb-4 text-gray-600">No EMR data available for this patient</p>
                                <Button
                                    variant="approve"
                                    onClick={() => navigate(`../emr-form/${patient.mrn}`, {state: patient})}
                                >
                                    Create EMR
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Recommendation */}
            <Card>
                <CardHeader>
                    <CardTitle>Pain Management Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                    {!showRecommendation ? (
                        <div className="flex gap-2">
                            <Button variant="default" onClick={() => setShowRecommendation(true)}>
                                Show Last Recommendation
                            </Button>
                        </div>
                    ) : (
                        <>
                            {isRecLoading ? (
                                <p className="text-center py-4">Loading recommendation...</p>
                            ) : isRecError ? (
                                <p className="text-red-600 text-center py-4">Error loading recommendation.</p>
                            ) : lastRecommendation ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="font-semibold">{lastRecommendation.status}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">Regimen Hierarchy</p>
                                            <p className="font-semibold">{lastRecommendation.regimenHierarchy}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">Created At</p>
                                            <p className="font-semibold">{lastRecommendation.createdAt ? new Date(lastRecommendation.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">Created By</p>
                                            <p className="font-semibold">{lastRecommendation.createdBy ?? "N/A"}</p>
                                        </div>
                                    </div>

                                    {lastRecommendation.comments?.length ? (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-800 mb-2">💬 Comments</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {lastRecommendation.comments.map((c, i) => (
                                                    <li key={i} className="text-sm">{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    {lastRecommendation && (
                                        <div className="mt-4">
                                            <Button
                                                variant="default"
                                                onClick={() =>
                                                    navigate(`/nurse/recommendation-details/${patient.mrn}`, {
                                                        state: { patient },
                                                    })
                                                }
                                            >
                                                View Full Recommendation
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center py-4">
                                    No recommendation found for this patient.
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Patient Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                            variant="approve"
                            onClick={handlePainComplaint}
                            disabled={isRecommendationLocked}
                            className="w-full"
                        >
                            Register Pain Complaint
                        </Button>

                        <Button
                            variant="update"
                            onClick={() => navigate(`../update-patient/${patient.mrn}`, {state: patient})}
                            className="w-full"
                        >
                            Update Patient
                        </Button>

                        <Button
                            variant="delete"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full"
                        >
                            Delete Patient
                        </Button>
                    </div>

                    {lastVas && !lastVas.resolved && (
                        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                            <p className="text-sm text-yellow-700 font-medium">
                                There is an unresolved pain complaint for this patient.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Pain level: <strong>{lastVas.painLevel}</strong> /10
                                {lastVas.painPlace && ` • Location: ${lastVas.painPlace}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Created on: {new Date(lastVas.createdAt).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {isRecommendationPending && (
                        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                            <p className="text-sm text-yellow-700 font-medium">
                                Recommendation is not yet approved — new pain complaints are temporarily disabled.
                            </p>
                        </div>
                    )}

                    {isRecommendationApproved && (
                        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                            <p className="text-sm text-green-700 font-medium">
                                The recommendation has been approved by the doctor.
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                Please review the recommendation and administer the prescribed medication.
                            </p>
                            <p className="text-xs text-gray-500 mt-1 italic">
                                You can open it via "View Full Recommendation".
                            </p>
                        </div>
                    )}

                    {isRecommendationExecuted && (
                        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                            <p className="text-sm text-blue-700 font-medium">
                                The medication has been administered successfully.
                            </p>
                            <p className="text-xs text-blue-600 mt-1 italic">
                                You can now register a new pain complaint if needed.
                            </p>
                        </div>
                    )}

                    {(lastRecommendation?.status === RecommendationStatus.ESCALATED || lastRecommendation?.status === RecommendationStatus.REJECTED) && (
                        <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                            <p className="text-sm text-orange-700 font-medium">
                                Recommendation has been escalated to the anesthesiologist.
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                                Please wait for the anesthesiologist to review and approve the recommendation
                                before registering new pain complaints.
                            </p>
                            <p className="text-xs text-gray-500 mt-1 italic">
                                The "Register Pain Complaint" button is temporarily disabled during this process.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <ModalHeader>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>
                        Are you sure you want to delete {patient.firstName} {patient.lastName}? This action
                        cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancel" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="delete" onClick={confirmDelete}>
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>

            <PageNavigation/>
        </div>
    );
};

export default PatientDetails;
