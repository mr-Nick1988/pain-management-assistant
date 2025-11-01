import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    useGetRecommendationByPatientIdQuery,
    useGetPatientByMrnQuery,
    useExecuteRecommendationMutation,
} from "../../api/api/apiNurseSlice";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    LoadingSpinner,
    PageNavigation,
} from "../ui";
import { useToast } from "../../contexts/ToastContext";

const RecommendationDetails: React.FC = () => {
    const { mrn } = useParams<{ mrn: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const cachedPatient = location.state?.patient || null;

    const { data: fetchedPatient, isLoading: isPatientLoading } = useGetPatientByMrnQuery(mrn ?? "", {
        skip: !mrn || !!cachedPatient,
        refetchOnMountOrArgChange: true,
    });

    const patient = cachedPatient || fetchedPatient;

    const {
        data: recommendation,
        isLoading,
        isError,
    } = useGetRecommendationByPatientIdQuery(mrn ?? "", { skip: !mrn });

    const [executeRecommendation, { isLoading: isExecuting }] = useExecuteRecommendationMutation();

    const handleExecute = async () => {
        if (!mrn) return;
        try {
            await executeRecommendation({ mrn }).unwrap();
            toast.success("💊 Medication administration confirmed successfully!");
            navigate(`/nurse/patient/${mrn}`, { replace: true });
        } catch (err) {
            console.error("Execution error:", err);
            toast.error("Failed to confirm medication administration. Please try again.");
        }
    };

    if (isLoading || isPatientLoading)
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4">Loading recommendation...</p>
                    </CardContent>
                </Card>
            </div>
        );

    if (isError || !recommendation)
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-500 mb-4">No recommendation found.</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">Recommendation Details</h1>
                    <p className="text-gray-600 mt-1">Patient MRN: {mrn}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/nurse")}>
                    Back to Dashboard
                </Button>
            </div>

            {/* Recommendation Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Recommendation Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Patient MRN</p>
                            <p className="font-semibold">{mrn}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Patient Name</p>
                            <p className="font-semibold">{patient?.firstName ?? "?"} {patient?.lastName ?? ""}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-semibold">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    recommendation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                    recommendation.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                    recommendation.status === "EXECUTED" ? "bg-blue-100 text-blue-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {recommendation.status}
                                </span>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Regimen Hierarchy</p>
                            <p className="font-semibold">{recommendation.regimenHierarchy || "N/A"}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Created At</p>
                            <p className="font-semibold text-sm">{recommendation.createdAt ? new Date(recommendation.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Updated At</p>
                            <p className="font-semibold text-sm">{recommendation.updatedAt ? new Date(recommendation.updatedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Created By</p>
                            <p className="font-semibold">{recommendation.createdBy || "N/A"}</p>
                        </div>
                        {recommendation.rejectedReason && recommendation.status === "REJECTED" && (
                            <div className="space-y-2 md:col-span-2">
                                <p className="text-sm text-gray-500">Rejected Reason</p>
                                <p className="font-semibold text-red-600">{recommendation.rejectedReason}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Comments */}
            {recommendation.comments && recommendation.comments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {recommendation.comments.map((comment, i) => (
                                <li key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                    {comment.trim().startsWith("[SYSTEM]") ? (
                                        <span className="text-blue-600 font-medium">
                                            {comment.replace("[SYSTEM]", "💡 System:")}
                                        </span>
                                    ) : comment.trim().startsWith("[DOCTOR]") ? (
                                        <span className="text-green-600 font-medium">
                                            {comment.replace("[DOCTOR]", "👨‍⚕️ Doctor:")}
                                        </span>
                                    ) : (
                                        <span className="text-gray-700">{comment}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* System Rejection Reasons */}
            {(recommendation.generationFailed || (recommendation.rejectionReasonsSummary?.length ?? 0) > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>System Rejection Reasons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recommendation.rejectionReasonsSummary?.length ? (
                            <ul className="space-y-2">
                                {recommendation.rejectionReasonsSummary.map((reason: string, i: number) => (
                                    <li key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                                        ⚠️ {reason}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No rejection reasons recorded.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Drug Recommendations */}
            {(recommendation.drugs ?? []).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Prescribed Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendation.drugs?.map((drug, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition"
                                >
                                    <p className="font-bold text-blue-600 mb-3">{drug.drugName}</p>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Active Moiety</p>
                                            <p className="font-semibold">{drug.activeMoiety}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Dosing</p>
                                            <p className="font-semibold">{drug.dosing}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Interval</p>
                                            <p className="font-semibold">{drug.interval}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Route</p>
                                            <p className="font-semibold">{drug.route}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Role</p>
                                            <p className="font-semibold">{drug.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Administrate Medicine Button */}
            {recommendation.status === "APPROVED" && (
                <Card>
                    <CardContent className="text-center py-6">
                        <Button
                            variant="approve"
                            onClick={handleExecute}
                            disabled={isExecuting}
                            className="px-8"
                        >
                            {isExecuting ? "Processing..." : "💊 Administrate Medicine"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/nurse")}>
                    ← Back to Dashboard
                </Button>
                <Button
                    variant="default"
                    onClick={() =>
                        navigate(`/nurse/patient/${mrn}`, { state: patient ? { patient } : undefined })
                    }
                >
                    Back to Patient →
                </Button>
            </div>

            <PageNavigation />
        </div>
    );
};

export default RecommendationDetails;
