import React, {useState} from "react";
import {
    useApproveRecommendationMutation,
    useGetRecommendationsQuery,
    useRejectRecommendationMutation
} from "../../api/api/apiDoctorSlice.ts";
import {type Recommendation, RecommendationStatus} from "../../types/recommendation.ts";
import {Button, Card, CardHeader, CardTitle, Textarea} from "../ui";


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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Recommendations Management</CardTitle>
                </CardHeader>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading recommendations...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <h3 className="font-semibold">Error loading recommendations</h3>
                    <p>{JSON.stringify(error)}</p>
                </div>
            )}

            {recommendations && recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((recommendation: Recommendation) => (
                        <div key={recommendation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="font-semibold">{recommendation.patient?.firstName} {recommendation.patient?.lastName}</h4>
                                    <p className="text-sm text-gray-600">MRN: {recommendation.patient?.mrn}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-sm font-medium ${recommendation.status === RecommendationStatus.APPROVED ? 'bg-green-100 text-green-800' : recommendation.status === RecommendationStatus.REJECTED ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {recommendation.status}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm">
                                    <strong>Description:</strong> {recommendation.description}
                                </p>
                                <p className="text-sm">
                                    <strong>Justification:</strong> {recommendation.justification}
                                </p>
                                <div className="text-sm text-gray-600">
                                    <span>Created: {formatDate(recommendation.createdAt)}</span>
                                    <span className="ml-4">By: {recommendation.createdBy}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleViewDetails(recommendation)}
                                >
                                    View Details
                                </Button>

                                {recommendation.status === RecommendationStatus.PENDING && (
                                    <>
                                        <Button
                                            variant="approve"
                                            onClick={() => handleApproveClick(recommendation)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="reject"
                                            onClick={() => handleRejectClick(recommendation)}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {recommendations && recommendations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-semibold">No recommendations found</h3>
                    <p>There are no recommendations to review at this time.</p>
                </div>
            )}

            {isDetailsModalOpen && selectedRecommendation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsDetailsModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Recommendation Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsDetailsModalOpen(false)}>×</Button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-lg font-semibold">Patient Information</h4>
                                    <p>
                                        <strong>Name:</strong> {selectedRecommendation.patient?.firstName} {selectedRecommendation.patient?.lastName}
                                    </p>
                                    <p><strong>MRN:</strong> {selectedRecommendation.patient?.mrn}</p>
                                    <p><strong>Date of Birth:</strong> {selectedRecommendation.patient?.dateOfBirth}</p>
                                    <p>
                                        <strong>Insurance:</strong> {selectedRecommendation.patient?.insurancePolicyNumber}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-lg font-semibold">Recommendation Details</h4>
                                    <p><strong>Description:</strong> {selectedRecommendation.description}</p>
                                    <p><strong>Justification:</strong> {selectedRecommendation.justification}</p>
                                    <p><strong>Status:</strong>
                                        <span className={`px-2 py-1 rounded text-sm font-medium ml-2 ${selectedRecommendation.status === RecommendationStatus.APPROVED ? 'bg-green-100 text-green-800' : selectedRecommendation.status === RecommendationStatus.REJECTED ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedRecommendation.status}
                                        </span>
                                    </p>
                                    <p><strong>Created:</strong> {formatDate(selectedRecommendation.createdAt)}</p>
                                    <p><strong>Created by:</strong> {selectedRecommendation.createdBy}</p>
                                    {selectedRecommendation.updatedBy && (
                                        <p><strong>Updated by:</strong> {selectedRecommendation.updatedBy}</p>
                                    )}
                                    {selectedRecommendation.rejectionReason && (
                                        <p><strong>Rejection Reason:</strong> {selectedRecommendation.rejectionReason}</p>
                                    )}
                                    {selectedRecommendation.doctorComment && (
                                        <p><strong>Doctor Comment:</strong> {selectedRecommendation.doctorComment}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            {selectedRecommendation.status === RecommendationStatus.PENDING && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="approve"
                                        onClick={() => handleApproveClick(selectedRecommendation)}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="reject"
                                        onClick={() => handleRejectClick(selectedRecommendation)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="secondary"
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isApprovalModalOpen && selectedRecommendation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsApprovalModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Approve Recommendation</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsApprovalModalOpen(false)}>×</Button>
                        </div>

                        <div className="p-4 space-y-4">
                            <p>Are you sure you want to approve this recommendation?</p>
                            <div className="space-y-2">
                                <label htmlFor="approvalComment" className="block text-sm font-medium">Comment (optional):</label>
                                <Textarea
                                    id="approvalComment"
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    placeholder="Add a comment about your approval..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button
                                variant="approve"
                                onClick={handleApprove}
                            >
                                Confirm Approval
                            </Button>
                            <Button
                                variant="cancel"
                                onClick={() => setIsApprovalModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isRejectModalOpen && selectedRecommendation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsRejectModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Reject Recommendation</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsRejectModalOpen(false)}>×</Button>
                        </div>

                        <div className="p-4 space-y-4">
                            <p>Are you sure you want to reject this recommendation?</p>
                            <div className="space-y-2">
                                <label htmlFor="rejectReason" className="block text-sm font-medium">Reason for rejection (required):</label>
                                <Textarea
                                    id="rejectReason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this recommendation..."
                                    rows={3}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button
                                variant="reject"
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                            >
                                Confirm Rejection
                            </Button>
                            <Button
                                variant="cancel"
                                onClick={() => setIsRejectModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationsList;