import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui";
import type { DailyReportAggregate } from "../../../types/reporting";

interface ChartsSectionProps {
    reports: DailyReportAggregate[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ reports }) => {
    // Sort reports by date
    const sortedReports = [...reports].sort((a, b) => 
        new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );

    // Calculate max values for scaling
    const maxVas = Math.max(...sortedReports.map(r => r.averageVasLevel), 10);
    const maxRecommendations = Math.max(...sortedReports.map(r => Math.max(r.approvedRecommendations, r.rejectedRecommendations)));
    const maxLogins = Math.max(...sortedReports.map(r => r.totalLogins));

    // Calculate totals for pie chart
    const totalResolved = sortedReports.reduce((sum, r) => sum + r.resolvedEscalations, 0);
    const totalPending = sortedReports.reduce((sum, r) => sum + r.pendingEscalations, 0);
    const totalEscalations = totalResolved + totalPending;
    const resolvedPercentage = totalEscalations > 0 ? (totalResolved / totalEscalations) * 100 : 0;
    const pendingPercentage = totalEscalations > 0 ? (totalPending / totalEscalations) * 100 : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VAS Level Trend - Line Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>📈 VAS Level Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end justify-between gap-1 px-4 pb-8 relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                            <span>10</span>
                            <span>5</span>
                            <span>0</span>
                        </div>
                        
                        {/* Bars */}
                        <div className="flex-1 flex items-end justify-between gap-1 ml-8">
                            {sortedReports.map((report) => {
                                const height = (report.averageVasLevel / maxVas) * 100;
                                const color = report.averageVasLevel <= 3 ? "bg-green-500" :
                                            report.averageVasLevel <= 6 ? "bg-yellow-500" : "bg-red-500";
                                
                                return (
                                    <div key={report.id} className="flex-1 flex flex-col items-center group">
                                        <div className="relative w-full">
                                            <div
                                                className={`${color} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                                                style={{ height: `${height * 2}px` }}
                                                title={`${format(new Date(report.reportDate), "MMM dd")}: ${report.averageVasLevel.toFixed(1)}`}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                                            {format(new Date(report.reportDate), "MM/dd")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Approved vs Rejected - Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>📊 Approved vs Rejected Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end justify-between gap-1 px-4 pb-8 relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                            <span>{maxRecommendations}</span>
                            <span>{Math.floor(maxRecommendations / 2)}</span>
                            <span>0</span>
                        </div>
                        
                        {/* Grouped bars */}
                        <div className="flex-1 flex items-end justify-between gap-2 ml-8">
                            {sortedReports.map((report) => {
                                const approvedHeight = maxRecommendations > 0 ? (report.approvedRecommendations / maxRecommendations) * 100 : 0;
                                const rejectedHeight = maxRecommendations > 0 ? (report.rejectedRecommendations / maxRecommendations) * 100 : 0;
                                
                                return (
                                    <div key={report.id} className="flex-1 flex gap-1 items-end">
                                        <div
                                            className="flex-1 bg-green-500 rounded-t hover:opacity-80 cursor-pointer"
                                            style={{ height: `${approvedHeight * 2}px`, minHeight: report.approvedRecommendations > 0 ? "4px" : "0" }}
                                            title={`Approved: ${report.approvedRecommendations}`}
                                        />
                                        <div
                                            className="flex-1 bg-red-500 rounded-t hover:opacity-80 cursor-pointer"
                                            style={{ height: `${rejectedHeight * 2}px`, minHeight: report.rejectedRecommendations > 0 ? "4px" : "0" }}
                                            title={`Rejected: ${report.rejectedRecommendations}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded" />
                            <span className="text-sm text-gray-600">Approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded" />
                            <span className="text-sm text-gray-600">Rejected</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Escalations - Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>🥧 Escalations Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        {totalEscalations > 0 ? (
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {/* Resolved segment */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="20"
                                        strokeDasharray={`${resolvedPercentage * 2.51} 251`}
                                    />
                                    {/* Pending segment */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="20"
                                        strokeDasharray={`${pendingPercentage * 2.51} 251`}
                                        strokeDashoffset={`-${resolvedPercentage * 2.51}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{totalEscalations}</p>
                                        <p className="text-xs text-gray-500">Total</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No escalations data</p>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded" />
                            <span className="text-sm text-gray-600">Resolved ({totalResolved})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded" />
                            <span className="text-sm text-gray-600">Pending ({totalPending})</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Activity - Area Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>👥 User Activity (Logins)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end justify-between gap-1 px-4 pb-8 relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                            <span>{maxLogins}</span>
                            <span>{Math.floor(maxLogins / 2)}</span>
                            <span>0</span>
                        </div>
                        
                        {/* Area chart simulation */}
                        <div className="flex-1 flex items-end justify-between gap-1 ml-8">
                            {sortedReports.map((report, index) => {
                                const height = maxLogins > 0 ? (report.totalLogins / maxLogins) * 100 : 0;
                                
                                return (
                                    <div key={report.id} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t hover:opacity-80 cursor-pointer"
                                            style={{ height: `${height * 2}px`, minHeight: report.totalLogins > 0 ? "4px" : "0" }}
                                            title={`${format(new Date(report.reportDate), "MMM dd")}: ${report.totalLogins} logins`}
                                        />
                                        {index < sortedReports.length - 1 && (
                                            <div className="absolute w-full h-px bg-purple-400 opacity-50" style={{ bottom: `${height * 2}px` }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChartsSection;
