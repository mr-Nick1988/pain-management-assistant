import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth.ts";
import type {
    DailyReportAggregate,
    SummaryStatistics,
    DateRangeFilter,
    EmailReportRequest,
    PeriodEmailReportRequest,
    FileDownload,
    ReportsHealthStatus,
} from "../../types/reporting";

export const reportingApi = createApi({
    reducerPath: "reportingApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["DailyReport", "Summary"],
    endpoints: (builder) => ({
        // 1. Получить ежедневные отчеты за период
        getDailyReports: builder.query<DailyReportAggregate[], DateRangeFilter>({
            query: ({ startDate, endDate }) =>
                `/reports/daily?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ["DailyReport"],
        }),

        // 2. Получить отчет за конкретную дату
        getDailyReportByDate: builder.query<DailyReportAggregate, string>({
            query: (date) => `/reports/daily/${date}`,
            providesTags: ["DailyReport"],
        }),

        // 3. Получить последние N отчетов
        getRecentReports: builder.query<DailyReportAggregate[], number | void>({
            query: (limit = 7) => `/reports/recent?limit=${limit}`,
            providesTags: ["DailyReport"],
        }),

        // 4. Получить сводную статистику
        getSummaryStatistics: builder.query<SummaryStatistics, DateRangeFilter>({
            query: ({ startDate, endDate }) =>
                `/reports/summary?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ["Summary"],
        }),

        // 4.1 Health
        getReportsHealth: builder.query<ReportsHealthStatus, void>({
            query: () => `/reports/health`,
        }),

        // 5. Отправить ежедневный отчет по email
        sendDailyReportEmail: builder.mutation<{ message: string }, EmailReportRequest>({
            query: ({ date, email, attachPdf = true, attachExcel = true }) => ({
                url: `/reports/export/pdf/daily/${date}/email?email=${email}&attachPdf=${attachPdf}&attachExcel=${attachExcel}`,
                method: "POST",
            }),
        }),

        // 6. Отправить сводку за период по email
        sendPeriodReportEmail: builder.mutation<{ message: string }, PeriodEmailReportRequest>({
            query: ({ startDate, endDate, email, attachPdf = true, attachExcel = true }) => ({
                url: `/reports/export/pdf/period/email?startDate=${startDate}&endDate=${endDate}&email=${email}&attachPdf=${attachPdf}&attachExcel=${attachExcel}`,
                method: "POST",
            }),
        }),

        // ========= File Exports =========
        // Daily Excel
        downloadDailyExcel: builder.query<FileDownload, string>({
            query: (date) => ({
                url: `/reports/daily/${date}/export/excel`,
                method: "GET",
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
                    let filename: string | undefined;
                    if (disposition) {
                        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
                        if (match) filename = decodeURIComponent(match[1] || match[2]);
                    }
                    const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || undefined;
                    const status = response.status;
                    return { blob, filename, contentType, status } as FileDownload;
                },
            }),
        }),
        // Daily PDF
        downloadDailyPdf: builder.query<FileDownload, string>({
            query: (date) => ({
                url: `/reports/daily/${date}/export/pdf`,
                method: "GET",
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
                    let filename: string | undefined;
                    if (disposition) {
                        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
                        if (match) filename = decodeURIComponent(match[1] || match[2]);
                    }
                    const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || undefined;
                    const status = response.status;
                    return { blob, filename, contentType, status } as FileDownload;
                },
            }),
        }),
        // Period Excel
        downloadPeriodExcel: builder.query<FileDownload, DateRangeFilter>({
            query: ({ startDate, endDate }) => ({
                url: `/reports/export/excel?startDate=${startDate}&endDate=${endDate}`,
                method: "GET",
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
                    let filename: string | undefined;
                    if (disposition) {
                        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
                        if (match) filename = decodeURIComponent(match[1] || match[2]);
                    }
                    const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || undefined;
                    const status = response.status;
                    return { blob, filename, contentType, status } as FileDownload;
                },
            }),
        }),
        // Period PDF
        downloadPeriodPdf: builder.query<FileDownload, DateRangeFilter>({
            query: ({ startDate, endDate }) => ({
                url: `/reports/export/pdf?startDate=${startDate}&endDate=${endDate}`,
                method: "GET",
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
                    let filename: string | undefined;
                    if (disposition) {
                        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
                        if (match) filename = decodeURIComponent(match[1] || match[2]);
                    }
                    const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || undefined;
                    const status = response.status;
                    return { blob, filename, contentType, status } as FileDownload;
                },
            }),
        }),

        // ========= REST: Generate Daily Report =========
        generateDailyReport: builder.mutation<{ status: string }, { date: string; regenerate?: boolean }>({
            query: ({ date, regenerate = false }) => ({
                url: `/reports/daily/${date}/generate?regenerate=${regenerate}`,
                method: "POST",
            }),
            invalidatesTags: ["DailyReport"],
        }),
    }),
});

export const {
    useGetDailyReportsQuery,
    useGetDailyReportByDateQuery,
    useLazyGetDailyReportByDateQuery,
    useGetRecentReportsQuery,
    useLazyGetRecentReportsQuery,
    useGetSummaryStatisticsQuery,
    useSendDailyReportEmailMutation,
    useSendPeriodReportEmailMutation,
    useGetReportsHealthQuery,
    useDownloadDailyExcelQuery,
    useLazyDownloadDailyExcelQuery,
    useDownloadDailyPdfQuery,
    useLazyDownloadDailyPdfQuery,
    useDownloadPeriodExcelQuery,
    useLazyDownloadPeriodExcelQuery,
    useDownloadPeriodPdfQuery,
    useLazyDownloadPeriodPdfQuery,
    useGenerateDailyReportMutation,
} = reportingApi;
