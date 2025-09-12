import React, {useState} from "react";
import type {ChangeCredentialsType} from "../types/userRegister.ts";
import {useChangeCredentialsMutation} from "../features/api/apiSlice.ts";

const ChangeCredentials: React.FC = () => {
    const [formData, setFormData] = useState<ChangeCredentialsType>({
        oldPassword: "",
        newPassword: "",
        newLogin: "",
    });
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
    const [success, setSuccess] = useState<boolean>(false);

    const [changeCredentials, {isLoading, error}] = useChangeCredentialsMutation();

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
                oldPassword: "",
                newPassword: "",
                newLogin: "",
            });
            setConfirmPassword("");

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);
        } catch (err) {
            console.error("Failed to change credentials:", err);
        }
    };

    return (
        <div className="change-credentials-container">
            <h2>Change Credentials</h2>

            {success ? (
                <div className="success-message">
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
                    </div>

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