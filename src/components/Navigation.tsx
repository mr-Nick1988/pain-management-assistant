import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token') !== null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="navigation">
            <ul>
                <li>
                    <Link to="/admin">Admin Panel</Link>
                </li>
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