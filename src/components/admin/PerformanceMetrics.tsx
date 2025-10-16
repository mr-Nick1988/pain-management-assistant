import React, { useState } from "react";
import { useGetPerformanceStatsQuery } from '../../api/api/apiAdminSlice.ts';
import { Card, CardHeader, CardTitle, CardContent, Input, LoadingSpinner, ErrorMessage, MetricCard, ProgressBar, StatCard } from "../ui";

const PerformanceMetrics: React.FC = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // RTK Query hook
    const { data: stats, isLoading, error } = useGetPerformanceStatsQuery(
        startDate || endDate ? { startDate, endDate } : undefined
    );

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(0)} ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)} sec`;
        if (ms < 3600000) return `${(ms / 60000).toFixed(1)} min`;
        return `${(ms / 3600000).toFixed(1)} hr`;
    };

    const getPerformanceLevel = (ms: number) => {
        if (ms < 500) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
        if (ms < 1000) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
        if (ms < 2000) return { label: "Average", color: "text-yellow-600", bg: "bg-yellow-50" };
        return { label: "Slow", color: "text-red-600", bg: "bg-red-50" };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-yellow-600 to-orange-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Performance Metrics</h1>
                            <p className="text-yellow-100">System performance and processing times</p>
                        </div>
                        <div className="text-4xl sm:text-5xl">⚡</div>
                    </div>
                </CardContent>
            </Card>

            {/* Date Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Date Range</CardTitle>
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
                            <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800 font-medium">Auto-loading enabled</p>
                                <p className="text-xs text-yellow-600">Metrics load automatically when filters change</p>
                            </div>
                        </div>
                    </div>
                    {error && <ErrorMessage message="Error loading metrics" onClose={() => {}} />}
                </CardContent>
            </Card>

            {isLoading && <LoadingSpinner message="Loading performance metrics..." />}

            {stats && !isLoading && (
                <>
                    {/* Average Processing Time */}
                    <Card className={`border-2 ${getPerformanceLevel(stats.averageProcessingTimeMs).bg}`}>
                        <CardContent className="py-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Average Processing Time</p>
                                <p className={`text-5xl font-bold ${getPerformanceLevel(stats.averageProcessingTimeMs).color}`}>
                                    {formatTime(stats.averageProcessingTimeMs)}
                                </p>
                                <p className={`text-sm font-medium mt-2 ${getPerformanceLevel(stats.averageProcessingTimeMs).color}`}>
                                    {getPerformanceLevel(stats.averageProcessingTimeMs).label} Performance
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommendations Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <MetricCard
                                    title="Total Recommendations"
                                    value={stats.totalRecommendations}
                                    icon="💊"
                                    color="blue"
                                />
                                <MetricCard
                                    title="Approved"
                                    value={stats.approvedRecommendations}
                                    subtitle={`${((stats.approvedRecommendations / stats.totalRecommendations) * 100).toFixed(1)}% approval rate`}
                                    icon="✅"
                                    color="green"
                                />
                                <MetricCard
                                    title="Rejected"
                                    value={stats.rejectedRecommendations}
                                    subtitle={`${((stats.rejectedRecommendations / stats.totalRecommendations) * 100).toFixed(1)}% rejection rate`}
                                    icon="❌"
                                    color="red"
                                />
                            </div>

                            <ProgressBar
                                value={(stats.approvedRecommendations / stats.totalRecommendations) * 100}
                                label="Approval Rate"
                                color="green"
                                height="lg"
                            />
                        </CardContent>
                    </Card>

                    {/* Escalations Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Escalations Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <MetricCard
                                    title="Total Escalations"
                                    value={stats.totalEscalations}
                                    subtitle={`${((stats.totalEscalations / stats.totalRecommendations) * 100).toFixed(1)}% of recommendations escalated`}
                                    icon="🚨"
                                    color="orange"
                                />
                                <MetricCard
                                    title="Resolved"
                                    value={stats.resolvedEscalations}
                                    subtitle={`${((stats.resolvedEscalations / stats.totalEscalations) * 100).toFixed(1)}% resolution rate`}
                                    icon="✔️"
                                    color="purple"
                                />
                            </div>

                            <ProgressBar
                                value={(stats.resolvedEscalations / stats.totalEscalations) * 100}
                                label="Resolution Rate"
                                color="purple"
                                height="lg"
                                className="mb-6"
                            />

                            <StatCard
                                title="Average Resolution Time"
                                value={formatTime(stats.averageEscalationResolutionTimeMs)}
                                icon="⏱️"
                                iconBgColor="bg-indigo-100"
                                iconTextColor="text-indigo-600"
                            />
                        </CardContent>
                    </Card>

                    {/* Performance Insights */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                        <CardHeader>
                            <CardTitle>Performance Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.averageProcessingTimeMs > 2000 && (
                                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Slow Processing Detected</p>
                                            <p className="text-xs text-yellow-600">Average processing time is above 2 seconds. Consider optimization.</p>
                                        </div>
                                    </div>
                                )}

                                {((stats.approvedRecommendations / stats.totalRecommendations) * 100) > 90 && (
                                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-2xl">✅</span>
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Excellent Approval Rate</p>
                                            <p className="text-xs text-green-600">Over 90% of recommendations are being approved.</p>
                                        </div>
                                    </div>
                                )}

                                {((stats.totalEscalations / stats.totalRecommendations) * 100) > 20 && (
                                    <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <span className="text-2xl">🚨</span>
                                        <div>
                                            <p className="text-sm font-medium text-orange-800">High Escalation Rate</p>
                                            <p className="text-xs text-orange-600">More than 20% of recommendations are escalated. Review protocols.</p>
                                        </div>
                                    </div>
                                )}

                                {stats.averageEscalationResolutionTimeMs > 7200000 && (
                                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <span className="text-2xl">⏰</span>
                                        <div>
                                            <p className="text-sm font-medium text-red-800">Slow Escalation Resolution</p>
                                            <p className="text-xs text-red-600">Average resolution time exceeds 2 hours. Improve response time.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {!stats && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">⚡</div>
                        <p className="text-gray-600 mb-4">No performance metrics loaded yet</p>
                        <p className="text-sm text-gray-500">Metrics will load automatically</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PerformanceMetrics;
