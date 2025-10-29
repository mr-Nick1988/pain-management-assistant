import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    DailyReportAggregate,
    SummaryStatistics,
    DateRangeFilter,
    EmailReportRequest,
    PeriodEmailReportRequest
} from "../../types/reporting";

const BASE_URL = "http://localhost:8080/api/reports";

export const reportingApi = createApi({
    reducerPath: "reportingApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["DailyReport", "Summary"],
    endpoints: (builder) => ({
        // 1. Получить ежедневные отчеты за период
        getDailyReports: builder.query<DailyReportAggregate[], DateRangeFilter>({
            query: ({ startDate, endDate }) =>
                `/daily?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ["DailyReport"],
        }),

        // 2. Получить отчет за конкретную дату
        getDailyReportByDate: builder.query<DailyReportAggregate, string>({
            query: (date) => `/daily/${date}`,
            providesTags: ["DailyReport"],
        }),

        // 3. Получить последние N отчетов
        getRecentReports: builder.query<DailyReportAggregate[], number | void>({
            query: (limit = 7) => `/daily/recent?limit=${limit}`,
            providesTags: ["DailyReport"],
        }),

        // 4. Получить сводную статистику
        getSummaryStatistics: builder.query<SummaryStatistics, DateRangeFilter>({
            query: ({ startDate, endDate }) =>
                `/summary?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ["Summary"],
        }),

        // 5. Отправить ежедневный отчет по email
        sendDailyReportEmail: builder.mutation<{ message: string }, EmailReportRequest>({
            query: ({ date, email, attachPdf = true, attachExcel = true }) => ({
                url: `/export/pdf/daily/${date}/email?email=${email}&attachPdf=${attachPdf}&attachExcel=${attachExcel}`,
                method: "POST",
            }),
        }),

        // 6. Отправить сводку за период по email
        sendPeriodReportEmail: builder.mutation<{ message: string }, PeriodEmailReportRequest>({
            query: ({ startDate, endDate, email, attachPdf = true, attachExcel = true }) => ({
                url: `/export/pdf/period/email?startDate=${startDate}&endDate=${endDate}&email=${email}&attachPdf=${attachPdf}&attachExcel=${attachExcel}`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetDailyReportsQuery,
    useGetDailyReportByDateQuery,
    useGetRecentReportsQuery,
    useGetSummaryStatisticsQuery,
    useSendDailyReportEmailMutation,
    useSendPeriodReportEmailMutation,
} = reportingApi;
