import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types/personRegister.ts';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token') !== null;
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="navigation">
            <ul>
                {userRole === UserRole.ADMIN && (
                    <li>
                        <Link to="/admin">Admin Panel</Link>
                    </li>
                )}
                {userRole === UserRole.DOCTOR && (
                    <li>
                        <Link to="/doctor">Doctor Dashboard</Link>
                    </li>
                )}
                <li>
                    <Link to="/change-credentials">Change Credentials</Link>
                </li>
                <li>
                    <button onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;