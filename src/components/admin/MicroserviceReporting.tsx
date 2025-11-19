import React, { useState } from "react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import {
    useGetDailyReportQuery,
    useTriggerDailyAggregationMutation,
    useTriggerWeeklyAggregationMutation,
    useTriggerMonthlyAggregationMutation,
} from "../../api/api/apiAnalyticsMicroserviceSlice";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation, Button } from "../ui";

type ReportType = "daily" | "weekly" | "monthly";

const MicroserviceReporting: React.FC = () => {
    const [reportType, setReportType] = useState<ReportType>("daily");
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Daily report query
    const { data: dailyReport, isLoading: dailyLoading, error: dailyError, refetch: refetchDaily } = 
        useGetDailyReportQuery(selectedDate, {
            skip: reportType !== "daily",
        });

    // Aggregation mutations
    const [triggerDaily, { isLoading: triggeringDaily }] = useTriggerDailyAggregationMutation();
    const [triggerWeekly, { isLoading: triggeringWeekly }] = useTriggerWeeklyAggregationMutation();
    const [triggerMonthly, { isLoading: triggeringMonthly }] = useTriggerMonthlyAggregationMutation();

    // Handle daily aggregation
    const handleDailyAggregation = async () => {
        try {
            await triggerDaily({ date: selectedDate }).unwrap();
            await refetchDaily();
        } catch (error) {
            console.error("Failed to trigger daily aggregation:", error);
        }
    };

    // Handle weekly aggregation
    const handleWeeklyAggregation = async () => {
        const date = new Date(selectedDate);
        const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const weekEnd = format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
        
        try {
            await triggerWeekly({ weekStart, weekEnd }).unwrap();
            alert(`Weekly aggregation completed for ${weekStart} to ${weekEnd}`);
        } catch (error) {
            console.error("Failed to trigger weekly aggregation:", error);
        }
    };

    // Handle monthly aggregation
    const handleMonthlyAggregation = async () => {
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        
        try {
            await triggerMonthly({ year, month }).unwrap();
            alert(`Monthly aggregation completed for ${year}-${month}`);
        } catch (error) {
            console.error("Failed to trigger monthly aggregation:", error);
        }
    };

    // Parse JSON fields
    const parseTopDrugs = (json?: string) => {
        if (!json) return [];
        try {
            const data = JSON.parse(json);
            return Object.entries(data)
                .map(([drug, count]) => ({ drug, count: count as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
        } catch {
            return [];
        }
    };

    const parseDoseAdjustments = (json?: string) => {
        if (!json) return [];
        try {
            const data = JSON.parse(json);
            return Object.entries(data).map(([reason, count]) => ({ reason, count: count as number }));
        } catch {
            return [];
        }
    };

    const topDrugs = parseTopDrugs(dailyReport?.topDrugsJson);
    const doseAdjustments = parseDoseAdjustments(dailyReport?.doseAdjustmentsJson);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">📈 Microservice Reporting</h1>
                            <p className="text-cyan-100">
                                Aggregated reports from Analytics Microservice (Port 8091)
                            </p>
                        </div>
                        <div className="text-5xl">📊</div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Type Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Report Type Tabs */}
                        <div className="flex gap-2">
                            <Button
                                variant={reportType === "daily" ? "default" : "secondary"}
                                onClick={() => setReportType("daily")}
                            >
                                📅 Daily
                            </Button>
                            <Button
                                variant={reportType === "weekly" ? "default" : "secondary"}
                                onClick={() => setReportType("weekly")}
                            >
                                📆 Weekly
                            </Button>
                            <Button
                                variant={reportType === "monthly" ? "default" : "secondary"}
                                onClick={() => setReportType("monthly")}
                            >
                                📊 Monthly
                            </Button>
                        </div>

                        {/* Date Selector */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button
                                    onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
                                    variant="secondary"
                                >
                                    Today
                                </Button>
                                <Button
                                    onClick={() => setSelectedDate(format(subDays(new Date(), 1), "yyyy-MM-dd"))}
                                    variant="secondary"
                                >
                                    Yesterday
                                </Button>
                            </div>
                        </div>

                        {/* Aggregation Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                            {reportType === "daily" && (
                                <Button
                                    onClick={handleDailyAggregation}
                                    disabled={triggeringDaily}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {triggeringDaily ? "⏳ Aggregating..." : "🔄 Run Daily Aggregation"}
                                </Button>
                            )}
                            {reportType === "weekly" && (
                                <Button
                                    onClick={handleWeeklyAggregation}
                                    disabled={triggeringWeekly}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {triggeringWeekly ? "⏳ Aggregating..." : "🔄 Run Weekly Aggregation"}
                                </Button>
                            )}
                            {reportType === "monthly" && (
                                <Button
                                    onClick={handleMonthlyAggregation}
                                    disabled={triggeringMonthly}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {triggeringMonthly ? "⏳ Aggregating..." : "🔄 Run Monthly Aggregation"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {dailyLoading && <LoadingSpinner message="Loading report..." />}

            {/* Error State */}
            {dailyError && (
                <Card className="bg-red-50 border-2 border-red-200">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="text-5xl mb-4">❌</div>
                            <h3 className="text-xl font-bold text-red-800 mb-2">Report Not Available</h3>
                            <p className="text-red-600 mb-4">
                                No report found for {selectedDate}. Try running aggregation first.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Daily Report Display */}
            {reportType === "daily" && dailyReport && !dailyLoading && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">👥</div>
                                <p className="text-sm text-gray-600 mb-1">Patients Registered</p>
                                <p className="text-3xl font-bold text-blue-600">{dailyReport.totalPatientsRegistered}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">📊</div>
                                <p className="text-sm text-gray-600 mb-1">Avg VAS Level</p>
                                <p className="text-3xl font-bold text-purple-600">{dailyReport.averageVasLevel.toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">{dailyReport.totalVasRecords} records</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">🚨</div>
                                <p className="text-sm text-gray-600 mb-1">Critical VAS</p>
                                <p className="text-3xl font-bold text-orange-600">{dailyReport.criticalVasCount}</p>
                                <p className="text-xs text-gray-500 mt-1">VAS ≥ 7</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-2">✅</div>
                                <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
                                <p className="text-3xl font-bold text-green-600">{dailyReport.approvalRate.toFixed(1)}%</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {dailyReport.approvedRecommendations}/{dailyReport.totalRecommendations}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recommendations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>💊 Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">Total</span>
                                        <span className="text-lg font-bold">{dailyReport.totalRecommendations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                        <span className="text-sm font-medium text-green-800">Approved</span>
                                        <span className="text-lg font-bold text-green-600">{dailyReport.approvedRecommendations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                                        <span className="text-sm font-medium text-red-800">Rejected</span>
                                        <span className="text-lg font-bold text-red-600">{dailyReport.rejectedRecommendations}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Escalations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>🚨 Escalations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">Total</span>
                                        <span className="text-lg font-bold">{dailyReport.totalEscalations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                        <span className="text-sm font-medium text-green-800">Resolved</span>
                                        <span className="text-lg font-bold text-green-600">{dailyReport.resolvedEscalations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                                        <span className="text-sm font-medium text-orange-800">Pending</span>
                                        <span className="text-lg font-bold text-orange-600">{dailyReport.pendingEscalations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                        <span className="text-sm font-medium text-blue-800">Avg Resolution Time</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {dailyReport.averageResolutionTimeHours.toFixed(1)}h
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>⚡ System Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">Total Operations</span>
                                        <span className="text-lg font-bold">{dailyReport.totalOperations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                                        <span className="text-sm font-medium text-red-800">Failed Operations</span>
                                        <span className="text-lg font-bold text-red-600">{dailyReport.failedOperations}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                        <span className="text-sm font-medium text-blue-800">Avg Processing Time</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {dailyReport.averageProcessingTimeMs.toFixed(0)}ms
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>👤 User Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">Total Logins</span>
                                        <span className="text-lg font-bold">{dailyReport.totalLogins}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                        <span className="text-sm font-medium text-green-800">Unique Active Users</span>
                                        <span className="text-lg font-bold text-green-600">{dailyReport.uniqueActiveUsers}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                                        <span className="text-sm font-medium text-red-800">Failed Login Attempts</span>
                                        <span className="text-lg font-bold text-red-600">{dailyReport.failedLoginAttempts}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Drugs */}
                    {topDrugs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>💊 Top Prescribed Drugs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {topDrugs.map(({ drug, count }, index) => (
                                        <div key={drug} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                                                <span className="text-sm font-medium">{drug}</span>
                                            </div>
                                            <span className="text-lg font-bold text-blue-600">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dose Adjustments */}
                    {doseAdjustments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>⚕️ Dose Adjustments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {doseAdjustments.map(({ reason, count }) => (
                                        <div key={reason} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                                            <span className="text-sm font-medium">{reason}</span>
                                            <span className="text-lg font-bold text-orange-600">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Report Metadata */}
                    <Card className="bg-gray-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-600 space-y-1">
                                <p><span className="font-medium">Report ID:</span> {dailyReport.id}</p>
                                <p><span className="font-medium">Report Date:</span> {dailyReport.reportDate}</p>
                                <p><span className="font-medium">Source Events:</span> {dailyReport.sourceEventsCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {reportType === "daily" && !dailyReport && !dailyLoading && !dailyError && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-gray-600 mb-4">No report available for {selectedDate}</p>
                        <Button onClick={handleDailyAggregation} disabled={triggeringDaily}>
                            {triggeringDaily ? "⏳ Aggregating..." : "🔄 Run Aggregation"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <PageNavigation />
        </div>
    );
};

export default MicroserviceReporting;
