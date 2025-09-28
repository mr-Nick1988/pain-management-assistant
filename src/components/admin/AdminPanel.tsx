import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useDeletePersonMutation, useGetPersonsQuery} from "../../api/api/apiAdminSlice.tsx";
import {PersonsList} from "../../exports/exports.ts";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../ui";

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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Admin Panel</CardTitle>
                    <Button
                        onClick={() => navigate('/admin/create-person')}
                        variant="approve"
                        className="w-full sm:w-auto"
                    >
                        Add New Person
                    </Button>
                </CardHeader>

                {/* Messages */}
                {error && (
                    <CardContent>
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="float-right ml-4 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </CardContent>
                )}

                {/* Users List */}
                <CardContent>
                    {isLoadingPersons ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading users...</span>
                        </div>
                    ) : fetchError ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            Error loading users
                        </div>
                    ) : persons && persons.length > 0 ? (
                        <PersonsList
                            persons={persons}
                            onDelete={handleDelete}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No users found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600">Confirm Delete</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3 justify-end">
                                <Button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    variant="cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                    variant="delete"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;