import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "../../ui";
import ExportDialog from "./ExportDialog";
import { useGetDailyReportByDateQuery, useLazyDownloadDailyExcelQuery, useLazyDownloadDailyPdfQuery } from "../../../api/api/apiReportingSlice";
import { Users, ClipboardList, AlertTriangle, Settings, User as UserIcon, Pill, FileSpreadsheet, FileText, Mail, ArrowLeft, BarChart3 } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const DailyReportView: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const skip = !date;
  const { data: report, isLoading, error } = useGetDailyReportByDateQuery(date as string, { skip });
  const [triggerExcel, { isFetching: downloadingExcel }] = useLazyDownloadDailyExcelQuery();
  const [triggerPdf, { isFetching: downloadingPdf }] = useLazyDownloadDailyPdfQuery();
  const fbqError = error as FetchBaseQueryError | undefined;
  const is404 = typeof fbqError?.status === "number" && fbqError.status === 404;

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
    if (!date) return;
    const res = await triggerExcel(date).unwrap();
    if (res.status === 204 || res.blob.size === 0) {
      alert("No data available for this date (204)");
      return;
    }
    saveBlob(res.blob, res.filename || `daily_report_${date}.xlsx`);
  };

  const handleDownloadPdf = async () => {
    if (!date) return;
    const res = await triggerPdf(date).unwrap();
    if (res.status === 204 || res.blob.size === 0) {
      alert("No data available for this date (204)");
      return;
    }
    saveBlob(res.blob, res.filename || `daily_report_${date}.pdf`);
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Daily Report
          </h1>
          <p className="text-gray-600 mt-2">Date: {date}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
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

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="h-5 w-40 bg-blue-100 rounded animate-pulse mb-3"/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-blue-100 rounded animate-pulse mb-2"/>
                      <div className="h-6 w-20 bg-blue-200 rounded animate-pulse"/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="h-5 w-52 bg-green-100 rounded animate-pulse mb-3"/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-green-100 rounded animate-pulse mb-2"/>
                      <div className="h-6 w-20 bg-green-200 rounded animate-pulse"/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="h-5 w-40 bg-orange-100 rounded animate-pulse mb-3"/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-orange-100 rounded animate-pulse mb-2"/>
                      <div className="h-6 w-20 bg-orange-200 rounded animate-pulse"/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="h-5 w-48 bg-pink-100 rounded animate-pulse mb-3"/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-pink-100 rounded animate-pulse mb-2"/>
                      <div className="h-6 w-20 bg-pink-200 rounded animate-pulse"/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load report</h2>
              <p className="text-gray-600">{is404 ? "Report not found (404)" : "Unexpected error"}</p>
            </div>
          ) : !report ? (
            <div className="text-center py-12 text-gray-500">No data</div>
          ) : (
            <div className="space-y-6">
              {/* Patients */}
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

              {/* Recommendations */}
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

              {/* Escalations */}
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
                    <p className="text-2xl font-bold text-orange-900">{report.averageResolutionTimeHours.toFixed(1)}h</p>
                  </div>
                </div>
              </div>

              {/* System Performance */}
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
                    <p className="text-2xl font-bold text-purple-900">{report.averageProcessingTimeMs.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {report.totalOperations > 0 ? ((1 - report.failedOperations / report.totalOperations) * 100).toFixed(1) : "100.0"}%
                    </p>
                  </div>
                </div>
              </div>

              {/* User Activity */}
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

              {(() => {
                if (!report?.topDrugsJson) return null;
                try {
                  const obj = JSON.parse(report.topDrugsJson) as Record<string, number>;
                  const items = Object.entries(obj)
                    .map(([drug, count]) => ({ drug, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
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
                } catch {
                  return null;
                }
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {exportDialogOpen && date && (
        <ExportDialog date={date} onClose={() => setExportDialogOpen(false)} />
      )}
    </div>
  );
};

export default DailyReportView;
