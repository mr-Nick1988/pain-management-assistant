import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FirstLoginNoticeProps {
    userRole: string;
    userName?: string;
    dashboardTitle: string;
}

const FirstLoginNotice: React.FC<FirstLoginNoticeProps> = ({ 
    userRole, 
    userName, 
    dashboardTitle 
}) => {
    const navigate = useNavigate();

    const handleChangeCredentials = () => {
        navigate('/change-credentials');
    };

    const handleContinue = () => {
        localStorage.setItem("isFirstLogin", "false");
        window.location.reload();
    };

    return (
        <div className="medical-page">
            <div className="first-login-notice-container">
                <header className="first-login-notice-header">
                    <h1 className="text-4xl font-bold text-center mb-2 drop-shadow-lg !text-red-500">{dashboardTitle}</h1>
                    <p className="text-lg text-center !text-red-400">
                        Welcome, {userName || userRole}
                    </p>
                </header>
                
                <div className="first-login-notice-box">
                    <h2 className="first-login-notice-title">🔒 Security Notice</h2>
                    <p className="first-login-notice-text">
                        You have logged in with temporary credentials. For security reasons, 
                        please change your login and password immediately.
                    </p>
                    <div className="first-login-notice-details">
                        <p className="first-login-notice-details-title">
                            Why is this important?
                        </p>
                        <ul className="first-login-notice-details-list">
                            <li>Temporary passwords are not secure and can be a vulnerability.</li>
                            <li>Protecting patient data and system integrity is our highest priority.</li>
                            <li>This is a required step to comply with healthcare security standards (HIPAA).</li>
                        </ul>
                    </div>
                    <div className="first-login-notice-actions">
                        <button 
                            onClick={handleChangeCredentials}
                            className="first-login-notice-submit-button"
                        >
                            Change Credentials Now
                        </button>
                        <button 
                            onClick={handleContinue}
                            className="first-login-notice-cancel-button"
                        >
                            Continue Temporarily
                        </button>
                    </div>
                    <div className="first-login-notice-footer">
                        <small className="first-login-notice-footer-text">
                            You can change your credentials at any time from the navigation menu.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirstLoginNotice;
