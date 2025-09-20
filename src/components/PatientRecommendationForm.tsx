import React, {useState} from "react";
import {type Recommendation, RecommendationStatus} from "../types/recommendation.ts";
import {
    useApproveRecommendationMutation,
    useRejectRecommendationMutation,
    useUpdateRecommendationMutation
} from "../api/api/apiDoctorSlice.ts";


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
            alert("Recommendation updated successfully");
        } catch (error) {
            console.error("Error updating recommendation:", error);
        }
    };
    const isLoading = isApproving || isRejecting || isUpdating;
    const isPending = recommendation.status === RecommendationStatus.PENDING;

    return (
        <div className="patient-recommendation">
            <div className="recommendation-header">
                <h3>Recommendation for patient</h3>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            <div className="patient-info">
                <h4>Patient info</h4>
                <div className="info-row">
                    <span className="label">Name:</span>
                    <span
                        className="value">{recommendation.patient?.firstName} {recommendation.patient?.lastName}</span>
                </div>
                <div className="info-row">
                    <span className="label">EMR:</span>
                    <span className="value">{recommendation.patient?.emrNumber}</span>
                </div>
            </div>

            <div className="recommendation-details">
                <h4>Recommendation details</h4>
                <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status ${recommendation.status.toLowerCase()}`}>
                        {recommendation.status === RecommendationStatus.PENDING && "Pending"}
                        {recommendation.status === RecommendationStatus.APPROVED && "Approved"}
                        {recommendation.status === RecommendationStatus.REJECTED && "Rejected"}
                    </span>
                </div>
                <div className="info-row">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(recommendation.createdAt).toLocaleString()}</span>
                </div>
                <div className="info-row">
                    <span className="label">Updated:</span>
                    <span className="value">{new Date(recommendation.updatedAt).toLocaleString()}</span>
                </div>
                <div className="info-row">
                    <span className="label">Created by person:</span>
                    <span className="value">{recommendation.createdBy}</span>
                </div>
            </div>

            <div className="recommendation-content">
                <h4>Description</h4>
                <div className="content-box">{recommendation.description}</div>

                <h4>Justification</h4>
                <div className="content-box">{recommendation.justification}</div>

                {recommendation.rejectionReason && (
                    <>
                        <h4>Rejection reason</h4>
                        <div className="content-box rejection-reason">{recommendation.rejectionReason}</div>
                    </>
                )}
            </div>

            <div className="doctor-actions">
                <h4>Doctor comment</h4>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter comment..."
                    className="comment-textarea"
                />

                <div className="action-buttons">
                    {isPending ? (
                        <>
                            <button
                                className="approve-button"
                                onClick={handleApproveRecommendation}
                                disabled={isLoading}
                            >
                                {isApproving ? "Approving..." : "Approve"}
                            </button>

                            <button
                                className="reject-button"
                                onClick={() => setShowRejectionForm(true)}
                                disabled={isLoading || showRejectionForm}
                            >
                                Reject
                            </button>
                        </>
                    ) : (
                        <button
                            className="update-button"
                            onClick={handleUpdateComment}
                            disabled={isLoading}
                        >
                            {isUpdating ? "Updating..." : "Update"}
                        </button>
                    )}
                </div>

                {showRejectionForm && (
                    <div className="rejection-form">
                        <h4>Rejected reason</h4>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason of rejection(required)"
                            className="rejection-textarea"
                            required
                        />

                        <div className="rejection-actions">
                            <button
                                className="confirm-reject-button"
                                onClick={handleRejectRecommendation}
                                disabled={isLoading || !rejectionReason.trim()}
                            >
                                {isRejecting ? "Rejecting..." : "Reject"}
                            </button>

                            <button
                                className="cancel-button"
                                onClick={() => setShowRejectionForm(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default PatientRecommendationForm;