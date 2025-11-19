import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { analytics_microservice_url } from "../../utils/constants";
import type {
    MicroserviceAnalyticsEvent,
    MicroserviceDailyReportAggregate,
    MicroserviceWeeklyReportAggregate,
    MicroserviceMonthlyReportAggregate,
    MicroserviceEventsQueryParams,
    DailyAggregationParams,
    WeeklyAggregationParams,
    MonthlyAggregationParams,
} from "../../types/analytics";

/**
 * RTK Query API для Analytics & Reporting Microservice (Port 8091)
 * 
 * АРХИТЕКТУРА:
 * - Микросервис потребляет события из Kafka
 * - Хранит сырые события в MongoDB (analytics_db)
 * - Агрегирует данные в PostgreSQL
 * - Предоставляет REST API для аналитики и отчетов
 * 
 * ВАЖНО: Микросервис НЕ имеет встроенной аутентификации!
 * В production должен быть за API Gateway или проксироваться через монолит.
 */
export const analyticsMicroserviceApi = createApi({
    reducerPath: "analyticsMicroserviceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: analytics_microservice_url,
        prepareHeaders: (headers) => {
            // Добавляем JWT токен для будущей интеграции с API Gateway
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["AnalyticsEvents", "DailyReport", "WeeklyReport", "MonthlyReport"],
    endpoints: (builder) => ({
        // ==================== ANALYTICS ENDPOINTS ====================
        
        /**
         * GET /api/analytics/events?start={ISO}&end={ISO}
         * Получить сырые события за период из MongoDB
         */
        getMicroserviceEvents: builder.query<MicroserviceAnalyticsEvent[], MicroserviceEventsQueryParams>({
            query: ({ start, end }) => {
                const params = new URLSearchParams({
                    start,
                    end,
                });
                return `/api/analytics/events?${params.toString()}`;
            },
            providesTags: ["AnalyticsEvents"],
        }),

        /**
         * POST /api/analytics/events
         * Ручное добавление события (fallback)
         */
        createMicroserviceEvent: builder.mutation<MicroserviceAnalyticsEvent, Partial<MicroserviceAnalyticsEvent>>({
            query: (event) => ({
                url: "/api/analytics/events",
                method: "POST",
                body: event,
            }),
            invalidatesTags: ["AnalyticsEvents"],
        }),

        // ==================== REPORTING ENDPOINTS ====================

        /**
         * POST /api/reporting/aggregate/daily?date={YYYY-MM-DD}
         * Запустить дневную агрегацию
         */
        triggerDailyAggregation: builder.mutation<MicroserviceDailyReportAggregate, DailyAggregationParams>({
            query: ({ date }) => ({
                url: `/api/reporting/aggregate/daily?date=${date}`,
                method: "POST",
            }),
            invalidatesTags: ["DailyReport"],
        }),

        /**
         * GET /api/reporting/daily/{YYYY-MM-DD}
         * Получить дневной отчет
         */
        getDailyReport: builder.query<MicroserviceDailyReportAggregate | null, string>({
            query: (date) => `/api/reporting/daily/${date}`,
            providesTags: ["DailyReport"],
            transformResponse: (response: MicroserviceDailyReportAggregate | null) => {
                // Может вернуть null, если агрегация не выполнена
                return response;
            },
        }),

        /**
         * POST /api/reporting/aggregate/weekly?weekStart={YYYY-MM-DD}&weekEnd={YYYY-MM-DD}
         * Запустить недельную агрегацию
         */
        triggerWeeklyAggregation: builder.mutation<MicroserviceWeeklyReportAggregate, WeeklyAggregationParams>({
            query: ({ weekStart, weekEnd }) => ({
                url: `/api/reporting/aggregate/weekly?weekStart=${weekStart}&weekEnd=${weekEnd}`,
                method: "POST",
            }),
            invalidatesTags: ["WeeklyReport"],
        }),

        /**
         * GET /api/reporting/weekly?weekStart={YYYY-MM-DD}&weekEnd={YYYY-MM-DD}
         * Получить недельный отчет (если эндпоинт существует)
         */
        getWeeklyReport: builder.query<MicroserviceWeeklyReportAggregate | null, WeeklyAggregationParams>({
            query: ({ weekStart, weekEnd }) => 
                `/api/reporting/weekly?weekStart=${weekStart}&weekEnd=${weekEnd}`,
            providesTags: ["WeeklyReport"],
        }),

        /**
         * POST /api/reporting/aggregate/monthly?year={YYYY}&month={MM}
         * Запустить месячную агрегацию
         */
        triggerMonthlyAggregation: builder.mutation<MicroserviceMonthlyReportAggregate, MonthlyAggregationParams>({
            query: ({ year, month }) => ({
                url: `/api/reporting/aggregate/monthly?year=${year}&month=${month}`,
                method: "POST",
            }),
            invalidatesTags: ["MonthlyReport"],
        }),

        /**
         * GET /api/reporting/monthly?year={YYYY}&month={MM}
         * Получить месячный отчет (если эндпоинт существует)
         */
        getMonthlyReport: builder.query<MicroserviceMonthlyReportAggregate | null, MonthlyAggregationParams>({
            query: ({ year, month }) => 
                `/api/reporting/monthly?year=${year}&month=${month}`,
            providesTags: ["MonthlyReport"],
        }),
    }),
});

export const {
    // Analytics endpoints
    useGetMicroserviceEventsQuery,
    useLazyGetMicroserviceEventsQuery,
    useCreateMicroserviceEventMutation,
    
    // Reporting endpoints - Daily
    useTriggerDailyAggregationMutation,
    useGetDailyReportQuery,
    useLazyGetDailyReportQuery,
    
    // Reporting endpoints - Weekly
    useTriggerWeeklyAggregationMutation,
    useGetWeeklyReportQuery,
    useLazyGetWeeklyReportQuery,
    
    // Reporting endpoints - Monthly
    useTriggerMonthlyAggregationMutation,
    useGetMonthlyReportQuery,
    useLazyGetMonthlyReportQuery,
} = analyticsMicroserviceApi;
