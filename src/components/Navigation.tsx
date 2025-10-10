import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types/personRegister.ts';
import { NavigationContainer, NavigationList, NavigationItem } from './ui';

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
        <NavigationContainer>
            <NavigationList>
                {userRole === UserRole.ADMIN && (
                    <NavigationItem>
                        <Link to="/admin" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm max-[480px]:w-full max-[480px]:text-center block">
                            Admin Panel
                        </Link>
                    </NavigationItem>
                )}
                {userRole === UserRole.DOCTOR && (
                    <NavigationItem>
                        <Link to="/doctor" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm max-[480px]:w-full max-[480px]:text-center block">
                            Doctor Dashboard
                        </Link>
                    </NavigationItem>
                )}
                <NavigationItem>
                    <Link to="/change-credentials" className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm max-[480px]:w-full max-[480px]:text-center block">
                        Change Credentials
                    </Link>
                </NavigationItem>
                <NavigationItem>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm max-[480px]:w-full max-[480px]:text-center"
                    >
                        Logout
                    </button>
                </NavigationItem>
            </NavigationList>
        </NavigationContainer>
    );
};

export default Navigation;