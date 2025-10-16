import React, { useState } from "react";
import { useGetUserActivityQuery } from '../../api/api/apiAdminSlice.ts';
import { Card, CardHeader, CardTitle, CardContent, Input, LoadingSpinner, ErrorMessage, ProgressBar , PageNavigation } from "../ui";
import { Badge } from "../ui/Badge.tsx";

const UserActivityMonitor: React.FC = () => {
    const [userId, setUserId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // RTK Query hook - загружает активность пользователя
    // Skip запрос если userId пустой
    const { data: activity, isLoading, error } = useGetUserActivityQuery(
        { userId, startDate, endDate },
        { skip: !userId.trim() }
    );

    /**
     * Получить цвет бейджа в зависимости от роли пользователя
     */
    const getRoleColor = (role: string) => {
        switch (role) {
            case "DOCTOR": return "bg-blue-100 text-blue-800";
            case "NURSE": return "bg-green-100 text-green-800";
            case "ANESTHESIOLOGIST": return "bg-purple-100 text-purple-800";
            case "ADMIN": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    /**
     * Получить иконку для роли пользователя
     */
    const getRoleIcon = (role: string) => {
        switch (role) {
            case "DOCTOR": return "👨‍⚕️";
            case "NURSE": return "👩‍⚕️";
            case "ANESTHESIOLOGIST": return "💉";
            case "ADMIN": return "👨‍💼";
            default: return "👤";
        }
    };

    /**
     * Форматировать дату в локальный формат
     */
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    /**
     * Определить уровень активности пользователя
     */
    const getActivityLevel = (totalActions: number) => {
        if (totalActions > 100) return { label: "Very Active", color: "bg-green-500" };
        if (totalActions > 50) return { label: "Active", color: "bg-blue-500" };
        if (totalActions > 20) return { label: "Moderate", color: "bg-yellow-500" };
        return { label: "Low Activity", color: "bg-gray-500" };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-green-600 to-blue-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Employee Activity Monitor</h1>
                            <p className="text-green-100">Track employee actions, logins, and behavior patterns</p>
                        </div>
                        <div className="text-4xl sm:text-5xl">📈</div>
                    </div>
                </CardContent>
            </Card>

            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Employee Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User ID *
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., doctor123"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date (Optional)
                            </label>
                            <Input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date (Optional)
                            </label>
                            <Input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="w-full p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800 font-medium">Auto-loading enabled</p>
                                <p className="text-xs text-green-600">Activity loads automatically when User ID is entered</p>
                            </div>
                        </div>
                    </div>
                    {error && <ErrorMessage message="Error loading employee activity" onClose={() => {}} />}
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && <LoadingSpinner message="Fetching employee activity..." />}

            {/* Activity Display */}
            {activity && !isLoading && (
                <>
                    {/* User Info Card */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                        <CardContent className="py-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl sm:text-5xl">{getRoleIcon(activity.userRole)}</div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{activity.userId}</h2>
                                        <Badge className={getRoleColor(activity.userRole)}>
                                            {activity.userRole}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-sm text-gray-600">Activity Level</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className={`w-3 h-3 rounded-full ${getActivityLevel(activity.totalActions).color}`}></div>
                                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                                            {getActivityLevel(activity.totalActions).label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Actions */}
                        <Card className="bg-white border-l-4 border-l-blue-500">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Actions</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{activity.totalActions}</p>
                                    </div>
                                    <div className="text-3xl sm:text-4xl">🎯</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Successful Logins */}
                        <Card className="bg-white border-l-4 border-l-green-500">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Successful Logins</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{activity.loginCount}</p>
                                    </div>
                                    <div className="text-3xl sm:text-4xl">✅</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Failed Logins */}
                        <Card className="bg-white border-l-4 border-l-red-500">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Failed Logins</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-red-600">{activity.failedLoginCount}</p>
                                    </div>
                                    <div className="text-3xl sm:text-4xl">❌</div>
                                </div>
                                {activity.failedLoginCount > 5 && (
                                    <div className="mt-2 text-xs text-red-600 font-medium">
                                        ⚠️ High failure rate
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Last Activity */}
                        <Card className="bg-white border-l-4 border-l-purple-500">
                            <CardContent className="py-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Last Activity</p>
                                    <p className="text-xs sm:text-sm font-bold text-purple-600">
                                        {formatDate(activity.lastActivity)}
                                    </p>
                                    <div className="text-3xl sm:text-4xl mt-2">🕐</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Login Success Rate */}
                                <ProgressBar
                                    value={(activity.loginCount / (activity.loginCount + activity.failedLoginCount)) * 100}
                                    label="Login Success Rate"
                                    color="green"
                                    height="md"
                                />

                                {/* Actions per Login */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Actions per Login</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {(activity.totalActions / activity.loginCount).toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min((activity.totalActions / activity.loginCount / 10) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Alerts */}
                    {activity.failedLoginCount > 5 && (
                        <Card className="bg-red-50 border-2 border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-700">⚠️ Security Alert</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-600">
                                    This user has {activity.failedLoginCount} failed login attempts. 
                                    Consider reviewing account security or resetting credentials.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Empty State */}
            {!activity && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">📈</div>
                        <p className="text-gray-600 mb-4">No employee activity loaded yet</p>
                        <p className="text-sm text-gray-500">Enter an Employee ID to view activity data</p>
                    </CardContent>
                </Card>
            )}
        <PageNavigation />

        </div>
    );
};

export default UserActivityMonitor;
