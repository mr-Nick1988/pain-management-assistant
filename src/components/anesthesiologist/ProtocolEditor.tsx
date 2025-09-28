import React, {useEffect, useState} from "react";
import {type Protocol, ProtocolStatus} from "../../types/anesthesiologist.ts";
import {
    useAddProtocolCommentMutation,
    useApproveProtocolMutation,
    useCreateProtocolMutation,
    useGetEscalationByIdQuery,
    useGetProtocolCommentsQuery,
    useGetProtocolsByEscalationQuery, useRejectProtocolMutation, useResolveEscalationMutation, useUpdateProtocolMutation
} from "../../api/api/apiAnesthesiologistSlice.ts";


interface ProtocolEditorProps {
    selectedEscalationId: string | null;
}

const ProtocolEditor: React.FC<ProtocolEditorProps> = ({selectedEscalationId}) => {
    const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [protocolTitle, setProtocolTitle] = useState("");
    const [protocolContent, setProtocolContent] = useState("");
    const [commentText, setCommentText] = useState("");
    const [resolutionText, setResolutionText] = useState("");
    const [showResolutionModal, setShowResolutionModal] = useState(false);

    //API HOOKS
    const {data: escalation} = useGetEscalationByIdQuery(selectedEscalationId!, {skip: !selectedEscalationId});
    const {
        data: protocols,
        isLoading: protocolsLoading
    } = useGetProtocolsByEscalationQuery(selectedEscalationId!, {skip: !selectedEscalationId});
    const {data: comments} = useGetProtocolCommentsQuery(activeProtocol?.id ?? "", {skip: !activeProtocol?.id});
    const [createProtocol, {isLoading: isCreating}] = useCreateProtocolMutation();
    const [updateProtocol, {isLoading: isUpdating}] = useUpdateProtocolMutation();
    const [approveProtocol, {isLoading: isApproving}] = useApproveProtocolMutation();
    const [rejectProtocol, {isLoading: isRejecting}] = useRejectProtocolMutation();
    const [addComment, {isLoading: isAddingComment}] = useAddProtocolCommentMutation();
    const [resolveEscalation, {isLoading: isResolving}] = useResolveEscalationMutation();

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
    const handleUpdateProtocol = async () => {
        if (!activeProtocol) return;
        try {
            const updatedProtocol = await updateProtocol({
                id: activeProtocol.id,
                title: protocolTitle,
                content: protocolContent,
            }).unwrap();
            setActiveProtocol(updatedProtocol);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating protocol:", error);
        }
    };
    const handleApproveProtocol = async () => {
        if (!activeProtocol) return;

        try {
            await approveProtocol(activeProtocol.id).unwrap();
        } catch (error) {
            console.error("Error approving protocol:", error);
        }
    };
    const handleRejectProtocol = async (reason: string) => {
        if (!activeProtocol) return;
        try {
            await rejectProtocol({protocolId: activeProtocol.id, reason}).unwrap();
        } catch (error) {
            console.error("Error rejecting protocol:", error);
        }
    }
    const handleAddComment = async () => {
        if (!activeProtocol || !commentText.trim()) return;
        try {
            await addComment({
                protocolId: activeProtocol.id,
                content: commentText,
                isQuestion: false,
            }).unwrap();
            setCommentText("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    }
    const handleResolveEscalation = async () => {
        if (!selectedEscalationId || !resolutionText.trim()) return;
        try {
            await resolveEscalation({
                escalationId: selectedEscalationId,
                resolution: resolutionText,
            }).unwrap();
            setShowResolutionModal(false);
            setResolutionText("");
        } catch (error) {
            console.error("Error resolving escalation:", error);
        }
    }

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
            <div className="protocol-editor-container empty-view">
                <div className="empty-state">
                    <h3 className="section-title">No Escalation Selected</h3>
                    <p>Please select an escalation from the list to view or manage its protocols.</p>
                </div>
            </div>
        );
    }

    if (protocolsLoading) {
        return <div className="loading">Loading protocols...</div>
    }
    return (
        <div className="protocol-editor-container">
            <div className="protocol-editor-header">
                {escalation && (
                    <div className="escalation-details-header">
                        <h2 className="section-title">Protocols for: {escalation.patientName}</h2>
                        <p className="medical-subtitle">Managing escalation from Dr. {escalation.doctorName}</p>
                    </div>
                )}
                <div className="form-actions">
                    <button
                        onClick={startNewProtocol}
                        className="submit-button"
                        disabled={isEditing}
                    >
                        Create New Protocol
                    </button>
                    {activeProtocol && activeProtocol.status === ProtocolStatus.APPROVED && (
                        <button
                            onClick={() => setShowResolutionModal(true)}
                            className="approve-button"
                        >
                            Complete Escalation
                        </button>
                    )}
                </div>
            </div>

            <div className="protocol-editor-layout">
                <aside className="protocol-sidebar">
                    <h3 className="sidebar-title">Existing Protocols</h3>
                    <div className="protocol-list">
                        {protocols && protocols.length > 0 ? (
                            protocols.map((protocol) => (
                                <div
                                    key={protocol.id}
                                    className={`protocol-item ${protocol.id === activeProtocol?.id ? "active" : ""}`}
                                    onClick={() => setActiveProtocol(protocol)}
                                >
                                    <div className="item-header">
                                        <h4>{protocol.title}</h4>
                                        <span className={`status-badge status-${protocol.status.toLowerCase()}`}>
                                            {protocol.status}
                                        </span>
                                    </div>
                                    <p className="item-details">Version {protocol.version}</p>
                                </div>
                            ))
                        ) : (
                            <p className="empty-sidebar-text">No protocols yet.</p>
                        )}
                    </div>
                </aside>

                <main className="protocol-main-content">
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
                                <button onClick={cancelEditing} className="cancel-button">
                                    Cancel
                                </button>
                                <button
                                    onClick={activeProtocol ? handleUpdateProtocol : handleCreateProtocol}
                                    disabled={!protocolTitle.trim() || !protocolContent.trim() || isCreating || isUpdating}
                                    className="submit-button"
                                >
                                    {isCreating || isUpdating ? "Saving..." : "Save Protocol"}
                                </button>
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
                                    <button
                                        onClick={() => {
                                            const reason = prompt("Enter reason for rejecting protocol:");
                                            if (reason) handleRejectProtocol(reason);
                                        }}
                                        disabled={isRejecting}
                                        className="reject-button"
                                    >
                                        {isRejecting ? "Rejecting..." : "Reject"}
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="update-button">
                                        Edit
                                    </button>
                                    <button onClick={handleApproveProtocol} disabled={isApproving} className="approve-button">
                                        {isApproving ? "Approving..." : "Approve"}
                                    </button>
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
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!commentText.trim() || isAddingComment}
                                        className="submit-button"
                                    >
                                        {isAddingComment ? "Adding..." : "Add Comment"}
                                    </button>
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
                </main>
            </div>

            {showResolutionModal && (
                <div className="anesthesiologist-modal-overlay">
                    <div className="resolution-modal">
                        <div className="add-patient-modal-header">
                            <h3>Complete Escalation</h3>
                            <button onClick={() => setShowResolutionModal(false)} className="close-button">
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="resolution">Final Resolution Summary</label>
                                <textarea
                                    id="resolution"
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Summarize the final resolution for this escalation..."
                                    rows={5}
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setShowResolutionModal(false)} className="cancel-button">
                                Cancel
                            </button>
                            <button
                                onClick={handleResolveEscalation}
                                disabled={!resolutionText.trim() || isResolving}
                                className="approve-button"
                            >
                                {isResolving ? "Resolving..." : "Resolve Escalation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ProtocolEditor;