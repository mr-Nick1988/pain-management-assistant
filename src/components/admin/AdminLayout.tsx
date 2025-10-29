import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui";

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: "/admin", label: "Dashboard", icon: "🏠" },
        { path: "/admin/analytics", label: "Analytics", icon: "📊" },
        { path: "/admin/reporting", label: "Reporting", icon: "📈" },
        { path: "/admin/backup", label: "Backup & Restore", icon: "💾" },
        { path: "/admin/users", label: "Employees", icon: "👥" },
        { path: "/admin/activity", label: "Employee Activity", icon: "👤" },
        { path: "/admin/performance", label: "Performance", icon: "⚡" },
        { path: "/admin/patients-stats", label: "Patient Stats", icon: "🏥" },
        { path: "/admin/logs", label: "Technical Logs", icon: "📝" },
        { path: "/admin/events", label: "Events Timeline", icon: "🕐" },
        { path: "/admin/api-keys", label: "API Keys", icon: "🔑" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">👨‍💼</span>
                            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                        </div>
                        <Button
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login');
                            }}
                            variant="cancel"
                            className="text-sm"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Horizontal Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-1 py-2">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200 whitespace-nowrap
                                    ${isActive(item.path)
                                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                                `}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
