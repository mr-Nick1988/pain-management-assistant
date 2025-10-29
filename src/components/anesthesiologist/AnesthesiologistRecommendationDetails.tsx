import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    useGetPatientByMrnQuery,
    useGetLastEmrByPatientMrnQuery,
    useRejectRecommendationMutation,
    useLazyGetPatientHistoryQuery

} from "../../api/api/apiAnesthesiologistSlice";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Label,
    LoadingSpinner,
    PageNavigation,
    Textarea,
} from "../ui";
import { useToast } from "../../contexts/ToastContext";
import type { DrugRecommendation, RecommendationWithVas, RecommendationApprovalRejection } from "../../types/common/types";
import { RecommendationStatus } from "../../types/common/types";
import { PatientHistoryList } from "../../exports/exports.ts";


const AnesthesiologistRecommendationDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mrn: mrnFromUrl } = useParams<{ mrn: string }>();
    const recWithVas = location.state as RecommendationWithVas | undefined;
    const toast = useToast();

    const [comment, setComment] = useState("");
    const [rejectedReason, ] = useState("");

    const [rejectRecommendation, { isLoading: isRejecting }] = useRejectRecommendationMutation();



    if (!recWithVas) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="mb-4">No recommendation data found.</p>
                        <Button variant="update" onClick={() => navigate("/anesthesiologist/escalations")}>
                            Back to Escalations
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { recommendation, vas, patientMrn } = recWithVas;
    const mrnToUse = patientMrn || mrnFromUrl || "";

    const [triggerHistory, { data: history, isFetching: isHistoryLoading, isError: isHistoryError }] =
        useLazyGetPatientHistoryQuery();

    const toastError = () => toast.error("Patient MRN is missing. Cannot fetch patient data.");

    if (!mrnToUse) toastError();

    // --- API calls ---
    const { data: patient, isFetching: isFetchingPatient } = useGetPatientByMrnQuery(mrnToUse, { skip: !mrnToUse });
    const { data: emr, isFetching: isFetchingEmr } = useGetLastEmrByPatientMrnQuery(mrnToUse, { skip: !mrnToUse });

    const drugs: DrugRecommendation[] = Array.isArray(recommendation?.drugs) ? recommendation.drugs : [];

    // === Handlers === //
    const handleApproveAndUpdate = async () => {
        if (!recommendation.id) {
            toast.error("Recommendation ID is missing!");
            return;
        }

        try {
            // Переход без обновления — просто навигация к форме обновления
            navigate(`/anesthesiologist/recommendation/update/${mrnToUse}`, {
                state: recWithVas,
            });
        } catch (error) {
            console.error("Failed to navigate to update form:", error);
            toast.error("Navigation error.");
        }
    };

    const handleRejectAndCreateNew = async () => {
        if (!recommendation.id) {
            toast.error("Recommendation ID is missing!");
            return;
        }
        try {
            const dto: RecommendationApprovalRejection = {
                status: RecommendationStatus.REJECTED,
                comment: comment || "Rejected by anesthesiologist",
                rejectedReason: rejectedReason || "Not specified",
            };
            await rejectRecommendation({ recommendationId: recommendation.id, dto }).unwrap();
            navigate(`/anesthesiologist/recommendation/create/${mrnToUse}`, { state: recWithVas });
        } catch (error) {
            console.error("Failed to reject recommendation:", error);
            toast.error("Error rejecting recommendation.");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Escalated Recommendation Details</h1>
                    <p className="text-gray-600 mt-1">Patient MRN: {mrnToUse}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/anesthesiologist/escalations")}>
                    Back to Escalations
                </Button>
            </div>

            {/* Patient Information */}
            {isFetchingPatient ? (
                <Card>
                    <CardContent className="text-center py-4">
                        <LoadingSpinner />
                        <p className="mt-2">Loading patient information...</p>
                    </CardContent>
                </Card>
            ) : patient ? (
                <Card>
                    <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><p className="text-sm text-gray-500">Full Name</p><p className="font-semibold">{patient.firstName} {patient.lastName}</p></div>
                            <div><p className="text-sm text-gray-500">MRN</p><p className="font-semibold">{patient.mrn}</p></div>
                            <div><p className="text-sm text-gray-500">Date of Birth</p><p className="font-semibold">{patient.dateOfBirth}</p></div>
                            <div><p className="text-sm text-gray-500">Gender</p><p className="font-semibold">{patient.gender}</p></div>
                            <div><p className="text-sm text-gray-500">Insurance Policy</p><p className="font-semibold">{patient.insurancePolicyNumber || "N/A"}</p></div>
                            <div><p className="text-sm text-gray-500">Phone</p><p className="font-semibold">{patient.phoneNumber}</p></div>
                            <div className="md:col-span-2"><p className="text-sm text-gray-500">Address</p><p className="font-semibold">{patient.address}</p></div>
                            <div><p className="text-sm text-gray-500">Treatment Status</p>
                                <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                    {patient.isActive ? "In Treatment" : "Not in Treatment"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {/* EMR Information */}
            {isFetchingEmr ? (
                <Card>
                    <CardContent className="text-center py-4">
                        <LoadingSpinner />
                        <p className="mt-2">Loading EMR data...</p>
                    </CardContent>
                </Card>
            ) : emr ? (
                <Card>
                    <CardHeader><CardTitle>Electronic Medical Record (EMR)</CardTitle></CardHeader>
                    <CardContent>
                        {/* безопасные значения для возможных undefined */}
                        {(() => {
                            const diagnoses =
                                Array.isArray(emr.diagnoses) ? emr.diagnoses : [];
                            const sensitivities =
                                Array.isArray(emr.sensitivities) ? emr.sensitivities : [];

                            return (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">Height</p>
                                            <p className="font-semibold">{emr.height ?? "N/A"} cm</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">Weight</p>
                                            <p className="font-semibold">{emr.weight ?? "N/A"} kg</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">GFR</p>
                                            <p className="font-semibold">{emr.gfr ?? "N/A"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">Child-Pugh</p>
                                            <p className="font-semibold">{emr.childPughScore ?? "N/A"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">PLT</p>
                                            <p className="font-semibold">{emr.plt ?? "N/A"} ×10⁹/L</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">WBC</p>
                                            <p className="font-semibold">{emr.wbc ?? "N/A"} ×10⁹/L</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">SpO₂</p>
                                            <p className="font-semibold">{emr.sat ?? "N/A"}%</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-500">Sodium</p>
                                            <p className="font-semibold">{emr.sodium ?? "N/A"} mmol/L</p>
                                        </div>
                                    </div>

                                    {diagnoses.length > 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-800 mb-2">📋 Diagnoses</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {diagnoses.map(
                                                    (diag: { icdCode?: string; description?: string }, index: number) => (
                                                        <li key={index} className="text-sm">
                                                            {diag?.icdCode ? `${diag.icdCode} — ${diag?.description ?? ""}` : (diag?.description ?? "")}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {sensitivities.length > 0 && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Drug Allergies / Sensitivities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {sensitivities.map((drug: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                                                    >
                      {drug}
                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            ) : null}

            {/* Patient Recommendation History */}

            <Card>
                <CardHeader><CardTitle>Patient Recommendation History</CardTitle></CardHeader>
                <CardContent>
                    {!history ? (
                        <Button   variant="outline"  className="mx-auto block" onClick={() => triggerHistory(mrnToUse)}>
                            📋 Load Patient History
                        </Button>
                    ) : isHistoryLoading ? (
                        <LoadingSpinner message="Loading..." />
                    ) : (
                        <PatientHistoryList history={history || []} />
                    )}
                    {isHistoryError && (
                        <p className="text-red-600 text-sm">Error loading recommendation history.</p>
                    )}
                </CardContent>
            </Card>
            {/* VAS Section */}
            <Card>
                <CardHeader><CardTitle>Pain Assessment (VAS)</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Pain Level</p><p className="text-2xl font-bold text-red-600">{vas.painLevel}/10</p></div>
                        <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Pain Location</p><p className="font-semibold">{vas.painPlace}</p></div>
                        <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Assessed At</p><p className="font-semibold text-sm">{vas.createdAt ? new Date(vas.createdAt).toLocaleString() : "N/A"}</p></div>
                    </div>
                </CardContent>
            </Card>

            {/* Recommendation Details */}
            <Card>
                <CardHeader><CardTitle>Recommendation Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div><p className="text-sm text-gray-500">Status</p>
                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">{recommendation.status}</span>
                        </div>
                        <div><p className="text-sm text-gray-500">Regimen Hierarchy</p><p className="font-semibold">{recommendation.regimenHierarchy}</p></div>
                    </div>

                    {drugs.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Prescribed Medications</h3>
                            <div className="space-y-3">
                                {drugs.map((drug, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                        <p className="font-bold text-blue-600 mb-2">{drug.drugName}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                            <div><p className="text-gray-500">Active Moiety</p><p className="font-semibold">{drug.activeMoiety}</p></div>
                                            <div><p className="text-gray-500">Dosing</p><p className="font-semibold">{drug.dosing}</p></div>
                                            <div><p className="text-gray-500">Interval</p><p className="font-semibold">{drug.interval}</p></div>
                                            <div><p className="text-gray-500">Route</p><p className="font-semibold">{drug.route}</p></div>
                                            <div><p className="text-gray-500">Role</p><p className="font-semibold">{drug.role}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Comments Section */}
            {Array.isArray(recommendation.comments) && recommendation.comments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Comments & Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {recommendation.comments.map((text: string, index: number) => (
                                <li
                                    key={index}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
                                >
                                    💬 {text}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
            {/* Rejection Reason Section */}
            {recommendation.rejectedReason && (
                <Card>
                    <CardHeader>
                        <CardTitle>Previous Rejection Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-semibold mb-1">Reason:</p>
                            <p className="text-red-900">{recommendation.rejectedReason}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Decision / Replace Section */}
            {/* Decision / Replace Section */}
            {recommendation.status === RecommendationStatus.ESCALATED ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Review & Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="Add your notes here..."
                            />
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                variant="approve"
                                onClick={handleApproveAndUpdate}
                                className="flex-1"
                            >
                                Update & Approve
                            </Button>
                            <Button
                                variant="reject"
                                onClick={handleRejectAndCreateNew}
                                disabled={isRejecting}
                                className="flex-1"
                            >
                                {isRejecting ? "Rejecting..." : "❌ Reject & Create New"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : recommendation.status === RecommendationStatus.REJECTED ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Rejected Recommendation Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-gray-700">
                            This recommendation was previously rejected by the anesthesiologist.
                            Review the details above before creating a new one.
                        </p>
                        <Button
                            variant="approve"
                            className="w-full"
                            onClick={() =>
                                navigate(`/anesthesiologist/recommendation/create/${mrnToUse}`, {
                                    state: recWithVas,
                                })
                            }
                        >
                            🔁 Create Replacement Recommendation
                        </Button>
                    </CardContent>
                </Card>
            ) : null}
            <PageNavigation />
        </div>
    );
};



export default AnesthesiologistRecommendationDetails;