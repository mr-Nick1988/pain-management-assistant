import type {UserLogin} from "../types/userRegister.ts";
import React, {useState} from "react";
import {useLoginMutation} from "../features/api/apiSlice.ts";

const Login: React.FC = () => {
    const [formData, setFormData] = useState<UserLogin>({
        email: "",
        password: "",
    });

    const [login, {isLoading, error}] = useLoginMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(formData);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
            {error && <p>Error: {JSON.stringify(error)}</p>}
        </div>

    )
}

export default Login;
