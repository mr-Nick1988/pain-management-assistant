import React, {useState, useEffect} from "react";
import type {ChangeCredentialsType} from "../types/personRegister.ts";
import {useChangeCredentialsMutation} from "../api/api/apiPersonSlice.ts";


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
        <div className="change-credentials-container">
            <h2 className="medical-title">Change Credentials</h2>

            {success ? (
                <div className="medical-subtitle">
                    <p>Credentials successfully changed! You will be redirected to the login page.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="oldPassword">Current Password:</label>
                        <input
                            id="oldPassword"
                            name="oldPassword"
                            type="password"
                            placeholder="Enter current password"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password:</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newLogin">New Login:</label>
                        <input
                            id="newLogin"
                            name="newLogin"
                            placeholder="Enter new login"
                            value={formData.newLogin}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!passwordsMatch && (
                        <p className="error-text">Passwords do not match</p>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || !passwordsMatch}
                        className="submit-button"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            )}

            {error && (
                <p className="error-message">
                    Error: {JSON.stringify(error)}
                </p>
            )}
        </div>
    );
};

export default ChangeCredentials;