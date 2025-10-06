import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NoticeContainer, NoticeBox, NoticeTitle, NoticeText, NoticeDetails, NoticeList, NoticeActions, NoticeButton, NoticeFooter } from '../ui';

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
        <div className="min-h-screen">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg text-red-500">{dashboardTitle}</h1>
                <p className="text-lg text-red-400">
                    Welcome, {userName || userRole}
                </p>
            </header>
            
            <NoticeContainer>
                <NoticeBox>
                    <NoticeTitle icon="🔒">Security Notice</NoticeTitle>
                    <NoticeText>
                        You have logged in with temporary credentials. For security reasons, 
                        please change your login and password immediately.
                    </NoticeText>
                    <NoticeDetails title="Why is this important?">
                        <NoticeList items={[
                            "Temporary passwords are not secure and can be a vulnerability.",
                            "Protecting patient data and system integrity is our highest priority.",
                            "This is a required step to comply with healthcare security standards (HIPAA)."
                        ]} />
                    </NoticeDetails>
                    <NoticeActions>
                        <NoticeButton onClick={handleChangeCredentials} variant="primary">
                            Change Credentials Now
                        </NoticeButton>
                        <NoticeButton onClick={handleContinue} variant="secondary">
                            Continue Temporarily
                        </NoticeButton>
                    </NoticeActions>
                    <NoticeFooter>
                        You can change your credentials at any time from the navigation menu.
                    </NoticeFooter>
                </NoticeBox>
            </NoticeContainer>
        </div>
    );
};

export default FirstLoginNotice;
