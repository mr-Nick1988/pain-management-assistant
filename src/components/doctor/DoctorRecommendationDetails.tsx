import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useApproveRecommendationMutation, useRejectRecommendationMutation} from "../../api/api/apiDoctorSlice";
import type {RecommendationWithVas, RecommendationApprovalRejection, DrugRecommendation, RecommendationStatus} from "../../types/doctor";

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
                <p>No recommendation data. Please navigate from the recommendations list.</p>
                <button
                    onClick={() => navigate("/doctor/recommendations")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Recommendations
                </button>
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
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate("/doctor/recommendations")}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Back to Recommendations
            </button>

            <h1 className="text-2xl font-bold mb-4">Recommendation Details</h1>

            {/* VAS (Pain Assessment) */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h2 className="text-xl font-semibold mb-2">Pain Assessment (VAS)</h2>
                <p><strong>Pain Level:</strong> {vas.painLevel}/10</p>
                <p><strong>Pain Place:</strong> {vas.painPlace}</p>
                <p><strong>Created At:</strong> {vas.createdAt}</p>
            </div>

            {/* Recommendation */}
            <div className="mb-6 p-4 bg-white border rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Recommendation</h2>
                <p><strong>Patient MRN:</strong> {patientMrn}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${
                    recommendation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    recommendation.status === "APPROVED" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                }`}>{recommendation.status}</span></p>
                <p><strong>Regimen Hierarchy:</strong> {recommendation.regimenHierarchy}</p>
                
                {/* Drugs */}
                {recommendation.drugs && recommendation.drugs.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Drugs:</h3>
                        {recommendation.drugs.map((drug: DrugRecommendation, index: number) => (
                            <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                                <p><strong>Drug Name:</strong> {drug.drugName}</p>
                                <p><strong>Active Moiety:</strong> {drug.activeMoiety}</p>
                                <p><strong>Dosing:</strong> {drug.dosing}</p>
                                <p><strong>Interval:</strong> {drug.interval}</p>
                                <p><strong>Route:</strong> {drug.route}</p>
                                <p><strong>Role:</strong> {drug.role}</p>
                                <p><strong>Age Adjustment:</strong> {drug.ageAdjustment}</p>
                                <p><strong>Weight Adjustment:</strong> {drug.weightAdjustment}</p>
                                <p><strong>Child Pugh:</strong> {drug.childPugh}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Contraindications */}
                {recommendation.contraindications && recommendation.contraindications.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Contraindications:</h3>
                        <ul className="list-disc list-inside">
                            {recommendation.contraindications.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Avoid If Sensitivity */}
                {recommendation.avoidIfSensitivity && recommendation.avoidIfSensitivity.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Avoid If Sensitivity:</h3>
                        <ul className="list-disc list-inside">
                            {recommendation.avoidIfSensitivity.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Comments */}
                {recommendation.comments && recommendation.comments.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Comments:</h3>
                        <ul className="list-disc list-inside">
                            {recommendation.comments.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {recommendation.rejectedReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p><strong>Rejected Reason:</strong> {recommendation.rejectedReason}</p>
                    </div>
                )}
            </div>

            {/* Approve/Reject Section (only if PENDING) */}
            {isPending && (
                <div className="p-4 bg-gray-50 border rounded">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Comment (optional):</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                            placeholder="Add your comment here..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Rejected Reason (required for rejection):</label>
                        <textarea
                            value={rejectedReason}
                            onChange={(e) => setRejectedReason(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                            placeholder="Provide reason if rejecting..."
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {isApproving ? "Approving..." : "Approve"}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={isRejecting}
                            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            {isRejecting ? "Rejecting..." : "Reject"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationDetails;
