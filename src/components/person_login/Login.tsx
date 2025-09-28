import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../api/api/apiPersonSlice.ts";
import {UserRole} from "../../types/personRegister.ts";

interface LoginResponse {
    firstName: string;
    role: UserRole;
    temporaryCredentials: boolean;
}

const Login: React.FC = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [loginMutation] = useLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!login || !password) {
            setError("Please enter both username and password");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await loginMutation({ login, password }).unwrap() as LoginResponse;
            
            // Save user data
            localStorage.setItem("userRole", response.role);
            localStorage.setItem("userFirstName", response.firstName);
            localStorage.setItem("userLogin", login);
            localStorage.setItem("isFirstLogin", String(response.temporaryCredentials));

            // Redirect based on role
            const redirectPath = {
                [UserRole.ADMIN]: "/admin",
                [UserRole.DOCTOR]: "/doctor",
                [UserRole.ANESTHESIOLOGIST]: "/anesthesiologist",
                [UserRole.NURSE]: "/nurse"
            }[response.role] || "/";

            navigate(redirectPath);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login">Login:</label>
                    <input
                        id="login"
                        type="text"
                        placeholder="Enter username"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={isLoading} className="login-button">
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
