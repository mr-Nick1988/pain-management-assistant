import {useNavigate, useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {type PersonRegister, UserRole} from "../../types/personRegister.ts";
import {useCreatePersonMutation, useGetPersonsQuery, useUpdatePersonMutation} from "../../api/api/apiAdminSlice.tsx";

const CreatePerson: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const personId = searchParams.get('edit'); // For edit mode
    const isEditMode = Boolean(personId);

    const [formData, setFormData] = useState<PersonRegister>({
        firstName: "",
        lastName: "",
        login: "",
        password: "",
        role: UserRole.DOCTOR,
        personId: ""
    });

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // API hooks
    const [createPerson, { isLoading: isCreating }] = useCreatePersonMutation();
    const [updatePerson, { isLoading: isUpdating }] = useUpdatePersonMutation();
    const { data: allPersons, isLoading: isLoadingPersons } = useGetPersonsQuery(undefined);

    // Find person for editing from the list of all persons
    const personToEdit = allPersons?.find(p => p.personId === personId);

    const isLoading = isCreating || isUpdating || (isEditMode && isLoadingPersons);

    // Load person data for editing
    useEffect(() => {
        if (isEditMode && personToEdit) {
            setFormData({
                firstName: personToEdit.firstName,
                lastName: personToEdit.lastName,
                login: personToEdit.login,
                password: "", // Don't populate password for security
                role: personToEdit.role,
                personId: personToEdit.personId
            });
        }
    }, [personToEdit, isEditMode]);

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
                // Redirect back to admin panel after a short delay
                setTimeout(() => navigate('/admin'), 1500);
            } else {
                await createPerson(formData).unwrap();
                setSuccessMessage('User created successfully');
                // Reset form for creating another user
                setFormData({
                    firstName: "",
                    lastName: "",
                    login: "",
                    password: "",
                    role: UserRole.DOCTOR,
                    personId: ""
                });
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }};
            setError(err?.data?.message || 'An error occurred');
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    if (isEditMode && isLoadingPersons) {
        return <div className="loading">Loading person data...</div>;
    }

    return (
        <div className="create-person-page">
            <div className="admin-header">
                <h2>{isEditMode ? "Edit Person" : "Create New Person"}</h2>
                <button
                    onClick={() => navigate('/admin')}
                    className="cancel-button"
                >
                    Back to Admin Panel
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
                <div className="medical-subtitle">
                    {successMessage}
                    <button className="delete-button" onClick={clearMessages}>×</button>
                </div>
            )}

            {/* Form */}
            <div className="create-person-form">
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
                            disabled={isEditMode} // Don't allow editing personId in edit mode
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
                        <label htmlFor="password">
                            Password {isEditMode ? "(leave empty to keep current)" : ""}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!isEditMode}
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
                            <option value={UserRole.NURSE}>Nurse</option>
                            <option value={UserRole.DOCTOR}>Doctor</option>
                            <option value={UserRole.ANESTHESIOLOGIST}>Anesthesiologist</option>
                            <option value={UserRole.ADMIN}>Administrator</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="submit-button"
                        >
                            {isLoading ? "Processing..." : isEditMode ? "Update User" : "Create Person"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePerson;