import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useDeletePersonMutation, useGetPersonsQuery} from "../../api/api/apiAdminSlice.tsx";
import {PersonsList} from "../../exports/exports.ts";


const AdminPanel: React.FC = () => {
    const navigate = useNavigate();

    // State for delete confirmation
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // API hooks
    const [deletePerson, { isLoading: isDeleting }] = useDeletePersonMutation();
    const { data: persons, isLoading: isLoadingPersons, error: fetchError} = useGetPersonsQuery(undefined);

    const isLoading = isDeleting || isLoadingPersons;

    const handleDelete = async (personId: string) => {
        setUserToDelete(personId);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await deletePerson(userToDelete).unwrap();
                setIsDeleteConfirmOpen(false);
                setUserToDelete(null);
            } catch (error: unknown) {
                const err = error as { data?: { message?: string } };
                setError(err?.data?.message || 'Delete operation failed');
            }
        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h2>Admin Panel</h2>
                <button
                    onClick={() => navigate('/admin/create-person')}
                    className="approve-button"
                >
                    Add New Person
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Users List */}
            <div className="users-list-section">
                {isLoadingPersons ? (
                    <div className="loading-spinner">Loading users...</div>
                ) : fetchError ? (
                    <div className="error-message">Error loading users</div>
                ) : persons && persons.length > 0 ? (
                    <PersonsList
                        persons={persons}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="empty-state">
                        <p>No users found.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="modal-overlay">
                    <div className="modal modal-small">
                        <div className="medical-title">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="error-message">
                            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isLoading}
                                className="delete-button"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;