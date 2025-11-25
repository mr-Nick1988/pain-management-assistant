import React, { useState } from "react";
import { format } from "date-fns";
import type { DailyReportAggregate } from "../../../types/reporting";
import { Button } from "../../ui";
import ExportDialog from "./ExportDialog";
import { useLazyDownloadDailyExcelQuery, useLazyDownloadDailyPdfQuery } from "../../../api/api/apiReportingSlice";
import { Users, ClipboardList, AlertTriangle, Settings, User as UserIcon, Pill, FileSpreadsheet, FileText, Mail, Info } from "lucide-react";

interface ReportDetailsModalProps {
    report: DailyReportAggregate;
    onClose: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ report, onClose }) => {
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [triggerExcel, { isFetching: downloadingExcel }] = useLazyDownloadDailyExcelQuery();
    const [triggerPdf, { isFetching: downloadingPdf }] = useLazyDownloadDailyPdfQuery();

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

    const handleDownloadExcel = async () => {
        const res = await triggerExcel(report.reportDate).unwrap();
        if (res.status === 204 || res.blob.size === 0) {
            alert("No data available for this date (204)");
            return;
        }
        saveBlob(res.blob, res.filename || `daily_report_${report.reportDate}.xlsx`);
    };

    const handleDownloadPdf = async () => {
        const res = await triggerPdf(report.reportDate).unwrap();
        if (res.status === 204 || res.blob.size === 0) {
            alert("No data available for this date (204)");
            return;
        }
        saveBlob(res.blob, res.filename || `daily_report_${report.reportDate}.pdf`);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Daily Report Details
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {format(new Date(`${report.reportDate}T12:00:00Z`), "MMMM dd, yyyy")}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Patients Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2"><Users className="w-5 h-5" /> Patients</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-blue-700">Registered</p>
                                    <p className="text-2xl font-bold text-blue-900">{report.totalPatientsRegistered}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700">VAS Records</p>
                                    <p className="text-2xl font-bold text-blue-900">{report.totalVasRecords}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700">Average VAS</p>
                                    <p className="text-2xl font-bold text-blue-900">{report.averageVasLevel.toFixed(1)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700">Critical (≥7)</p>
                                    <p className="text-2xl font-bold text-red-600">{report.criticalVasCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Recommendations</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-green-700">Total</p>
                                    <p className="text-2xl font-bold text-green-900">{report.totalRecommendations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{report.approvedRecommendations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{report.rejectedRecommendations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700">Approval Rate</p>
                                    <p className="text-2xl font-bold text-green-900">{report.approvalRate.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Escalations Section */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Escalations</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-orange-700">Total</p>
                                    <p className="text-2xl font-bold text-orange-900">{report.totalEscalations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-orange-700">Resolved</p>
                                    <p className="text-2xl font-bold text-green-600">{report.resolvedEscalations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-orange-700">Pending</p>
                                    <p className="text-2xl font-bold text-orange-600">{report.pendingEscalations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-orange-700">Avg Resolution</p>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {report.averageResolutionTimeHours.toFixed(1)}h
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Performance Section */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2"><Settings className="w-5 h-5" /> System Performance</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-purple-700">Total Operations</p>
                                    <p className="text-2xl font-bold text-purple-900">{report.totalOperations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-700">Failed</p>
                                    <p className="text-2xl font-bold text-red-600">{report.failedOperations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-700">Avg Processing</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {report.averageProcessingTimeMs.toFixed(0)}ms
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-700">Success Rate</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {report.totalOperations > 0 
                                            ? ((1 - report.failedOperations / report.totalOperations) * 100).toFixed(1)
                                            : "100.0"}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User Activity Section */}
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-pink-900 mb-3 flex items-center gap-2"><UserIcon className="w-5 h-5" /> User Activity</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-pink-700">Total Logins</p>
                                    <p className="text-2xl font-bold text-pink-900">{report.totalLogins}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-pink-700">Successful</p>
                                    <p className="text-2xl font-bold text-green-700">{report.successfulLogins}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-pink-700">Failed</p>
                                    <p className="text-2xl font-bold text-red-600">{report.failedLogins}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-pink-700">Unique Users</p>
                                    <p className="text-2xl font-bold text-pink-900">{report.uniqueActiveUsers}</p>
                                </div>
                            </div>
                            {(report.successfulLogins + report.failedLogins) !== report.totalLogins && (
                                <p className="text-xs text-red-600 mt-2">Warning: successful + failed != total</p>
                            )}
                        </div>

                        {/* Top Drugs Section */}
                        {(() => {
                            let items: { drug: string; count: number }[] = [];
                            if (report.topDrugsJson) {
                                try {
                                    const obj = JSON.parse(report.topDrugsJson) as Record<string, number>;
                                    items = Object.entries(obj)
                                        .map(([drug, count]) => ({ drug, count }))
                                        .sort((a, b) => b.count - a.count)
                                        .slice(0, 10);
                                } catch {}
                            }
                            if (items.length === 0) return null;
                            return (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2"><Pill className="w-5 h-5" /> Top Drugs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {items.map(({ drug, count }, idx) => (
                                            <div key={drug} className="flex items-center justify-between p-3 bg-white rounded border border-indigo-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-indigo-600 font-bold">#{idx + 1}</span>
                                                    <span className="text-sm font-medium text-gray-800">{drug}</span>
                                                </div>
                                                <span className="text-sm font-bold text-indigo-700">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Metadata */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><Info className="w-5 h-5" /> Report Metadata</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Created At</p>
                                    <p className="font-semibold text-gray-900">
                                        {format(new Date(report.createdAt), "MMM dd, yyyy HH:mm:ss")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Created By</p>
                                    <p className="font-semibold text-gray-900">{report.createdBy}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="default" onClick={handleDownloadExcel} disabled={downloadingExcel}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                        </Button>
                        <Button variant="default" onClick={handleDownloadPdf} disabled={downloadingPdf}>
                            <FileText className="w-4 h-4 mr-2" /> Export PDF
                        </Button>
                        <Button variant="submit" onClick={() => setExportDialogOpen(true)}>
                            <Mail className="w-4 h-4 mr-2" /> Send Email
                        </Button>
                    </div>
                </div>
            </div>

            {exportDialogOpen && (
                <ExportDialog
                    date={report.reportDate}
                    onClose={() => setExportDialogOpen(false)}
                />
            )}
        </>
    );
};

export default ReportDetailsModal;
