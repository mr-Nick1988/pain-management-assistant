import React, {useState, useEffect} from "react";
import type {ChangeCredentialsType} from "../../types/personRegister.ts";
import {useChangeCredentialsMutation} from "../../api/api/apiPersonSlice.ts";
import { Container, FormField, GradientButton, GradientTitle, SuccessMessage, ErrorMessage } from "../ui";


const ChangeCredentials: React.FC = () => {
    const [formData, setFormData] = useState<ChangeCredentialsType>({
        currentLogin: "",
        oldPassword: "",
        newPassword: "",
        newLogin: "",
    });
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
    const [success, setSuccess] = useState<boolean>(false);

    const [changeCredentials, {isLoading, error}] = useChangeCredentialsMutation();

    useEffect(() => {
        // Get current user login from localStorage
        const currentLogin = localStorage.getItem('userLogin');
        if (currentLogin) {
            setFormData(prev => ({
                ...prev,
                currentLogin: currentLogin
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        if (name === "confirmPassword") {
            setConfirmPassword(value);
            setPasswordsMatch(formData.newPassword === value);
        } else {
            setFormData({...formData, [name]: value});
            if (name === "newPassword") {
                setPasswordsMatch(value === confirmPassword);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch) {
            return;
        }

        try {
            await changeCredentials(formData).unwrap();
            setSuccess(true);

            setFormData({
                currentLogin: "",
                oldPassword: "",
                newPassword: "",
                newLogin: "",
            });
            setConfirmPassword("");

            // Clear localStorage and redirect to login page after 3 seconds
            setTimeout(() => {
                localStorage.clear();
                window.location.href = "/login";
            }, 3000);
        } catch (err) {
            console.error("Failed to change credentials:", err);
        }
    };

    return (
        <Container>
            <GradientTitle>Change Credentials</GradientTitle>

            {success ? (
                <SuccessMessage message="Credentials successfully changed! You will be redirected to the login page." />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField
                        label="Current Password:"
                        id="oldPassword"
                        type="password"
                        placeholder="Enter current password"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />
                    <FormField
                        label="New Password:"
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                    <FormField
                        label="Confirm New Password:"
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={handleChange}
                        required
                        error={!passwordsMatch ? "Passwords do not match!" : undefined}
                    />
                    <FormField
                        label="New Login:"
                        id="newLogin"
                        placeholder="Enter new login"
                        value={formData.newLogin}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <ErrorMessage 
                            message={"data" in error && typeof error.data === "object" && error.data && "message" in error.data
                                ? String(error.data.message)
                                : "Failed to change credentials"}
                        />
                    )}

                    <GradientButton type="submit" disabled={isLoading || !passwordsMatch} fullWidth>
                        {isLoading ? "Changing..." : "Change Credentials"}
                    </GradientButton>
                </form>
            )}
        </Container>
    );
};

export default ChangeCredentials;