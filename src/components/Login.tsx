import type {PersonLogin} from "../types/personRegister.ts";
import React, {useState} from "react";
import {useLoginMutation} from "../features/api/apiPersonSlice.ts";
import {useNavigate} from "react-router-dom";

const Login: React.FC = () => {
    const navigate = useNavigate();
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
        try {
            const response = await login(formData).unwrap();

            if (response?.firstName) {
                localStorage.setItem('userFirstName', response.firstName)
            }
            if (response?.role) {
                localStorage.setItem('userRole', response.role)
            }
            // Сохраняем логин пользователя для смены креденшиалов
            localStorage.setItem('userLogin', formData.login);
            
            if (response?.temporaryCredentials) {
                setIsFirstLogin(true)
            } else {
                switch (response?.role) {
                    case 'ADMIN':
                        navigate('/admin');
                        break;
                    case 'DOCTOR':
                        navigate('/doctor');
                        break;
                    case 'NURSE':
                        navigate('/nurse');
                        break;
                    case 'ANESTHESIOLOGIST':
                        navigate('/anesthesiologist');
                        break;
                    default:
                        console.error('Unknown role: ' + response?.role);
                        navigate('/');
                }
            }
        } catch (error) {
            console.error('Login failed: ' + error);
        }
    };

    const handleChangeCredentials = () => {
        navigate('/change-credentials');
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
                <div className="first-login-message">
                    <p>You have logged in with temporary credentials. Please change them for security.</p>
                    <button onClick={handleChangeCredentials}>
                        Change Credentials
                    </button>
                </div>
            )}
            {error && <p className="error-message">Error: {JSON.stringify(error)}</p>}
        </div>
    )
}

export default Login;
