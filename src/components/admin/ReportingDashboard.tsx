import React, { useState } from "react";
import { format, subDays } from "date-fns";
import {
    useGetDailyReportsQuery,
    useGetSummaryStatisticsQuery,
    useGenerateDailyCommandMutation,
    useGenerateYesterdayCommandMutation,
    useGeneratePeriodCommandMutation,
} from "../../api/api/apiReportingSlice";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation, Button } from "../ui";
import { monolith_root_url } from "../../utils/constants";
import DailyReportsTable from "./reporting/DailyReportsTable";
import SummaryCards from "./reporting/SummaryCards";
import ChartsSection from "./reporting/ChartsSection";
import DateRangeSelector from "./reporting/DateRangeSelector";

const ReportingDashboard: React.FC = () => {
    // Date range state (default: last 7 days)
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [generateDate, setGenerateDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [regenDaily, setRegenDaily] = useState(false);
    const [regenYesterday, setRegenYesterday] = useState(false);
    const [regenPeriod, setRegenPeriod] = useState(false);

    // API queries
    const { data: reports, isLoading: reportsLoading, error: reportsError } = useGetDailyReportsQuery({
        startDate,
        endDate,
    });

    const { data: summary, isLoading: summaryLoading } = useGetSummaryStatisticsQuery({
        startDate,
        endDate,
    });

    // Kafka commands
    const [generateDaily, { isLoading: publishingDaily }] = useGenerateDailyCommandMutation();
    const [generateYesterday, { isLoading: publishingYesterday }] = useGenerateYesterdayCommandMutation();
    const [generatePeriod, { isLoading: publishingPeriod }] = useGeneratePeriodCommandMutation();

    const handleDateRangeChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handleExportPeriodExcel = () => {
        const url = `${monolith_root_url}/api/reports/export/excel?startDate=${startDate}&endDate=${endDate}`;
        window.open(url, "_blank");
    };

    const handleExportPeriodPdf = () => {
        const url = `${monolith_root_url}/api/reports/export/pdf?startDate=${startDate}&endDate=${endDate}`;
        window.open(url, "_blank");
    };

    const handleGenerateDaily = async () => {
        try {
            const res = await generateDaily({ date: generateDate, regenerate: regenDaily }).unwrap();
            alert(`Daily command published: ${res.status}`);
        } catch (e) {
            alert("Failed to publish daily command");
        }
    };

    const handleGenerateYesterday = async () => {
        try {
            const res = await generateYesterday({ regenerate: regenYesterday }).unwrap();
            alert(`Yesterday command published: ${res.status}`);
        } catch (e) {
            alert("Failed to publish yesterday command");
        }
    };

    const handleGeneratePeriod = async () => {
        try {
            const res = await generatePeriod({ startDate, endDate, regenerate: regenPeriod }).unwrap();
            alert(`Period command published: ${res.status}`);
        } catch (e) {
            alert("Failed to publish period command");
        }
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

            {/* Period Export & Kafka Commands */}
            <Card>
                <CardHeader>
                    <CardTitle>Operations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Period Export */}
                        <div>
                            <h3 className="font-semibold mb-3">Export Period</h3>
                            <div className="flex gap-2">
                                <Button onClick={handleExportPeriodExcel}>📊 Export Excel</Button>
                                <Button onClick={handleExportPeriodPdf}>📄 Export PDF</Button>
                            </div>
                        </div>
                        {/* Kafka Commands */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Generate Daily (date)</label>
                                    <input
                                        type="date"
                                        value={generateDate}
                                        onChange={(e) => setGenerateDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={regenDaily} onChange={(e) => setRegenDaily(e.target.checked)} />
                                    Regenerate
                                </label>
                                <Button onClick={handleGenerateDaily} disabled={publishingDaily}>
                                    {publishingDaily ? "⏳ Publishing..." : "🚀 Generate Daily"}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                <div className="text-sm font-medium text-gray-700">Generate Yesterday</div>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={regenYesterday} onChange={(e) => setRegenYesterday(e.target.checked)} />
                                    Regenerate
                                </label>
                                <Button onClick={handleGenerateYesterday} disabled={publishingYesterday}>
                                    {publishingYesterday ? "⏳ Publishing..." : "🚀 Generate Yesterday"}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                <div className="text-sm font-medium text-gray-700">Generate Period</div>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={regenPeriod} onChange={(e) => setRegenPeriod(e.target.checked)} />
                                    Regenerate
                                </label>
                                <Button onClick={handleGeneratePeriod} disabled={publishingPeriod}>
                                    {publishingPeriod ? "⏳ Publishing..." : "🚀 Generate Period"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
