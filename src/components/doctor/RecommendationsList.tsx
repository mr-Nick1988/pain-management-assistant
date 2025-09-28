import React, {useState} from "react";
import {
    useApproveRecommendationMutation,
    useGetRecommendationsQuery,
    useRejectRecommendationMutation
} from "../../api/api/apiDoctorSlice.ts";
import {type Recommendation, RecommendationStatus} from "../../types/recommendation.ts";

/**
 * COMPONENT FOR DISPLAYING AND MANAGING RECOMMENDATIONS
 * Shows list of all recommendations with approve/reject functionality
 */
const RecommendationsList: React.FC = () => {
//API hooks
    const {data: recommendations, isLoading, error} = useGetRecommendationsQuery();
    const [approveRecommendation] = useApproveRecommendationMutation();
    const [rejectRecommendation] = useRejectRecommendationMutation();

    //Modal states
    const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [approvalComment, setApprovalComment] = useState("");
    const [rejectReason, setRejectReason] = useState("");


    //HELPER FUNCTION FOR STATUS BADGE
    const getStatusBadge = (status: RecommendationStatus) => {
        switch (status) {
            case RecommendationStatus.APPROVED:
                return "medical-badge-success";
            case RecommendationStatus.REJECTED:
                return "medical-badge-danger";
            case RecommendationStatus.PENDING:
            default:
                return "medical-badge-warning";
        }
    }
    //Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US");
    };

    //Handle approve action
    const handleApprove = async () => {
        if (!selectedRecommendation) return;

        try {
            await approveRecommendation({
                recommendationId: selectedRecommendation.id,
                status: RecommendationStatus.APPROVED,
                comment: approvalComment
            }).unwrap();

            setIsApprovalModalOpen(false);
            setApprovalComment("");
            setSelectedRecommendation(null);
        } catch (error) {
            console.error("Failed to approve recommendation:", error);
        }
    };
    // Handle reject action
    const handleReject = async () => {
        if (!selectedRecommendation) return;

        try {
            await rejectRecommendation({
                recommendationId: selectedRecommendation.id,
                status: RecommendationStatus.REJECTED,
                comment: rejectReason,
                rejectedReason: rejectReason,
            }).unwrap();

            setIsRejectModalOpen(false);
            setRejectReason("");
            setSelectedRecommendation(null);
        } catch (error) {
            console.error("Failed to reject recommendation:", error);
        }
    };
    // Handle view details
    const handleViewDetails = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation);
        setIsDetailsModalOpen(true);
    };
    // Handle approve button click
    const handleApproveClick = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation);
        setIsApprovalModalOpen(true);
    };
    // Handle reject button click
    const handleRejectClick = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation);
        setIsRejectModalOpen(true);
    };


    return (
        <div className="recommendations-list-page">
            {/* PAGE HEADER */}
            <div className="medical-title">
                <h2>Recommendations Management</h2>
            </div>
            {/* LOADING STATE */}
            {isLoading && (
                <div className="medical-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading recommendations...</p>
                </div>
            )}
            {/* ERROR STATE */}
            {error && (
                <div className="medical-error">
                    <h3>Error loading recommendations</h3>
                    <p>{JSON.stringify(error)}</p>
                </div>
            )}
            {/* RECOMMENDATIONS LIST */}
            {recommendations && recommendations.length > 0 && (
                <div className="recommendations-grid">
                    {recommendations.map((recommendation: Recommendation) => (
                        <div key={recommendation.id} className="medical-card recommendation-card">
                            {/* CARD HEADER */}
                            <div className="recommendation-header">
                                <div className="patient-info">
                                    <h4>{recommendation.patient?.firstName} {recommendation.patient?.lastName}</h4>
                                    <p className="patient-mrn">MRN: {recommendation.patient?.mrn}</p>
                                </div>
                                <div className={`medical-badge ${getStatusBadge(recommendation.status)}`}>
                                    {recommendation.status}
                                </div>
                            </div>
                            {/* CARD CONTENT */}
                            <div className="recommendation-content">
                                <p className="description">
                                    <strong>Description:</strong> {recommendation.description}
                                </p>
                                <p className="justification">
                                    <strong>Justification:</strong> {recommendation.justification}
                                </p>
                                <div className="recommendation-meta">
                                    <span>Created: {formatDate(recommendation.createdAt)}</span>
                                    <span>By: {recommendation.createdBy}</span>
                                </div>
                            </div>
                            {/* CARD ACTIONS */}
                            <div className="recommendation-actions">
                                <button
                                    onClick={() => handleViewDetails(recommendation)}
                                    className="medical-btn medical-btn-secondary"
                                >
                                    View Details
                                </button>

                                {recommendation.status === RecommendationStatus.PENDING && (
                                    <>
                                        <button
                                            onClick={() => handleApproveClick(recommendation)}
                                            className="medical-btn medical-btn-success"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectClick(recommendation)}
                                            className="medical-btn medical-btn-danger"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* EMPTY STATE */}
            {recommendations && recommendations.length === 0 && (
                <div className="no-recommendations">
                    <h3>No recommendations found</h3>
                    <p>There are no recommendations to review at this time.</p>
                </div>
            )}

            {/* DETAILS MODAL */}
            {isDetailsModalOpen && selectedRecommendation && (
                <div className="medical-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
                    <div className="medical-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="medical-modal-header">
                            <h3>Recommendation Details</h3>
                            <button
                                className="modal-close"
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="medical-modal-body">
                            <div className="recommendation-details">
                                <div className="detail-section">
                                    <h4>Patient Information</h4>
                                    <p>
                                        <strong>Name:</strong> {selectedRecommendation.patient?.firstName} {selectedRecommendation.patient?.lastName}
                                    </p>
                                    <p><strong>MRN:</strong> {selectedRecommendation.patient?.mrn}</p>
                                    <p><strong>Date of Birth:</strong> {selectedRecommendation.patient?.dateOfBirth}</p>
                                    <p>
                                        <strong>Insurance:</strong> {selectedRecommendation.patient?.insurancePolicyNumber}
                                    </p>
                                </div>

                                <div className="detail-section">
                                    <h4>Recommendation Details</h4>
                                    <p><strong>Description:</strong> {selectedRecommendation.description}</p>
                                    <p><strong>Justification:</strong> {selectedRecommendation.justification}</p>
                                    <p><strong>Status:</strong>
                                        <span
                                            className={`medical-badge ${getStatusBadge(selectedRecommendation.status)}`}>
                                            {selectedRecommendation.status}
                                        </span>
                                    </p>
                                    <p><strong>Created:</strong> {formatDate(selectedRecommendation.createdAt)}</p>
                                    <p><strong>Created by:</strong> {selectedRecommendation.createdBy}</p>
                                    {selectedRecommendation.updatedBy && (
                                        <p><strong>Updated by:</strong> {selectedRecommendation.updatedBy}</p>
                                    )}
                                    {selectedRecommendation.rejectionReason && (
                                        <p><strong>Rejection Reason:</strong> {selectedRecommendation.rejectionReason}
                                        </p>
                                    )}
                                    {selectedRecommendation.doctorComment && (
                                        <p><strong>Doctor Comment:</strong> {selectedRecommendation.doctorComment}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="medical-modal-footer">
                            {selectedRecommendation.status === RecommendationStatus.PENDING && (
                                <div className="modal-actions">
                                    <button
                                        onClick={() => handleApproveClick(selectedRecommendation)}
                                        className="medical-btn medical-btn-success"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectClick(selectedRecommendation)}
                                        className="medical-btn medical-btn-danger"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="medical-btn medical-btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* APPROVAL MODAL */}
            {isApprovalModalOpen && selectedRecommendation && (
                <div className="medical-modal-overlay" onClick={() => setIsApprovalModalOpen(false)}>
                    <div className="medical-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="medical-modal-header">
                            <h3>Approve Recommendation</h3>
                            <button
                                className="modal-close"
                                onClick={() => setIsApprovalModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="medical-modal-body">
                            <p>Are you sure you want to approve this recommendation?</p>
                            <div className="form-group">
                                <label htmlFor="approvalComment">Comment (optional):</label>
                                <textarea
                                    id="approvalComment"
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    placeholder="Add a comment about your approval..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="medical-modal-footer">
                            <button
                                onClick={handleApprove}
                                className="medical-btn medical-btn-success"
                            >
                                Confirm Approval
                            </button>
                            <button
                                onClick={() => setIsApprovalModalOpen(false)}
                                className="medical-btn medical-btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECT MODAL */}
            {isRejectModalOpen && selectedRecommendation && (
                <div className="medical-modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
                    <div className="medical-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="medical-modal-header">
                            <h3>Reject Recommendation</h3>
                            <button
                                className="modal-close"
                                onClick={() => setIsRejectModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="medical-modal-body">
                            <p>Are you sure you want to reject this recommendation?</p>
                            <div className="form-group">
                                <label htmlFor="rejectReason">Reason for rejection (required):</label>
                                <textarea
                                    id="rejectReason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this recommendation..."
                                    rows={3}
                                    required
                                />
                            </div>
                        </div>

                        <div className="medical-modal-footer">
                            <button
                                onClick={handleReject}
                                className="medical-btn medical-btn-danger"
                                disabled={!rejectReason.trim()}
                            >
                                Confirm Rejection
                            </button>
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="medical-btn medical-btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationsList;