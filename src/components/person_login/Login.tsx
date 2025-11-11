import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../api/api/apiAuthSlice.ts";
import {UserRole} from "../../types/personRegister.ts";
import { Container, FormField, GradientButton, GradientTitle } from "../ui";

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
            // Логин через Authentication Service
            // Токены автоматически сохраняются в HttpOnly cookies на бэкенде
            const response = await loginMutation({ login, password }).unwrap();
            
            // Сохраняем только метаданные пользователя (НЕ токены!)
            localStorage.setItem("userRole", response.role);
            localStorage.setItem("userFirstName", response.firstName);
            localStorage.setItem("userLogin", login);
            localStorage.setItem("isFirstLogin", String(response.temporaryCredentials));

            // Редирект по роли
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
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <GradientTitle>Login</GradientTitle>
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                    label="Login:"
                    id="login"
                    placeholder="Enter username"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <FormField
                    label="Password:"
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <GradientButton type="submit" disabled={isLoading} fullWidth>
                    {isLoading ? "Logging in..." : "Login"}
                </GradientButton>
            </form>
        </Container>
    );
};

export default Login;
