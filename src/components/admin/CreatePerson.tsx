import {useNavigate, useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {type PersonRegister, UserRole} from "../../types/personRegister.ts";
import {useCreatePersonMutation, useGetPersonsQuery, useUpdatePersonMutation} from "../../api/api/apiAdminSlice.tsx";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "../ui";

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
            const err = error as { data?: { message?: string } };
            setError(err?.data?.message || 'An error occurred');
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    if (isEditMode && isLoadingPersons) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading person data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>{isEditMode ? "Edit Person" : "Create New Person"}</CardTitle>
                    <Button
                        onClick={() => navigate('/admin')}
                        variant="cancel"
                        className="w-full sm:w-auto"
                    >
                        Back to Admin Panel
                    </Button>
                </CardHeader>

                <CardContent>
                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                            {error}
                            <button
                                onClick={clearMessages}
                                className="float-right ml-4 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                            {successMessage}
                            <button
                                onClick={clearMessages}
                                className="float-right ml-4 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="personId">Document ID</Label>
                                <Input
                                    id="personId"
                                    name="personId"
                                    placeholder="Document ID"
                                    value={formData.personId}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditMode} // Don't allow editing personId in edit mode
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login">Login</Label>
                                <Input
                                    id="login"
                                    name="login"
                                    placeholder="Login"
                                    value={formData.login}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password {isEditMode ? "(leave empty to keep current)" : ""}
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditMode}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value={UserRole.NURSE}>Nurse</option>
                                    <option value={UserRole.DOCTOR}>Doctor</option>
                                    <option value={UserRole.ANESTHESIOLOGIST}>Anesthesiologist</option>
                                    <option value={UserRole.ADMIN}>Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                            <Button
                                type="button"
                                onClick={() => navigate('/admin')}
                                variant="cancel"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant="submit"
                                className="flex-1"
                            >
                                {isLoading ? "Processing..." : isEditMode ? "Update User" : "Create Person"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreatePerson;