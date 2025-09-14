import React, {useState} from "react";
import {type PersonRegister, UserRole} from "../types/personRegister.ts";
import {
    useCreatePersonMutation,
    useGetPersonsQuery,
    useDeletePersonMutation,
    useUpdatePersonMutation
} from "../features/api/apiAdminSlice.ts";
import {PersonsList} from "../exports/exports.ts";


const AdminPanel: React.FC = () => {
    const [formData, setFormData] = useState<PersonRegister>({
        firstName: "",
        lastName: "",
        login: "",
        password: "",
        role: UserRole.NURSE,
        personId: "" // Изменено с id на personId
    });
    const [isEditing, setIsEditing] = useState(false);

    const [createPerson, {isLoading: isCreating, error: createError}] = useCreatePersonMutation();
    const [updatePerson, {isLoading: isUpdating, error: updateError}] = useUpdatePersonMutation();
    const [deletePerson, {isLoading: isDeleting, error: deleteError}] = useDeletePersonMutation();
    const {data: persons, isLoading: isLoadingPersons} = useGetPersonsQuery(undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            await updatePerson(formData);
            setIsEditing(false);
        } else {
            await createPerson(formData);
        }

        resetForm();
    };

    const handleEdit = (person: PersonRegister) => {
        setFormData(person);
        setIsEditing(true);
    };

    const handleDelete = async (personId: string) => {
        if (window.confirm("Are you sure you want to delete this person?")) {
            await deletePerson(personId);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            login: "",
            password: "",
            role: UserRole.NURSE,
            personId: "" // Изменено с id на personId
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        resetForm();
    };

    const isLoading = isCreating || isUpdating || isDeleting;
    const error = createError || updateError || deleteError;

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>

            <div className="create-person-section">
                <h3>{isEditing ? "Edit Person" : "Create New Person"}</h3>
                <form onSubmit={handleSubmit}>
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

                    <div className="form-group">
                        <label htmlFor="login">Temporary Login</label>
                        <input
                            id="login"
                            name="login"
                            placeholder="Temporary Login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Temporary Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Temporary Password"
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
                            <option value={UserRole.NURSE}>Nurse</option>
                            <option value={UserRole.DOCTOR}>Doctor</option>
                            <option value={UserRole.ANESTHESIOLOGIST}>Anesthesiologist</option>
                            <option value={UserRole.ADMIN}>Administrator</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Processing..." : isEditing ? "Update Person" : "Create Person"}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={cancelEdit}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {error && <p className="error-message">Error: {JSON.stringify(error)}</p>}
            </div>

            <div className="persons-list-section">
                <h3>Persons List</h3>
                {isLoadingPersons ? (
                    <p>Loading persons...</p>
                ) : persons && persons.length > 0 ? (
                    <PersonsList
                        persons={persons}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoadingPersons}
                    />
                ) : (
                    <p>No persons found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;