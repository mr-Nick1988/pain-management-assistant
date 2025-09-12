import type {PersonLogin} from "../types/personRegister.ts";
import React, {useState} from "react";
import {useLoginMutation} from "../features/api/apiPersonSlice.ts";


const Login: React.FC = () => {
    const [formData, setFormData] = useState<PersonLogin>({
        login: "",
        password: "",
    });

    const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
    const [login, {isLoading, error}] = useLoginMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await login(formData).unwrap();
        if (response?.isTemporaryCredentials) {
            setIsFirstLogin(true);
        }
    };
    return (
        <div className="">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">User login:</label>
                    <input
                        id="login"
                        placeholder="Enter login"
                        name="login"
                        value={formData.login}
                        onChange={handleChange}
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
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading} className="login-button">
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            {isFirstLogin && (
                <div className="first-login-mjessage">
                    <p>You have logged in with temporary credentials.Please change them for security.</p>
                    <button onClick={() => window.location.href = "/change-credentials"}>
                        Change Credentials
                    </button>
                </div>
            )}
            {error && <p className="error-message">Error: {JSON.stringify(error)}</p>}
        </div>
    )
}
export default Login;
