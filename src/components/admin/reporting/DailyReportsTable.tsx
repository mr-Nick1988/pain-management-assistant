import React, { useState } from "react";
import { format } from "date-fns";
import type { DailyReportAggregate } from "../../../types/reporting";
import { Button } from "../../ui";
import ExportDialog from "./ExportDialog.tsx";
import { useLazyDownloadDailyExcelQuery, useLazyDownloadDailyPdfQuery } from "../../../api/api/apiReportingSlice";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileText } from "lucide-react";

interface DailyReportsTableProps {
    reports: DailyReportAggregate[];
}

const DailyReportsTable: React.FC<DailyReportsTableProps> = ({ reports }) => {
    const navigate = useNavigate();
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportDate, setExportDate] = useState<string>("");
    const [triggerExcel, { isFetching: downloadingExcel }] = useLazyDownloadDailyExcelQuery();
    const [triggerPdf, { isFetching: downloadingPdf }] = useLazyDownloadDailyPdfQuery();

    const handleExport = (date: string) => {
        setExportDate(date);
        setExportDialogOpen(true);
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

    const handleDownloadExcel = async (date: string) => {
        const res = await triggerExcel(date).unwrap();
        if (res.status === 204 || res.blob.size === 0) {
            alert("No data available for this date (204)");
            return;
        }
        saveBlob(res.blob, res.filename || `daily_report_${date}.xlsx`);
    };

    const handleDownloadPdf = async (date: string) => {
        const res = await triggerPdf(date).unwrap();
        if (res.status === 204 || res.blob.size === 0) {
            alert("No data available for this date (204)");
            return;
        }
        saveBlob(res.blob, res.filename || `daily_report_${date}.pdf`);
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
                                            onClick={() => navigate(`/admin/reporting/daily/${report.reportDate}`)}
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
                                                    disabled={downloadingExcel}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="inline-flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Excel</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(report.reportDate)}
                                                    disabled={downloadingPdf}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4"/> PDF</span>
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

