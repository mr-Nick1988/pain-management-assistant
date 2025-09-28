import type {PersonRegister} from "../../types/personRegister.ts";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../ui";

interface PersonListProps {
    persons: PersonRegister[] | undefined;
    isLoading: boolean;
    onDelete?: (personId: string) => void;
}

const PersonsList: React.FC<PersonListProps> = ({persons, isLoading, onDelete}) => {
    const navigate = useNavigate();

    const handleEdit = (personId: string) => {
        navigate(`/admin/create-person?edit=${personId}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Persons List ({persons?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading persons...</span>
                    </div>
                ) : (
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
                                    {(onDelete) && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {persons?.map((person) => (
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
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {person.role}
                                            </span>
                                        </td>
                                        {(onDelete) && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button
                                                    onClick={() => handleEdit(person.personId)}
                                                    variant="update"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>
                                                {onDelete && (
                                                    <Button
                                                        onClick={() => onDelete(person.personId)}
                                                        variant="delete"
                                                        size="sm"
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PersonsList;