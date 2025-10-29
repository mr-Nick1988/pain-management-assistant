import React, { useState } from "react";
import { format, subDays } from "date-fns";
import { useGetDailyReportsQuery, useGetSummaryStatisticsQuery } from "../../api/api/apiReportingSlice";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation } from "../ui";
import DailyReportsTable from "./reporting/DailyReportsTable";
import SummaryCards from "./reporting/SummaryCards";
import ChartsSection from "./reporting/ChartsSection";
import DateRangeSelector from "./reporting/DateRangeSelector";

const ReportingDashboard: React.FC = () => {
    // Date range state (default: last 7 days)
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // API queries
    const { data: reports, isLoading: reportsLoading, error: reportsError } = useGetDailyReportsQuery({
        startDate,
        endDate,
    });

    const { data: summary, isLoading: summaryLoading } = useGetSummaryStatisticsQuery({
        startDate,
        endDate,
    });

    const handleDateRangeChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Debug: log data
    console.log("📊 Reporting Dashboard Debug:");
    console.log("Reports:", reports);
    console.log("Reports count:", reports?.length);
    console.log("Summary:", summary);
    console.log("Reports loading:", reportsLoading);
    console.log("Reports error:", reportsError);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        📊 Reporting Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Daily reports, analytics, and system statistics
                    </p>
                </div>
            </div>

            {/* Date Range Selector */}
            <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
            />

            {/* Debug Info */}
            <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">🔍 Debug Information</h3>
                    <div className="text-sm text-yellow-800 space-y-1">
                        <p>📅 Date Range: {startDate} to {endDate}</p>
                        <p>📊 Reports Loading: {reportsLoading ? "Yes" : "No"}</p>
                        <p>📈 Reports Count: {reports?.length ?? 0}</p>
                        <p>📋 Summary Available: {summary ? "Yes" : "No"}</p>
                        {reportsError && (
                            <p className="text-red-600">❌ Error: {JSON.stringify(reportsError)}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {summaryLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6 text-center">
                                <LoadingSpinner />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : summary ? (
                <SummaryCards summary={summary} />
            ) : null}

            {/* Charts Section */}
            {reports && reports.length > 0 && (
                <ChartsSection reports={reports} />
            )}

            {/* Daily Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    {reportsLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : reportsError ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-4">Error loading reports</p>
                            <p className="text-sm text-gray-600">
                                {(reportsError as { data?: { message?: string } })?.data?.message || "Unknown error"}
                            </p>
                        </div>
                    ) : !reports || reports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-lg font-semibold mb-2">No reports found</p>
                            <p className="text-sm">Try selecting a different date range</p>
                        </div>
                    ) : (
                        <DailyReportsTable reports={reports} />
                    )}
                </CardContent>
            </Card>

            <PageNavigation />
        </div>
    );
};

export default ReportingDashboard;
