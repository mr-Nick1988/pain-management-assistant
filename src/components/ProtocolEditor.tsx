import React, {useEffect, useState} from "react";
import {type Protocol, ProtocolStatus} from "../types/anesthesiologist.ts";
import {
    useAddProtocolCommentMutation,
    useApproveProtocolMutation,
    useCreateProtocolMutation,
    useGetEscalationByIdQuery,
    useGetProtocolCommentsQuery,
    useGetProtocolsByEscalationQuery, useRejectProtocolMutation, useResolveEscalationMutation, useUpdateProtocolMutation
} from "../api/api/apiAnesthesiologistSlice.ts";


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
            <div className="protocol-editor-empty">
                <div className="empty-state">
                    <h3>No escalation selected</h3>
                    <p>Please select an escalation to view its protocols.</p>
                </div>
            </div>
        );
    }

    if (protocolsLoading) {
        return <div className="loading-container">Loading protocols...</div>
    }
    return (
        <div className="protocol-editor">
            <div className="protocol-editor-header">
                <div className="escalation-info">
                    {escalation && (
                        <>
                            <h2>Protocols for patient {escalation.patientId}</h2>
                            <p>Doctor: {escalation.doctorName}</p>
                            <p>Escalation reason: {escalation.rejectedReason}</p>
                        </>
                    )}
                </div>

                <div className="protocol-actions">
                    <button
                        onClick={startNewProtocol}
                        className="action-button-primary"
                        disabled={isEditing}
                    >
                        Create New Protocol
                    </button>

                    {activeProtocol && activeProtocol.status === ProtocolStatus.APPROVED && (
                        <button
                            onClick={() => setShowResolutionModal(true)}
                            className="btn btn-sucsess"
                        >
                            Complete Escalation
                        </button>
                    )}
                </div>
            </div>
            <div className="protocol-editor-content">
                {/*List of existing protocols*/}
                {protocols && protocols.length > 0 && (
                    <div className="protocol-sidebar">
                        <h3>Existing Protocols</h3>
                        <div className="protocol-list">
                            {protocols.map((protocol) => (
                                <div
                                    key={protocol.id}
                                    className={`protocol-item ${protocol.id === activeProtocol?.id ? "active" : ""}`}
                                    onClick={() => setActiveProtocol(protocol)}
                                >
                                    <h4>{protocol.title}</h4>
                                    <p>Version {protocol.version}</p>
                                    <span className={`status ${protocol.status.toLowerCase()}`}>
                                    {protocol.status}
                                </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/*Protocol Editor*/}
                <div className="protocol-main">
                    {isEditing ? (
                        <div className="protocol-form">
                            <h3>{activeProtocol ? "Edit Protocol" : "Create New Protocol"}</h3>

                            <div className="form-group">
                                <label htmlFor="protocol-title">Protocol Title:</label>
                                <input
                                    id="protocol-title"
                                    type="text"
                                    value={protocolTitle}
                                    onChange={(e) => setProtocolTitle(e.target.value)}
                                    placeholder="Enter protocol title"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="protocol-content">Protocol Content:</label>
                                <textarea
                                    id="protocol-content"
                                    value={protocolContent}
                                    onChange={(e) => setProtocolContent(e.target.value)}
                                    placeholder="Enter protocol content"
                                    rows={15}
                                    className="form-textarea protocol-textarea"
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    onClick={activeProtocol ? handleUpdateProtocol : handleCreateProtocol}
                                    disabled={!protocolTitle.trim() || !protocolContent.trim() || isCreating || isUpdating}
                                    className="btn btn-primary"
                                >
                                    {isCreating || isUpdating ? "Saving..." : activeProtocol ? "Update Protocol" : "Create Protocol"}
                                </button>

                                <button
                                    onClick={cancelEditing}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : activeProtocol ? (
                        <div className="protocol-view">
                            <div className="protocol-header">
                                <h3>{activeProtocol.title}</h3>
                                <div className="protocol-meta">
                                    <span>Version{activeProtocol.version}</span>
                                    <span className={`status ${activeProtocol.status.toLowerCase()}`}>
                                        {activeProtocol.status}
                                    </span>
                                    <span>{new Date(activeProtocol.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="protocol-content">
                                <pre>{activeProtocol.content}</pre>
                            </div>
                            <div className="protocol-actions">
                                {activeProtocol.status === ProtocolStatus.DRAFT && (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-primary"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={handleApproveProtocol}
                                            disabled={isApproving}
                                            className="btn btn-success"
                                        >
                                            {isApproving ? "Approving..." : "Approve"}
                                        </button>

                                        <button
                                            onClick={() => {
                                                const reason = prompt("Enter reason for rejecting protocol:");
                                                if (reason) handleRejectProtocol(reason);
                                            }}
                                            disabled={isRejecting}
                                            className="btn btn-danger"
                                        >
                                            {isRejecting ? "Rejecting..." : "Reject"}
                                        </button>
                                    </>
                                )}
                            </div>
                            {/*Comments*/}
                            <div className="protocol-comments">
                                <h4>Comments</h4>
                                <div className="add-comment">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment"
                                        rows={3}
                                        className="form-textarea"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!commentText.trim() || isAddingComment}
                                        className="btn btn-primary"
                                    >
                                        {isAddingComment ? "Adding..." : "Add Comment"}
                                    </button>
                                </div>

                                <div className="comments-list">
                                    {comments?.map((comment) => (
                                        <div key={comment.id} className="comment">
                                            <div className="comment-header">
                                                <strong>{comment.authorName}</strong>
                                                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="comment-content">
                                                {comment.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-protocol">
                            <p>Choose a protocol from list or create new protocol</p>
                        </div>
                    )}
                </div>
            </div>

            {/*Modal for escalation complete*/}

            {showResolutionModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Escalation Complete</h3>
                            <button
                                onClick={() => setShowResolutionModal(false)}
                                className="close-modal"
                            >
                                x
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-group">
                                <label htmlFor="resolution">Resolution</label>
                                <textarea
                                    id="resolution"
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Enter resolution"
                                    rows={5}
                                    className="form-textarea"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setShowResolutionModal(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolveEscalation}
                                disabled={!resolutionText.trim() || isResolving}
                                className="btn btn-success"
                            >
                                {isResolving ? "Resolving..." : "Resolve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ProtocolEditor;