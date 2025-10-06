import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useDeletePersonMutation, useGetPersonsQuery} from "../../api/api/apiAdminSlice.ts";
import {PersonsList} from "../../exports/exports.ts";
import { Button, Card, CardContent, CardHeader, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, ErrorMessage, LoadingSpinner } from "../ui";

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
                        <ErrorMessage message={error} onClose={() => setError(null)} />
                    </CardContent>
                )}

                {/* Users List */}
                <CardContent>
                    {isLoadingPersons ? (
                        <LoadingSpinner message="Loading users..." />
                    ) : fetchError ? (
                        <ErrorMessage message="Error loading users" />
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
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} className="max-w-md">
                <ModalHeader>
                    <h3 className="text-xl font-bold text-red-600">Confirm Delete</h3>
                </ModalHeader>
                <ModalBody>
                    <p className="text-gray-700">
                        Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
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
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AdminPanel;