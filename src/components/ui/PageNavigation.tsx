import React from 'react';
import { useNavigate } from 'react-router-dom';


interface PageNavigationProps {
    showBackButton?: boolean;
    showForwardButton?: boolean;
    showLogout?: boolean;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
    showBackButton = true,
    showForwardButton = true,
    showLogout = true,
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleForward = () => {
        navigate(1);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
            {showBackButton && (
                <button
                    onClick={handleBack}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110"
                    title="Go Back"
                    aria-label="Go Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {showForwardButton && (
                <button
                    onClick={handleForward}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110"
                    title="Go Forward"
                    aria-label="Go Forward"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {showLogout && (
                <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-5 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110 flex items-center gap-2"
                    title="Logout"
                    aria-label="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-bold">Logout</span>
                </button>
            )}
        </div>
    );
};
