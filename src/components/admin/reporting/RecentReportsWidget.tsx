import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Button } from "../../ui";
import { useGetRecentReportsQuery, useLazyDownloadDailyExcelQuery, useLazyDownloadDailyPdfQuery } from "../../../api/api/apiReportingSlice";
import type { DailyReportAggregate } from "../../../types/reporting";

const RecentReportsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, error } = useGetRecentReportsQuery(30);
  const [triggerExcel] = useLazyDownloadDailyExcelQuery();
  const [triggerPdf] = useLazyDownloadDailyPdfQuery();
  const [downloadingExcelDate, setDownloadingExcelDate] = React.useState<string | null>(null);
  const [downloadingPdfDate, setDownloadingPdfDate] = React.useState<string | null>(null);

  const reports: DailyReportAggregate[] = (data ?? []).slice().sort((a, b) =>
    new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );

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

  const handleDownloadExcel = async (date: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setDownloadingExcelDate(date);
      const res = await triggerExcel(date).unwrap();
      if (res.status === 204 || res.blob.size === 0) {
        alert("No data available for this date (204)");
      } else {
        saveBlob(res.blob, res.filename || `daily_report_${date}.xlsx`);
      }
    } finally {
      setDownloadingExcelDate(null);
    }
  };

  const handleDownloadPdf = async (date: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setDownloadingPdfDate(date);
      const res = await triggerPdf(date).unwrap();
      if (res.status === 204 || res.blob.size === 0) {
        alert("No data available for this date (204)");
      } else {
        saveBlob(res.blob, res.filename || `daily_report_${date}.pdf`);
      }
    } finally {
      setDownloadingPdfDate(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || isFetching ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Patients</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Avg VAS</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Recs (A/R)</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Esc</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Logins</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1,2,3,4,5].map((i) => (
                  <tr key={i}>
                    <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="p-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="p-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="p-3"><div className="h-4 w-10 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="p-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"/></td>
                    <td className="p-3"><div className="h-8 w-20 bg-gray-200 rounded animate-pulse"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-600 text-sm">Failed to load recent reports</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No recent reports</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Patients</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Avg VAS</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Recs (A/R)</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Esc</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Logins</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((r) => {
                  const isExcel = downloadingExcelDate === r.reportDate;
                  const isPdf = downloadingPdfDate === r.reportDate;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/reporting/daily/${r.reportDate}`)}
                    >
                      <td className="p-3 text-sm font-medium text-gray-900">{r.reportDate}</td>
                      <td className="p-3 text-sm text-gray-700">{r.totalPatientsRegistered}</td>
                      <td className="p-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          r.averageVasLevel <= 3 ? "bg-green-100 text-green-800" :
                          r.averageVasLevel <= 6 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {r.averageVasLevel.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {r.totalRecommendations} (
                        <span className="text-green-700">{r.approvedRecommendations}</span>/
                        <span className="text-red-700">{r.rejectedRecommendations}</span>)
                      </td>
                      <td className="p-3 text-sm text-gray-700">{r.totalEscalations}</td>
                      <td className="p-3 text-sm text-gray-700">{r.totalLogins}</td>
                      <td className="p-3">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" disabled={isExcel} onClick={(e) => handleDownloadExcel(r.reportDate, e)}>
                            {isExcel ? "Excel…" : "Excel"}
                          </Button>
                          <Button size="sm" variant="outline" disabled={isPdf} onClick={(e) => handleDownloadPdf(r.reportDate, e)}>
                            {isPdf ? "PDF…" : "PDF"}
                          </Button>
                          <Button size="sm" onClick={() => navigate(`/admin/reporting/daily/${r.reportDate}`)}>Open</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReportsWidget;
