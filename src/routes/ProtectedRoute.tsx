import React from 'react';
import { Navigate } from 'react-router-dom';
import { FirstLoginNotice } from "../exports/exports.ts";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    allowedOnFirstLogin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowedOnFirstLogin = false }) => {
    const userRole = localStorage.getItem("userRole");
    const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';
    const userName = localStorage.getItem('userFirstName');

    // Check if user is authenticated (i.e., has a role)
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // Check if user needs to change password
    if (isFirstLogin && !allowedOnFirstLogin) {
        const dashboardTitle = `${userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()} Dashboard`;
        return (
            <FirstLoginNotice
                userRole={userRole}
                userName={userName || ''}
                dashboardTitle={dashboardTitle}
            />
        );
    }

    // Check if user has required role (if specified)
    if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on user's actual role
        switch (userRole) {
            case 'ADMIN':
                return <Navigate to="/admin" replace />;
            case 'DOCTOR':
                return <Navigate to="/doctor" replace />;
            case 'ANESTHESIOLOGIST':
                return <Navigate to="/anesthesiologist" replace />;
            case 'NURSE':
                return <Navigate to="/nurse" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;