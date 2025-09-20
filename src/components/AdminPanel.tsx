import React, { useState } from "react";
import { type PersonRegister, UserRole } from "../types/personRegister.ts";
import {
    useCreatePersonMutation,
    useGetPersonsQuery,
    useDeletePersonMutation,
    useUpdatePersonMutation
} from "../api/api/apiAdminSlice.ts";
import { PersonsList } from "../exports/exports.ts";

const AdminPanel: React.FC = () => {
    const [formData, setFormData] = useState<PersonRegister>({
        firstName: "",
        lastName: "",
        login: "",
        password: "",
        role: UserRole.DOCTOR,
        personId: ""
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // API hooks
    const [createPerson, { isLoading: isCreating }] = useCreatePersonMutation();
    const [updatePerson, { isLoading: isUpdating }] = useUpdatePersonMutation();
    const [deletePerson, { isLoading: isDeleting }] = useDeletePersonMutation();
    const { data: persons, isLoading: isLoadingPersons, error: fetchError } = useGetPersonsQuery(undefined);

    const isLoading = isCreating || isUpdating || isDeleting || isLoadingPersons;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            if (isEditMode) {
                await updatePerson(formData).unwrap();
                setSuccessMessage('User updated successfully');
            } else {
                await createPerson(formData).unwrap();
                setSuccessMessage('User created successfully');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            setError(err?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (person: PersonRegister) => {
        setFormData(person);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (personId: string) => {
        setUserToDelete(personId);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await deletePerson(userToDelete).unwrap();
                setSuccessMessage('User deleted successfully');
                setIsDeleteConfirmOpen(false);
                setUserToDelete(null);
            } catch (error: unknown) {
                const err = error as { data?: { message?: string } };
                setError(err?.data?.message || 'Delete failed');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            login: "",
            password: "",
            role: UserRole.DOCTOR,
            personId: ""
        });
        setIsEditMode(false);
    };

    const openAddUserModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h2>Admin Panel</h2>
                <button
                    onClick={openAddUserModal}
                    className="btn btn-primary"
                >
                    Add New User
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={clearMessages}>×</button>
                </div>
            )}
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                    <button onClick={clearMessages}>×</button>
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
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="empty-state">
                        <p>No users found.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{isEditMode ? "Edit User" : "Create New User"}</h3>
                            <button
                                onClick={closeModal}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="personId">Document ID</label>
                                <input
                                    id="personId"
                                    name="personId"
                                    placeholder="Document ID"
                                    value={formData.personId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="login">Login</label>
                                <input
                                    id="login"
                                    name="login"
                                    placeholder="Login"
                                    value={formData.login}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value={UserRole.DOCTOR}>Doctor</option>
                                    <option value={UserRole.ANESTHESIOLOGIST}>Anesthesiologist</option>
                                    <option value={UserRole.ADMIN}>Administrator</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary"
                                >
                                    {isLoading ? "Processing..." : isEditMode ? "Update User" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="modal-overlay">
                    <div className="modal modal-small">
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isLoading}
                                className="btn btn-danger"
                            >
                                {isLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;