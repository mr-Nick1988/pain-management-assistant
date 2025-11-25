import React, { useState } from "react";
import {
    useGetDailyReportsQuery,
    useGetSummaryStatisticsQuery,
    useGenerateDailyReportMutation,
    useLazyDownloadPeriodExcelQuery,
    useLazyDownloadPeriodPdfQuery,
    useGetReportsHealthQuery,
} from "../../api/api/apiReportingSlice";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation, Button, Badge } from "../ui";
import { BarChart3, FileSpreadsheet, FileText, Rocket, Loader2, Search, CalendarDays, ClipboardList, TrendingUp } from "lucide-react";
import DailyReportsTable from "./reporting/DailyReportsTable";
import SummaryCards from "./reporting/SummaryCards";
import ChartsSection from "./reporting/ChartsSection";
import DateRangeSelector from "./reporting/DateRangeSelector";
import RecentReportsWidget from "./reporting/RecentReportsWidget";

const ReportingDashboard: React.FC = () => {
    // Date range state (default: last 7 days, UTC)
    const endToday = new Date();
    const endInit = endToday.toISOString().slice(0, 10);
    const startInitDate = new Date(endToday);
    startInitDate.setUTCDate(startInitDate.getUTCDate() - 7);
    const startInit = startInitDate.toISOString().slice(0, 10);
    const [startDate, setStartDate] = useState(startInit);
    const [endDate, setEndDate] = useState(endInit);
    const [generateDate, setGenerateDate] = useState(endInit);
    const [regenDaily, setRegenDaily] = useState(false);

    // API queries
    const { data: reports, isLoading: reportsLoading, error: reportsError, refetch: refetchReports } = useGetDailyReportsQuery({
        startDate,
        endDate,
    });

    const { data: summary, isLoading: summaryLoading } = useGetSummaryStatisticsQuery({
        startDate,
        endDate,
    });

    // REST: Generate & Exports
    const [generateDaily, { isLoading: publishingDaily }] = useGenerateDailyReportMutation();
    const [triggerExcel, { isFetching: exportingExcel }] = useLazyDownloadPeriodExcelQuery();
    const [triggerPdf, { isFetching: exportingPdf }] = useLazyDownloadPeriodPdfQuery();
    const { data: health, isLoading: healthLoading, error: healthError } = useGetReportsHealthQuery(undefined, { pollingInterval: 30000 });
    const healthStatus = healthLoading ? "Checking..." : (health?.status || (healthError ? "DOWN" : "Unknown"));
    type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "secondary";
    const healthVariant: BadgeVariant = healthLoading ? "info" : (
        healthStatus === "UP" || healthStatus === "OK" ? "success" :
        healthStatus === "DEGRADED" ? "warning" :
        healthStatus === "DOWN" || healthStatus === "ERROR" ? "error" : "secondary"
    );

    const handleDateRangeChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const saveBlob = (file: Blob, filename: string) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportPeriodExcel = async () => {
        const res = await triggerExcel({ startDate, endDate }).unwrap();
        if (res.status === 204 || res.blob.size === 0) {
            alert("No data available for selected period (204)");
            return;
        }
        saveBlob(res.blob, res.filename || `reports_${startDate}_to_${endDate}.xlsx`);
    };

    const handleExportPeriodPdf = async () => {
        const res = await triggerPdf({ startDate, endDate }).unwrap();
        if (res.status === 204 || res.blob.size === 0) {
            alert("No data available for selected period (204)");
            return;
        }
        saveBlob(res.blob, res.filename || `reports_${startDate}_to_${endDate}.pdf`);
    };

    const handleGenerateDaily = async () => {
        try {
            const res = await generateDaily({ date: generateDate, regenerate: regenDaily }).unwrap();
            alert(`Daily report generated: ${res.status}`);
            await refetchReports();
        } catch (e) {
            console.error(e);
            alert("Failed to generate daily report");
        }
    };

    // Debug: log data
    console.log("Reporting Dashboard Debug:");
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                        <BarChart3 className="w-8 h-8" />
                        Reporting Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Daily reports, analytics, and system statistics
                    </p>
                    <div className="mt-2">
                        <Badge variant={healthVariant} title={health?.message || undefined}>Reports: {healthStatus}</Badge>
                    </div>
                </div>
            </div>

            {/* Date Range Selector */}
            <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
            />

            {/* Period Export & Generate */}
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
                                <Button onClick={handleExportPeriodExcel} disabled={exportingExcel}>
                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                                </Button>
                                <Button onClick={handleExportPeriodPdf} disabled={exportingPdf}>
                                    <FileText className="w-4 h-4 mr-2" /> Export PDF
                                </Button>
                            </div>
                        </div>
                        {/* Generate Daily */}
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
                                    {publishingDaily ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Rocket className="w-4 h-4 mr-2" /> Generate Daily</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Reports */}
            <RecentReportsWidget />

            {/* Debug Info */}
            <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2 inline-flex items-center gap-2"><Search className="w-5 h-5"/> Debug Information</h3>
                    <div className="text-sm text-yellow-800 space-y-1">
                        <p className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Date Range: {startDate} to {endDate}</p>
                        <p className="inline-flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Reports Loading: {reportsLoading ? "Yes" : "No"}</p>
                        <p className="inline-flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Reports Count: {reports?.length ?? 0}</p>
                        <p className="inline-flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Summary Available: {summary ? "Yes" : "No"}</p>
                        {reportsError && (
                            <p className="text-red-600">Error: {JSON.stringify(reportsError)}</p>
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
            {reportsLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle><div className="h-5 w-40 bg-gray-200 rounded animate-pulse"/></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 px-4 pb-8">
                                    <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (reports && reports.length > 0 ? (
                <ChartsSection reports={reports} />
            ) : null)}

            {/* Daily Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    {reportsLoading ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Patients</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">VAS Records</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Avg VAS</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Recommendations</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Approval %</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Escalations</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {[1,2,3,4,5,6,7].map((i) => (
                                        <tr key={i}>
                                            <td className="p-3"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse"/></td>
                                            <td className="p-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"/></td>
                                            <td className="p-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"/></td>
                                            <td className="p-3"><div className="h-5 w-10 bg-gray-200 rounded-full animate-pulse"/></td>
                                            <td className="p-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"/></td>
                                            <td className="p-3"><div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"/></td>
                                            <td className="p-3"><div className="h-4 w-10 bg-gray-200 rounded animate-pulse"/></td>
                                            <td className="p-3"><div className="h-8 w-20 bg-gray-200 rounded animate-pulse"/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
