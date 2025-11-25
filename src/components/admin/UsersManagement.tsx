import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useDeletePersonMutation, useGetPersonsQuery} from "../../api/api/apiAdminSlice.ts";
import { Button, Card, CardContent, CardHeader, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, ErrorMessage, LoadingSpinner , PageNavigation } from "../ui";
import { Users as UsersIcon, UserPlus, ArrowLeft } from "lucide-react";

/**
 * Компонент управления сотрудниками больницы
 * Отображает список врачей, медсестер, анестезиологов и админов
 */
const UsersManagement: React.FC = () => {
    const navigate = useNavigate();

    // State для подтверждения удаления
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // API hooks
    const [deletePerson, { isLoading: isDeleting }] = useDeletePersonMutation();
    const { data: persons, isLoading: isLoadingPersons, error: fetchError} = useGetPersonsQuery(undefined);

    const isLoading = isDeleting || isLoadingPersons;

    /**
     * Открыть модальное окно подтверждения удаления
     */
    const handleDelete = async (personId: string) => {
        setUserToDelete(personId);
        setIsDeleteConfirmOpen(true);
    };

    /**
     * Подтвердить удаление пользователя
     */
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

    /**
     * Редактировать пользователя
     */
    const handleEdit = (personId: string) => {
        navigate(`/admin/create-person?edit=${personId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Employee Management</h1>
                            <p className="text-blue-100">Manage hospital staff and permissions</p>
                        </div>
                        <div className="text-4xl sm:text-5xl"><UsersIcon className="w-10 h-10"/></div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={() => navigate('/admin/create-person')}
                    variant="approve"
                    className="flex-1 sm:flex-none"
                >
                    <UserPlus className="w-4 h-4 mr-2"/> Add New Employee
                </Button>
                <Button
                    onClick={() => navigate('/admin')}
                    variant="cancel"
                    className="flex-1 sm:flex-none"
                >
                    <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
                </Button>
            </div>

            {/* Messages */}
            {error && (
                <ErrorMessage message={error} onClose={() => setError(null)} />
            )}
            {fetchError && (
                <ErrorMessage message="Error loading employees" onClose={() => {}} />
            )}

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>Hospital Employees ({persons?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPersons ? (
                        <LoadingSpinner message="Loading employees..." />
                    ) : persons && persons.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            First Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Login
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {persons.map((person) => (
                                        <tr key={person.personId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {person.personId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {person.firstName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {person.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {person.login}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    person.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    person.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' :
                                                    person.role === 'NURSE' ? 'bg-green-100 text-green-800' :
                                                    person.role === 'ANESTHESIOLOGIST' ? 'bg-pink-100 text-pink-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {person.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button
                                                    onClick={() => handleEdit(person.personId)}
                                                    variant="submit"
                                                    className="text-xs"
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(person.personId)}
                                                    variant="delete"
                                                    className="text-xs"
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mb-4 flex justify-center"><UsersIcon className="w-12 h-12 text-gray-500"/></div>
                            <p className="text-gray-600 mb-4">No employees found</p>
                            <Button
                                onClick={() => navigate('/admin/create-person')}
                                variant="approve"
                            >
                                Create First Employee
                            </Button>
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
                        Are you sure you want to delete this employee? This action cannot be undone.
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
        <PageNavigation />

        </div>
    );
};

export default UsersManagement;
