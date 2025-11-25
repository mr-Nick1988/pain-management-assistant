import React, {useState} from "react";
import {useGetEventStatsQuery} from '../../api/api/apiAdminSlice.ts';
import {Card, CardContent, CardHeader, CardTitle, ErrorMessage, Input, LoadingSpinner, PageNavigation } from "../ui";
import { BarChart3, Pill, AlertTriangle, User, Users, ShieldCheck, FileText, Lock, Activity } from "lucide-react";


const AnalyticsOverview: React.FC = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // RTK Query hook
    const {data: stats, isLoading, error} = useGetEventStatsQuery(
        startDate || endDate ? {startDate, endDate} : undefined
    );

    const getEventTypeIcon = (type: string): React.ReactNode => {
        if (type.includes("RECOMMENDATION")) return <Pill className="w-5 h-5 text-green-700"/>;
        if (type.includes("ESCALATION")) return <AlertTriangle className="w-5 h-5 text-orange-700"/>;
        if (type.includes("PATIENT")) return <User className="w-5 h-5 text-blue-700"/>;
        if (type.includes("VAS")) return <BarChart3 className="w-5 h-5 text-indigo-700"/>;
        if (type.includes("LOGIN")) return <Lock className="w-5 h-5 text-purple-700"/>;
        if (type.includes("PERSON")) return <Users className="w-5 h-5 text-gray-700"/>;
        return <FileText className="w-5 h-5 text-gray-600"/>;
    };

    const getRoleIcon = (role: string): React.ReactNode => {
        switch (role) {
            case "DOCTOR":
                return <Activity className="w-7 h-7 text-blue-700"/>;
            case "NURSE":
                return <Users className="w-7 h-7 text-green-700"/>;
            case "ANESTHESIOLOGIST":
                return <AlertTriangle className="w-7 h-7 text-orange-700"/>;
            case "ADMIN":
                return <ShieldCheck className="w-7 h-7 text-purple-700"/>;
            default:
                return <User className="w-7 h-7 text-gray-700"/>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Analytics Overview</h1>
                            <p className="text-purple-100">System-wide event statistics and insights</p>
                        </div>
                        <div className="text-4xl sm:text-5xl"><BarChart3 className="w-10 h-10"/></div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <Input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <Input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-800 font-medium">Auto-loading enabled</p>
                                <p className="text-xs text-blue-600">Statistics load automatically when filters
                                    change</p>
                            </div>
                        </div>
                    </div>
                    {error && <ErrorMessage message="Error loading statistics" onClose={() => {
                    }}/>}
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && <LoadingSpinner message="Loading analytics data..."/>}
            {/* Statistics Display */}
            {stats && !isLoading && (
                <>
                    {/* Total Events */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                        <CardContent className="py-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Total Events</p>
                                <p className="text-5xl font-bold text-blue-600">{stats.totalEvents.toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {startDate && endDate ? "In selected period" : "All time"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events by Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Events by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(stats.eventsByType)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([type, count]) => (
                                        <div
                                            key={type}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span
                                                    className="inline-flex items-center justify-center">{getEventTypeIcon(type)}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {type.replace(/_/g, " ")}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {((count / stats.totalEvents) * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-lg font-bold text-blue-600">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events by Role */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Events by User Role</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(stats.eventsByRole)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([role, count]) => (
                                        <div
                                            key={role}
                                            className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 text-center"
                                        >
                                            <div className="mb-2 flex justify-center">{getRoleIcon(role)}</div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">{role}</p>
                                            <p className="text-2xl font-bold text-blue-600">{count}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {((count / stats.totalEvents) * 100).toFixed(1)}% of total
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events by Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Events by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {Object.entries(stats.eventsByStatus).map(([status, count]) => {
                                    const isSuccess = status === "APPROVED" || status === "RESOLVED" || status === "SUCCESS";
                                    const isFailed = status === "REJECTED" || status === "FAILED";

                                    return (
                                        <div
                                            key={status}
                                            className={`p-4 rounded-lg border-2 ${
                                                isSuccess
                                                    ? "bg-green-50 border-green-200"
                                                    : isFailed
                                                        ? "bg-red-50 border-red-200"
                                                        : "bg-gray-50 border-gray-200"
                                            }`}
                                        >
                                            <p className="text-sm font-medium text-gray-700 mb-2">{status}</p>
                                            <p className={`text-3xl font-bold ${
                                                isSuccess ? "text-green-600" : isFailed ? "text-red-600" : "text-gray-600"
                                            }`}>
                                                {count}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {((count / stats.totalEvents) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {!stats && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mb-4 flex justify-center"><BarChart3 className="w-12 h-12 text-gray-500"/></div>
                        <p className="text-gray-600 mb-4">No statistics loaded yet</p>
                        <p className="text-sm text-gray-500">Statistics will load automatically</p>
                    </CardContent>
                </Card>
            )}
            <PageNavigation/>

        </div>
    );
}
export default AnalyticsOverview;
