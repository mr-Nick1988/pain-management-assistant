import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, MetricCard , PageNavigation } from "../ui";
import { useGetPersonsQuery, useGetEventStatsQuery, useGetPerformanceStatsQuery, useGetAllPatientsQuery } from '../../api/api/apiAdminSlice.ts';
import { LayoutDashboard, Users, BarChart3, TrendingUp, Zap, Hospital, FileText, Clock, UserPlus, Key, Save, Microscope, LineChart, ChevronRight } from "lucide-react";

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    // RTK Query hooks - загружаем реальные данные для дашборда
    const { data: persons } = useGetPersonsQuery(undefined);
    const { data: patients } = useGetAllPatientsQuery(undefined);
    const { data: eventStats } = useGetEventStatsQuery(undefined);
    const { data: performanceStats } = useGetPerformanceStatsQuery(undefined);

    /**
     * Вычисляем реальные метрики из загруженных данных
     */
    const totalPersons = persons?.length || 0;
    const totalPatients = patients?.length || 0; // Реальное количество пациентов в больнице
    const totalEvents = eventStats?.totalEvents || 0;
    const avgResponseTime = performanceStats?.averageProcessingTimeMs || 0;
    const totalRecommendations = performanceStats?.totalRecommendations || 0;
    const approvalRate = performanceStats 
        ? ((performanceStats.approvedRecommendations / performanceStats.totalRecommendations) * 100).toFixed(1)
        : 0;

    /**
     * Форматировать время отклика
     */
    const formatResponseTime = (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    /**
     * Конфигурация карточек навигации
     */
    const dashboardCards = [
        {
            title: "Employee Management",
            description: "Manage hospital staff and permissions",
            icon: <Users className="w-6 h-6 text-blue-700" />,
            color: "bg-blue-50 border-blue-200",
            iconBg: "bg-blue-100",
            path: "/admin/users",
            stats: `${totalPersons} employees`
        },
        {
            title: "Analytics Overview",
            description: "View system-wide analytics and statistics",
            icon: <BarChart3 className="w-6 h-6 text-purple-700" />,
            color: "bg-purple-50 border-purple-200",
            iconBg: "bg-purple-100",
            path: "/admin/analytics",
            stats: `${totalEvents} events`
        },
        {
            title: "User Activity",
            description: "Monitor user actions and login history",
            icon: <TrendingUp className="w-6 h-6 text-green-700" />,
            color: "bg-green-50 border-green-200",
            iconBg: "bg-green-100",
            path: "/admin/activity",
            stats: "Track behavior"
        },
        {
            title: "Performance Metrics",
            description: "System performance and processing times",
            icon: <Zap className="w-6 h-6 text-yellow-700" />,
            color: "bg-yellow-50 border-yellow-200",
            iconBg: "bg-yellow-100",
            path: "/admin/performance",
            stats: `${formatResponseTime(avgResponseTime)} avg`
        },
        {
            title: "Patient Statistics",
            description: "Patient registration and VAS records",
            icon: <Hospital className="w-6 h-6 text-pink-700" />,
            color: "bg-pink-50 border-pink-200",
            iconBg: "bg-pink-100",
            path: "/admin/patients-stats",
            stats: `${totalPatients} patients`
        },
        {
            title: "Technical Logs",
            description: "System logs and error tracking",
            icon: <FileText className="w-6 h-6 text-red-700" />,
            color: "bg-red-50 border-red-200",
            iconBg: "bg-red-100",
            path: "/admin/logs",
            stats: "Debug & monitor"
        },
        {
            title: "Events Timeline",
            description: "Recent system events and actions",
            icon: <Clock className="w-6 h-6 text-indigo-700" />,
            color: "bg-indigo-50 border-indigo-200",
            iconBg: "bg-indigo-100",
            path: "/admin/events",
            stats: "Audit trail"
        },
        {
            title: "Create New Employee",
            description: "Add new staff member to the system",
            icon: <UserPlus className="w-6 h-6 text-teal-700" />,
            color: "bg-teal-50 border-teal-200",
            iconBg: "bg-teal-100",
            path: "/admin/create-person",
            stats: "Quick action"
        },
        {
            title: "API Key Management",
            description: "Manage external device API keys",
            icon: <Key className="w-6 h-6 text-orange-700" />,
            color: "bg-orange-50 border-orange-200",
            iconBg: "bg-orange-100",
            path: "/admin/api-keys",
            stats: "VAS Integration"
        },
        {
            title: "Reporting Dashboard",
            description: "Daily reports, analytics and statistics",
            icon: <BarChart3 className="w-6 h-6 text-cyan-700" />,
            color: "bg-cyan-50 border-cyan-200",
            iconBg: "bg-cyan-100",
            path: "/admin/reporting",
            stats: "Export & Email"
        },
        {
            title: "Backup & Restore",
            description: "Database backup and recovery management",
            icon: <Save className="w-6 h-6 text-emerald-700" />,
            color: "bg-emerald-50 border-emerald-200",
            iconBg: "bg-emerald-100",
            path: "/admin/backup",
            stats: "Automated backups"
        },
        {
            title: "Microservice Analytics",
            description: "Real-time events from Analytics Microservice",
            icon: <Microscope className="w-6 h-6 text-violet-700" />,
            color: "bg-violet-50 border-violet-200",
            iconBg: "bg-violet-100",
            path: "/admin/microservice-analytics",
            stats: "Port 8091"
        },
        {
            title: "Microservice Reporting",
            description: "Aggregated reports from microservice",
            icon: <LineChart className="w-6 h-6 text-sky-700" />,
            color: "bg-sky-50 border-sky-200",
            iconBg: "bg-sky-100",
            path: "/admin/microservice-reporting",
            stats: "Daily/Weekly/Monthly"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white border-0 shadow-lg">
                <CardContent className="py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                            <p className="text-blue-100 text-lg">
                                Welcome to the Pain Management System Administration Panel
                            </p>
                        </div>
                        <div className="text-6xl"><LayoutDashboard className="w-14 h-14" /></div>
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Employees"
                    value={totalPersons}
                    iconNode={<Users className="w-8 h-8 text-blue-600" />}
                    color="blue"
                />
                <MetricCard
                    title="Total Patients"
                    value={totalPatients}
                    iconNode={<Hospital className="w-8 h-8 text-purple-600" />}
                    color="purple"
                />
                <MetricCard
                    title="Recommendations"
                    value={totalRecommendations}
                    subtitle={`${approvalRate}% approved`}
                    iconNode={<LineChart className="w-8 h-8 text-green-600" />}
                    color="green"
                />
                <MetricCard
                    title="Avg Response Time"
                    value={formatResponseTime(avgResponseTime)}
                    iconNode={<Zap className="w-8 h-8 text-yellow-600" />}
                    color="yellow"
                />
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardCards.map((card, index) => (
                        <Card
                            key={index}
                            className={`${card.color} border-2 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105`}
                            onClick={() => navigate(card.path)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`${card.iconBg} w-12 h-12 rounded-lg flex items-center justify-center`}> 
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {card.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">
                                        {card.stats}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* System Status */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-6 h-6 text-green-700" />
                            <div>
                                <p className="text-sm font-medium text-green-800">API Status</p>
                                <p className="text-xs text-green-600">All systems operational</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <RefreshCw className="w-6 h-6 text-blue-700" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Data Sync</p>
                                <p className="text-xs text-blue-600">Real-time updates active</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <ShieldCheck className="w-6 h-6 text-purple-700" />
                            <div>
                                <p className="text-sm font-medium text-purple-800">Security</p>
                                <p className="text-xs text-purple-600">All connections secure</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        <PageNavigation />

        </div>
    );
};

export default AdminDashboard;
