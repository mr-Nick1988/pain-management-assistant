import type {PersonRegister} from "../../types/personRegister.ts";
import React from "react";
import { useNavigate } from "react-router-dom";

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
        <div className="persons-list-section">
            <h3>Persons List</h3>
            {isLoading ? (
                <p>Loading persons...</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Login</th>
                        <th>Role</th>
                        {(onDelete) && <th>Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {persons?.map((person) => (
                        <tr key={person.personId}>
                            <td>{person.personId}</td>
                            <td>{person.firstName}</td>
                            <td>{person.lastName}</td>
                            <td>{person.login}</td>
                            <td>{person.role}</td>
                            {(onDelete) && (
                                <td>
                                    <button
                                        onClick={() => handleEdit(person.personId)}
                                        className="edit-button"
                                    >
                                        Edit
                                    </button>
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(person.personId)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PersonsList;