import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useLoginMutation} from "../api/api/apiPersonSlice.ts";


const Login: React.FC = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [loginMutation] = useLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await loginMutation({ login, password }).unwrap();
            
            // Save to localStorage
            localStorage.setItem("authToken", response.token || "");
            localStorage.setItem("userRole", response.role || "");
            localStorage.setItem("userFirstName", response.firstName || "");
            localStorage.setItem("userLastName", response.lastName || "");
            localStorage.setItem("userLogin", response.login || login);
            localStorage.setItem("userId", response.id || "");
            localStorage.setItem("isFirstLogin", response.isFirstLogin?.toString() || "false");

            // Navigate based on role
            switch (response.role) {
                case "ADMIN":
                    navigate("/admin");
                    break;
                case "DOCTOR":
                    navigate("/doctor");
                    break;
                case "ANESTHESIOLOGIST":
                    navigate("/anesthesiologist");
                    break;
                case "NURSE":
                    navigate("/nurse");
                    break;
                default:
                    console.error('Unknown role: ' + response.role);
                    navigate('/');
            }
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login">User login:</label>
                    <input
                        id="login"
                        placeholder="Enter login"
                        name="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        placeholder="Enter password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">Error: {error}</p>}
                <button type="submit" disabled={isLoading} className="login-button">
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            {localStorage.getItem("isFirstLogin") === "true" && (
                <div className="first-login-message">
                    <p>You have logged in with temporary credentials. Please change them for security.</p>
                    <button onClick={() => navigate('/change-credentials')}>
                        Change Credentials
                    </button>
                </div>
            )}
        </div>
    )
}

export default Login;
