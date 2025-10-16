import React, {useMemo, useState} from "react";
import {type EscalationResponse, EscalationStatus, EscalationPriority} from "../../types/anesthesiologist.ts";
import {useApproveEscalationMutation, useRejectEscalationMutation} from "../../api/api/apiAnesthesiologistSlice.ts";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageNavigation } from "../ui";

interface EscalationListProps {
    escalations: EscalationResponse[];
    onEscalationSelect: (escalationId: number) => void;
}

const EscalationsList: React.FC<EscalationListProps> = ({escalations, onEscalationSelect}) => {
    const [filteredStatus, setFilteredStatus] = useState<EscalationStatus | "ALL">("ALL");
    const [filterPriority, setFilterPriority] = useState<EscalationPriority | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<"date" | "priority" | "status">("date");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedEscalation, setSelectedEscalation] = useState<EscalationResponse | null>(null);
    const [resolutionText, setResolutionText] = useState<string>("");
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const [approveEscalation, {isLoading: isApproving}] = useApproveEscalationMutation();
    const [rejectEscalation, {isLoading: isRejecting}] = useRejectEscalationMutation();

    const filteredAndSortedEscalations = useMemo(() => {
        const filteredEscalations = escalations.filter((escalation) => {
            const matchesStatus = filteredStatus === "ALL" || escalation.status === filteredStatus;
            const matchesPriority = filterPriority === "ALL" || escalation.priority === filterPriority;
            const matchesSearch = searchTerm === "" ||
                escalation.escalationReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                escalation.escalatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                escalation.id.toString().includes(searchTerm);
            return matchesStatus && matchesPriority && matchesSearch;
        });

        filteredEscalations.sort((a, b) => {
            switch (sortBy) {
                case "date": {
                    return new Date(b.escalatedAt).getTime() - new Date(a.escalatedAt).getTime();
                }
                case "priority": {
                    const priorityOrder = {"HIGH": 3, "MEDIUM": 2, "LOW": 1};
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                case "status": {
                    return b.status.localeCompare(a.status);
                }
                default:
                    return 0;
            }
        });
        return filteredEscalations;
    }, [escalations, filteredStatus, filterPriority, sortBy, searchTerm]);

    const handleApprove = async () => {
        if (!selectedEscalation || !resolutionText.trim()) return;
        try {
            const anesthesiologistId = localStorage.getItem("userPersonId") || "anesthesiologist_id";
            await approveEscalation({
                escalationId: selectedEscalation.id,
                resolution: {
                    resolvedBy: anesthesiologistId,
                    resolution: resolutionText,
                    approved: true
                }
            }).unwrap();
            setResolutionText("");
            setSelectedEscalation(null);
            setShowApproveModal(false);
        } catch (error) {
            console.error("Error approving escalation:", error);
        }
    };

    const handleReject = async () => {
        if (!selectedEscalation || !resolutionText.trim()) return;
        try {
            const anesthesiologistId = localStorage.getItem("userPersonId") || "anesthesiologist_id";
            await rejectEscalation({
                escalationId: selectedEscalation.id,
                resolution: {
                    resolvedBy: anesthesiologistId,
                    resolution: resolutionText,
                    approved: false
                }
            }).unwrap();
            setResolutionText("");
            setSelectedEscalation(null);
            setShowRejectModal(false);
        } catch (error) {
            console.error("Error rejecting escalation:", error);
        }
    };

    const getStatusBadgeClass = (status: EscalationStatus) => {
        const baseClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case EscalationStatus.PENDING:
                return `${baseClass} bg-yellow-100 text-yellow-800`;
            case EscalationStatus.IN_PROGRESS:
                return `${baseClass} bg-blue-100 text-blue-800`;
            case EscalationStatus.RESOLVED:
                return `${baseClass} bg-green-100 text-green-800`;
            default:
                return `${baseClass} bg-gray-100 text-gray-800`;
        }
    };

    const getPriorityBadgeClass = (priority: EscalationPriority) => {
        const baseClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
        switch (priority) {
            case EscalationPriority.HIGH:
                return `${baseClass} bg-red-100 text-red-800`;
            case EscalationPriority.MEDIUM:
                return `${baseClass} bg-orange-100 text-orange-800`;
            case EscalationPriority.LOW:
                return `${baseClass} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseClass} bg-gray-100 text-gray-800`;
        }
    };

    const getBorderClass = (priority: EscalationPriority) => {
        switch (priority) {
            case EscalationPriority.HIGH:
                return "border-red-300";
            case EscalationPriority.MEDIUM:
                return "border-orange-300";
            case EscalationPriority.LOW:
                return "border-yellow-300";
            default:
                return "border-gray-300";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card>
                <CardHeader>
                    <CardTitle>Escalations Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by patient, doctor, or reason..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="status-filter">Status</Label>
                                <select
                                    id="status-filter"
                                    value={filteredStatus}
                                    onChange={(e) => setFilteredStatus(e.target.value as EscalationStatus | "ALL")}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value={EscalationStatus.PENDING}>Pending</option>
                                    <option value={EscalationStatus.IN_PROGRESS}>In Progress</option>
                                    <option value={EscalationStatus.RESOLVED}>Resolved</option>
                                    <option value={EscalationStatus.CANCELLED}>Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="priority-filter">Priority</Label>
                                <select
                                    id="priority-filter"
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value as EscalationPriority | "ALL")}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All Priority</option>
                                    <option value={EscalationPriority.HIGH}>High</option>
                                    <option value={EscalationPriority.MEDIUM}>Medium</option>
                                    <option value={EscalationPriority.LOW}>Low</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="sort-by">Sort By</Label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "status")}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date">Date</option>
                                    <option value="priority">Priority</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedEscalations.map((escalation) => (
                            <Card key={escalation.id} className={`hover:shadow-lg transition-shadow ${getBorderClass(escalation.priority)}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">Escalation #{escalation.id}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">Recommendation: #{escalation.recommendationId}</p>
                                            <p className="text-sm text-gray-500">By: {escalation.escalatedBy}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className={getStatusBadgeClass(escalation.status)}>
                                                {escalation.status}
                                            </span>
                                            <span className={getPriorityBadgeClass(escalation.priority)}>
                                                {escalation.priority}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                <strong>Date:</strong> {new Date(escalation.escalatedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-2">
                                                <strong>Reason:</strong> {escalation.escalationReason}
                                            </p>
                                            {escalation.description && (
                                                <p className="text-sm text-gray-600 mt-1">{escalation.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2 pt-2">
                                            <Button
                                                onClick={() => onEscalationSelect(escalation.id)}
                                                variant="submit"
                                                size="sm"
                                                className="w-full"
                                            >
                                                View Details
                                            </Button>

                                            {(escalation.status === EscalationStatus.PENDING || escalation.status === EscalationStatus.IN_PROGRESS) && (
                                                <>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedEscalation(escalation);
                                                            setShowApproveModal(true);
                                                        }}
                                                        variant="approve"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedEscalation(escalation);
                                                            setShowRejectModal(true);
                                                        }}
                                                        variant="reject"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredAndSortedEscalations.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-gray-500">No escalations found matching your criteria.</p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {showApproveModal && selectedEscalation && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Approve Escalation</CardTitle>
                            <Button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedEscalation(null);
                                    setResolutionText("");
                                }}
                                variant="ghost"
                                size="sm"
                                className="absolute top-4 right-4"
                            >
                                ×
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="text-sm"><strong>Escalation ID:</strong> #{selectedEscalation.id}</p>
                                <p className="text-sm"><strong>Recommendation ID:</strong> #{selectedEscalation.recommendationId}</p>
                                <p className="text-sm"><strong>Escalated By:</strong> {selectedEscalation.escalatedBy}</p>
                                <p className="text-sm"><strong>Reason:</strong> {selectedEscalation.escalationReason}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="approve-resolution">Resolution Summary:</Label>
                                <textarea
                                    id="approve-resolution"
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={5}
                                    placeholder="Describe how this escalation was resolved and approved..."
                                />
                            </div>
                            <div className="flex space-x-3 justify-end pt-4">
                                <Button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setSelectedEscalation(null);
                                        setResolutionText("");
                                    }}
                                    variant="cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={!resolutionText.trim() || isApproving}
                                    variant="approve"
                                >
                                    {isApproving ? "Approving..." : "Approve Escalation"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showRejectModal && selectedEscalation && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Reject Escalation</CardTitle>
                            <Button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedEscalation(null);
                                    setResolutionText("");
                                }}
                                variant="ghost"
                                size="sm"
                                className="absolute top-4 right-4"
                            >
                                ×
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="text-sm"><strong>Escalation ID:</strong> #{selectedEscalation.id}</p>
                                <p className="text-sm"><strong>Recommendation ID:</strong> #{selectedEscalation.recommendationId}</p>
                                <p className="text-sm"><strong>Escalated By:</strong> {selectedEscalation.escalatedBy}</p>
                                <p className="text-sm"><strong>Reason:</strong> {selectedEscalation.escalationReason}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reject-resolution">Rejection Reason:</Label>
                                <textarea
                                    id="reject-resolution"
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={5}
                                    placeholder="Explain why this escalation is being rejected..."
                                />
                            </div>
                            <div className="flex space-x-3 justify-end pt-4">
                                <Button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedEscalation(null);
                                        setResolutionText("");
                                    }}
                                    variant="cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={!resolutionText.trim() || isRejecting}
                                    variant="reject"
                                >
                                    {isRejecting ? "Rejecting..." : "Reject Escalation"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        <PageNavigation />

        </div>
    );
};

export default EscalationsList;
