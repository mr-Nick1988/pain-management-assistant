import React, { useState } from "react";
import { format } from "date-fns";
import type { DailyReportAggregate } from "../../../types/reporting";
import { Button } from "../../ui";
import ReportDetailsModal from "./ReportDetailsModal.tsx";
import ExportDialog from "./ExportDialog.tsx";
import { monolith_root_url } from "../../../utils/constants";

interface DailyReportsTableProps {
    reports: DailyReportAggregate[];
}

const DailyReportsTable: React.FC<DailyReportsTableProps> = ({ reports }) => {
    const [selectedReport, setSelectedReport] = useState<DailyReportAggregate | null>(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportDate, setExportDate] = useState<string>("");

    const handleViewDetails = (report: DailyReportAggregate) => {
        setSelectedReport(report);
    };

    const handleExport = (date: string) => {
        setExportDate(date);
        setExportDialogOpen(true);
    };

    const handleDownloadExcel = (date: string) => {
        const url = `${monolith_root_url}/api/reports/daily/${date}/export/excel`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `daily_report_${date}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPdf = (date: string) => {
        const url = `${monolith_root_url}/api/reports/daily/${date}/export/pdf`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `daily_report_${date}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
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
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm font-medium text-gray-900">
                                    {format(new Date(report.reportDate), "MMM dd, yyyy")}
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {report.totalPatientsRegistered}
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {report.totalVasRecords}
                                </td>
                                <td className="p-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                        report.averageVasLevel <= 3 ? "bg-green-100 text-green-800" :
                                        report.averageVasLevel <= 6 ? "bg-yellow-100 text-yellow-800" :
                                        "bg-red-100 text-red-800"
                                    }`}>
                                        {report.averageVasLevel.toFixed(1)}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {report.totalRecommendations}
                                </td>
                                <td className="p-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                        report.approvalRate >= 80 ? "bg-green-100 text-green-800" :
                                        report.approvalRate >= 60 ? "bg-yellow-100 text-yellow-800" :
                                        "bg-red-100 text-red-800"
                                    }`}>
                                        {report.approvalRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {report.totalEscalations}
                                    {report.pendingEscalations > 0 && (
                                        <span className="ml-2 text-xs text-orange-600">
                                            ({report.pendingEscalations} pending)
                                        </span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(report)}
                                        >
                                            View
                                        </Button>
                                        <div className="relative group">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleExport(report.reportDate)}
                                            >
                                                Export
                                            </Button>
                                            <div className="absolute hidden group-hover:block top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                                <button
                                                    onClick={() => handleDownloadExcel(report.reportDate)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    📊 Excel
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(report.reportDate)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    📄 PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {selectedReport && (
                <ReportDetailsModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}

            {exportDialogOpen && (
                <ExportDialog
                    date={exportDate}
                    onClose={() => setExportDialogOpen(false)}
                />
            )}
        </>
    );
};

export default DailyReportsTable;
