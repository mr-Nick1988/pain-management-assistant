import React, {useState} from "react";
import {type UserRegister, UserRole} from "../types/userRegister.ts";
import {useCreateUserMutation, useGetUsersQuery} from "../features/api/apiSlice.ts";


const AdminPanel: React.FC = () => {
    const [formData, setFormData] = useState<UserRegister>({
        firstName: "",
        lastName: "",
        login: "",
        password: "",
        id: "",
        role: UserRole.NURSE,
    });

    const [createUser, {isLoading, error}] = useCreateUserMutation();
    const {data: users, isLoading: isLoadingUsers} = useGetUsersQuery(undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createUser(formData);
        setFormData({
            firstName: "",
            lastName: "",
            login: "",
            password: "",
            id: "",
            role: UserRole.NURSE,
        });
    }

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>

            <div className="create-user-section">
                <h3>Create New Person</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="id">ID:</label>
                        <input
                            id="id"
                            name="id"
                            placeholder="ID"
                            value={formData.id}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name:</label>
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
                        <label htmlFor="lastName">Last Name:</label>
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
                        <label htmlFor="login">Temporary Login:</label>
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
                        <label htmlFor="password">Temporary Password:</label>
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
                        <label htmlFor="role">Role:</label>
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

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Person"}
                    </button>
                </form>
                {error && <p className="error">Error: {JSON.stringify(error)}</p>}
            </div>

            <div className="users-list-section">
                <h3>Users List</h3>
                {isLoadingUsers ? (
                    <p>Loading users...</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Login</th>
                            <th>Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users?.map((user: UserRegister) => (
                            <tr key={user.id}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.login}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;