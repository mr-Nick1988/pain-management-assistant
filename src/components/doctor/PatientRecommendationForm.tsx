import React, {useState} from "react";

import {
    useApproveRecommendationMutation,
    useRejectRecommendationMutation,
    useUpdateRecommendationMutation
} from "../../api/api/apiDoctorSlice.ts";
import {type Recommendation, RecommendationStatus} from "../../types/recommendation.ts";
import { Button, Textarea } from "../ui";

interface PatientRecommendationFormProps {
    recommendation: Recommendation;
    onClose: () => void;
}

const PatientRecommendationForm: React.FC<PatientRecommendationFormProps> = ({
                                                                                 recommendation,
                                                                                 onClose
                                                                             }) => {
    const [comment, setComment] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionForm, setShowRejectionForm] = useState(false);

    const [approvedRecommendation, {isLoading: isApproving}] = useApproveRecommendationMutation();
    const [rejectedRecommendation, {isLoading: isRejecting}] = useRejectRecommendationMutation();
    const [updateRecommendation, {isLoading: isUpdating}] = useUpdateRecommendationMutation();

    const handleApproveRecommendation = async () => {
        try {
            await approvedRecommendation({
                recommendationId: recommendation.id,
                status: RecommendationStatus.APPROVED,
                comment
            });
            onClose();
        } catch (error) {
            console.error("Error approving recommendation:", error);
        }
    };
    const handleRejectRecommendation = async () => {
        if (!rejectionReason.trim()) {
            alert("Please enter a rejection reason")
            return;
        }
        try {
            await rejectedRecommendation({
                recommendationId: recommendation.id,
                status: RecommendationStatus.REJECTED,
                comment,
                rejectedReason: rejectionReason
            });
            onClose();
        } catch (error) {
            console.error("Error rejecting recommendation:", error);
        }
    };

    const handleUpdateComment = async () => {
        try {
            await updateRecommendation({
                id: recommendation.id,
                doctorComment: comment
            });
            alert("Doctor updated successfully");
        } catch (error) {
            console.error("Error updating recommendation:", error);
        }
    };
    const isLoading = isApproving || isRejecting || isUpdating;
    const isPending = recommendation.status === RecommendationStatus.PENDING;

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold">Recommendation for patient</h3>
                <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
            </div>

            <div className="space-y-2">
                <h4 className="text-lg font-semibold">Patient info</h4>
                <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{recommendation.patient?.firstName} {recommendation.patient?.lastName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">EMR:</span>
                    <span>{recommendation.patient?.mrn}</span>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-lg font-semibold">Recommendation details</h4>
                <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${recommendation.status === RecommendationStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : recommendation.status === RecommendationStatus.APPROVED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {recommendation.status === RecommendationStatus.PENDING && "Pending"}
                        {recommendation.status === RecommendationStatus.APPROVED && "Approved"}
                        {recommendation.status === RecommendationStatus.REJECTED && "Rejected"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(recommendation.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Updated:</span>
                    <span>{new Date(recommendation.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Created by person:</span>
                    <span>{recommendation.createdBy}</span>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Description</h4>
                <div className="p-3 bg-gray-50 rounded border">{recommendation.description}</div>

                <h4 className="text-lg font-semibold">Justification</h4>
                <div className="p-3 bg-gray-50 rounded border">{recommendation.justification}</div>

                {recommendation.rejectionReason && (
                    <>
                        <h4 className="text-lg font-semibold">Rejection reason</h4>
                        <div className="p-3 bg-gray-50 rounded border">{recommendation.rejectionReason}</div>
                    </>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Doctor comment</h4>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter comment..."
                />

                <div className="flex gap-2">
                    {isPending ? (
                        <>
                            <Button
                                variant="approve"
                                onClick={handleApproveRecommendation}
                                disabled={isLoading}
                            >
                                {isApproving ? "Approving..." : "Approve"}
                            </Button>

                            <Button
                                variant="reject"
                                onClick={() => setShowRejectionForm(true)}
                                disabled={isLoading || showRejectionForm}
                            >
                                Reject
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="update"
                            onClick={handleUpdateComment}
                            disabled={isLoading}
                        >
                            {isUpdating ? "Updating..." : "Update"}
                        </Button>
                    )}
                </div>

                {showRejectionForm && (
                    <div className="space-y-2 mt-4 p-4 bg-red-50 rounded border">
                        <h4 className="text-lg font-semibold">Rejected reason</h4>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason of rejection(required)"
                            required
                        />

                        <div className="flex gap-2">
                            <Button
                                variant="reject"
                                onClick={handleRejectRecommendation}
                                disabled={isLoading || !rejectionReason.trim()}
                            >
                                {isRejecting ? "Rejecting..." : "Reject"}
                            </Button>

                            <Button
                                variant="cancel"
                                onClick={() => setShowRejectionForm(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default PatientRecommendationForm;