import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const authToken = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    // Check if user is authenticated
    if (!authToken) {
        return <Navigate to="/login" replace />;
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
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;