import React, {useEffect, useState} from "react";
import {type ProtocolResponse, ProtocolStatus} from "../../types/anesthesiologist.ts";
import {
    useAddCommentMutation,
    useApproveProtocolMutation,
    useCreateProtocolMutation,
    useGetCommentsByProtocolQuery,
    useGetProtocolsByEscalationQuery,
    useRejectProtocolMutation
} from "../../api/api/apiAnesthesiologistSlice.ts";
import {Button, Card, CardContent, CardHeader, CardTitle} from "../ui";


interface ProtocolEditorProps {
    selectedEscalationId: number | null;
}

const ProtocolEditor: React.FC<ProtocolEditorProps> = ({selectedEscalationId}) => {
    const [activeProtocol, setActiveProtocol] = useState<ProtocolResponse | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [protocolTitle, setProtocolTitle] = useState("");
    const [protocolContent, setProtocolContent] = useState("");
    const [commentText, setCommentText] = useState("");

    //API HOOKS
    const {
        data: protocols,
        isLoading: protocolsLoading
    } = useGetProtocolsByEscalationQuery(selectedEscalationId!, {skip: !selectedEscalationId});
    const {data: comments} = useGetCommentsByProtocolQuery(activeProtocol?.id ?? 0, {skip: !activeProtocol?.id});
    const [createProtocol, {isLoading: isCreating}] = useCreateProtocolMutation();
    const [approveProtocol, {isLoading: isApproving}] = useApproveProtocolMutation();
    const [rejectProtocol, {isLoading: isRejecting}] = useRejectProtocolMutation();
    const [addComment, {isLoading: isAddingComment}] = useAddCommentMutation();

    useEffect(() => {
        if (selectedEscalationId) {
            setActiveProtocol(null);
            setIsEditing(false);
            setProtocolTitle("");
            setProtocolContent("");
        }
    }, [selectedEscalationId]);

    useEffect(() => {
        if (protocols && protocols.length > 0 && !activeProtocol) {
            setActiveProtocol(protocols[0]);
        }
    }, [protocols, activeProtocol]);

    useEffect(() => {
        if (activeProtocol && isEditing) {
            setProtocolTitle(activeProtocol.title);
            setProtocolContent(activeProtocol.content);
        }
    }, [activeProtocol, isEditing]);

    const handleCreateProtocol = async () => {
        if (!selectedEscalationId || !protocolTitle.trim() || !protocolContent.trim()) return;
        try {
            const newProtocol = await createProtocol({
                escalationId: selectedEscalationId,
                title: protocolTitle,
                content: protocolContent,
            }).unwrap();

            setActiveProtocol(newProtocol);
            setIsEditing(false);
            setProtocolTitle("");
            setProtocolContent("");
        } catch (error) {
            console.error("Error creating protocol:", error);
        }
    };

    const handleApproveProtocol = async () => {
        if (!activeProtocol) return;
        try {
            const anesthesiologistId = localStorage.getItem("userPersonId") || "anesthesiologist_id";
            await approveProtocol({
                protocolId: activeProtocol.id,
                approvedBy: anesthesiologistId
            }).unwrap();
        } catch (error) {
            console.error("Error approving protocol:", error);
        }
    };

    const handleRejectProtocol = async (reason: string) => {
        if (!activeProtocol) return;
        try {
            const anesthesiologistId = localStorage.getItem("userPersonId") || "anesthesiologist_id";
            await rejectProtocol({
                protocolId: activeProtocol.id,
                rejectedReason: reason,
                rejectedBy: anesthesiologistId
            }).unwrap();
        } catch (error) {
            console.error("Error rejecting protocol:", error);
        }
    };

    const handleAddComment = async () => {
        if (!activeProtocol || !commentText.trim()) return;
        try {
            await addComment({
                protocolId: activeProtocol.id,
                content: commentText,
            }).unwrap();
            setCommentText("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const startNewProtocol = () => {
        setActiveProtocol(null);
        setIsEditing(true);
        setProtocolTitle("");
        setProtocolContent("");
    }

    const cancelEditing = () => {
        setIsEditing(false);
        setProtocolTitle("");
        setProtocolContent("");
    }


    if (!selectedEscalationId) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-500">Please select an escalation from the list to view or manage its protocols.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (protocolsLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading protocols...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <CardTitle className="text-xl">Protocol Management</CardTitle>
                            <p className="text-gray-600 mt-1">Escalation ID: #{selectedEscalationId}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={startNewProtocol}
                                variant="submit"
                                disabled={isEditing}
                            >
                                Create New Protocol
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar with Protocols List */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Existing Protocols</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {protocols && protocols.length > 0 ? (
                                            protocols.map((protocol) => (
                                                <div
                                                    key={protocol.id}
                                                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                                                        activeProtocol?.id === protocol.id
                                                            ? 'bg-blue-50 border-blue-300'
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => setActiveProtocol(protocol)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-gray-900 truncate">{protocol.title}</h4>
                                                            <p className={`text-xs mt-1 ${
                                                                protocol.status === 'DRAFT' ? 'text-gray-500' :
                                                                protocol.status === 'APPROVED' ? 'text-green-600' :
                                                                protocol.status === 'REJECTED' ? 'text-red-600' :
                                                                'text-blue-600'
                                                            }`}>
                                                                {protocol.status}
                                                            </p>
                                                        </div>
                                                        {activeProtocol?.id === protocol.id && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 text-sm">No protocols yet</p>
                                                <Button
                                                    onClick={startNewProtocol}
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    disabled={isEditing}
                                                >
                                                    Create First Protocol
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {isEditing ? (
                                <div className="protocol-form">
                                    <h3 className="section-title">{activeProtocol ? "Edit Protocol" : "Create New Protocol"}</h3>
                                    <div className="form-group">
                                        <label htmlFor="protocol-title">Title</label>
                                        <input
                                            id="protocol-title"
                                            type="text"
                                            value={protocolTitle}
                                            onChange={(e) => setProtocolTitle(e.target.value)}
                                            placeholder="Enter protocol title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="protocol-content">Content</label>
                                        <textarea
                                            id="protocol-content"
                                            value={protocolContent}
                                            onChange={(e) => setProtocolContent(e.target.value)}
                                            placeholder="Enter protocol content in markdown..."
                                            rows={15}
                                            className="protocol-textarea"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <Button onClick={cancelEditing} variant="cancel">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateProtocol}
                                            disabled={!protocolTitle.trim() || !protocolContent.trim() || isCreating}
                                            variant="submit"
                                        >
                                            {isCreating ? "Saving..." : "Save Protocol"}
                                        </Button>
                                    </div>
                                </div>
                            ) : activeProtocol ? (
                                <div className="protocol-view">
                                    <div className="protocol-view-header">
                                        <h3>{activeProtocol.title}</h3>
                                        <div className="protocol-meta">
                                            <span className="meta-item">Version {activeProtocol.version}</span>
                                            <span className={`status-badge status-${activeProtocol.status.toLowerCase()}`}>
                                                {activeProtocol.status}
                                            </span>
                                            <span className="meta-item">{new Date(activeProtocol.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="protocol-content-display">
                                        <pre>{activeProtocol.content}</pre>
                                    </div>

                                    {activeProtocol.status === ProtocolStatus.DRAFT && (
                                        <div className="form-actions protocol-view-actions">
                                            <Button
                                                onClick={() => {
                                                    const reason = prompt("Enter reason for rejecting protocol:");
                                                    if (reason) handleRejectProtocol(reason);
                                                }}
                                                disabled={isRejecting}
                                                variant="reject"
                                            >
                                                {isRejecting ? "Rejecting..." : "Reject"}
                                            </Button>
                                            <Button onClick={() => setIsEditing(true)} variant="update">
                                                Edit
                                            </Button>
                                            <Button onClick={handleApproveProtocol} disabled={isApproving} variant="approve">
                                                {isApproving ? "Approving..." : "Approve"}
                                            </Button>
                                        </div>
                                    )}

                                    <div className="protocol-comments">
                                        <h4 className="section-title">Comments</h4>
                                        <div className="add-comment-form">
                                            <div className="form-group">
                                                <textarea
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add a comment or ask a question..."
                                                    rows={3}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleAddComment}
                                                disabled={!commentText.trim() || isAddingComment}
                                                variant="submit"
                                            >
                                                {isAddingComment ? "Adding..." : "Add Comment"}
                                            </Button>
                                        </div>
                                        <div className="comments-list">
                                            {comments?.map((comment) => (
                                                <div key={comment.id} className="comment-item">
                                                    <div className="comment-header">
                                                        <strong>{comment.authorName}</strong>
                                                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <p>{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <h3 className="section-title">No Protocol Selected</h3>
                                    <p>Please select a protocol from the list on the left, or create a new one.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default ProtocolEditor;