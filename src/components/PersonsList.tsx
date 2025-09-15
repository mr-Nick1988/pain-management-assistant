import type {PersonRegister} from "../types/personRegister.ts";
import React from "react";

interface PersonListProps {
    persons: PersonRegister[] | undefined;
    isLoading: boolean;
    onEdit?: (person: PersonRegister) => void;
    onDelete?: (personId: string) => void;
}

const PersonsList: React.FC<PersonListProps> = ({persons, isLoading, onEdit, onDelete}) => {
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
                        {(onEdit || onDelete) && <th>Actions</th>}
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
                            {(onEdit || onDelete) && (
                                <td>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(person)}
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
                                    )}
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