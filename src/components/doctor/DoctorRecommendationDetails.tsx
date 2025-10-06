import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useApproveRecommendationMutation, useRejectRecommendationMutation} from "../../api/api/apiDoctorSlice";
import type {RecommendationWithVas, RecommendationApprovalRejection, DrugRecommendation, RecommendationStatus} from "../../types/doctor";
import {Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea} from "../ui";

const RecommendationDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const recWithVas = location.state as RecommendationWithVas;

    const [comment, setComment] = useState("");
    const [rejectedReason, setRejectedReason] = useState("");

    const [approveRecommendation, {isLoading: isApproving}] = useApproveRecommendationMutation();
    const [rejectRecommendation, {isLoading: isRejecting}] = useRejectRecommendationMutation();

    if (!recWithVas) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="mb-4">No recommendation data. Please navigate from the recommendations list.</p>
                        <Button variant="update" onClick={() => navigate("/doctor/recommendations")}>
                            Back to Recommendations
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const {recommendation, vas, patientMrn} = recWithVas;
    const isPending = recommendation.status === "PENDING";

    const handleApprove = async () => {
        if (!patientMrn) return;
        try {
            const data: RecommendationApprovalRejection = {
                status: "APPROVED" as RecommendationStatus,
                comment: comment || undefined,
            };
            await approveRecommendation({mrn: patientMrn, data}).unwrap();
            alert("Recommendation approved!");
            navigate("/doctor/recommendations");
        } catch (error) {
            console.error("Failed to approve:", error);
            alert("Error approving recommendation");
        }
    };

    const handleReject = async () => {
        if (!patientMrn || !rejectedReason.trim()) {
            alert("Rejected reason is required!");
            return;
        }
        try {
            const data: RecommendationApprovalRejection = {
                status: "REJECTED" as RecommendationStatus,
                rejectedReason,
                comment: comment || undefined,
            };
            await rejectRecommendation({mrn: patientMrn, data}).unwrap();
            alert("Recommendation rejected!");
            navigate("/doctor/recommendations");
        } catch (error) {
            console.error("Failed to reject:", error);
            alert("Error rejecting recommendation");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Recommendation Details</h1>
                    <p className="text-gray-600 mt-1">Patient MRN: {patientMrn}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/doctor/recommendations")}>
                    Back to Recommendations
                </Button>
            </div>

            {/* VAS (Pain Assessment) */}
            <Card>
                <CardHeader>
                    <CardTitle>Pain Assessment (VAS)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Pain Level</p>
                            <p className="text-2xl font-bold text-red-600">{vas.painLevel}/10</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Pain Location</p>
                            <p className="font-semibold">{vas.painPlace}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Assessed At</p>
                            <p className="font-semibold text-sm">{vas.createdAt ? new Date(vas.createdAt).toLocaleString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            }) : 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recommendation */}
            <Card>
                <CardHeader>
                    <CardTitle>Recommendation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                recommendation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                recommendation.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                "bg-red-100 text-red-800"
                            }`}>{recommendation.status}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Regimen Hierarchy</p>
                            <p className="font-semibold">{recommendation.regimenHierarchy}</p>
                        </div>
                    </div>
                
                    {/* Drugs */}
                    {recommendation.drugs && recommendation.drugs.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Prescribed Medications</h3>
                            <div className="space-y-3">
                                {recommendation.drugs.map((drug: DrugRecommendation, index: number) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                        <p className="font-bold text-blue-600 mb-2">{drug.drugName}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
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
                                            <div>
                                                <p className="text-gray-500">Age Adjustment</p>
                                                <p className="font-semibold">{drug.ageAdjustment}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Weight Adjustment</p>
                                                <p className="font-semibold">{drug.weightAdjustment}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Child-Pugh</p>
                                                <p className="font-semibold">{drug.childPugh}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contraindications */}
                    {recommendation.contraindications && recommendation.contraindications.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-red-800">⚠️ Contraindications</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {recommendation.contraindications.map((item: string, index: number) => (
                                    <li key={index} className="text-red-700">{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Avoid If Sensitivity */}
                    {recommendation.avoidIfSensitivity && recommendation.avoidIfSensitivity.length > 0 && (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-orange-800">⚠️ Avoid If Sensitivity</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {recommendation.avoidIfSensitivity.map((item: string, index: number) => (
                                    <li key={index} className="text-orange-700">{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Comments */}
                    {recommendation.comments && recommendation.comments.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">💬 Comments</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {recommendation.comments.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {recommendation.rejectedReason && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
                            <p className="text-red-700">{recommendation.rejectedReason}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approve/Reject Section (only if PENDING) */}
            {isPending && (
                <Card>
                    <CardHeader>
                        <CardTitle>Review & Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="comment">Comment (Optional)</Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="Add your professional comment or notes here..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="rejectedReason">Rejection Reason (Required if rejecting)</Label>
                            <Textarea
                                id="rejectedReason"
                                value={rejectedReason}
                                onChange={(e) => setRejectedReason(e.target.value)}
                                rows={3}
                                placeholder="Provide detailed reason for rejection..."
                            />
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                variant="approve"
                                onClick={handleApprove}
                                disabled={isApproving}
                                className="flex-1"
                            >
                                {isApproving ? "Approving..." : "✓ Approve Recommendation"}
                            </Button>
                            <Button
                                variant="reject"
                                onClick={handleReject}
                                disabled={isRejecting}
                                className="flex-1"
                            >
                                {isRejecting ? "Rejecting..." : "✗ Reject Recommendation"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RecommendationDetails;
