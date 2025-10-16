import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {PersonRegister} from "../../types/personRegister.ts";
import type {Patient} from "../../types/common/types.ts";
import type {
    EventStatsDTO,
    UserActivityDTO,
    PerformanceStatsDTO,
    PatientStatsDTO,
    AnalyticsEvent,
    LogEntry,
    DateRangeParams,
    EventsQueryParams,
    LogsQueryParams
} from "../../types/analytics.ts";
import {base_url} from "../../utils/constants";

export const apiAdminSlice = createApi({
    reducerPath: "apiAdmin",
    tagTypes: ["User", "Analytics", "Patients"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers) => {
            // Authentication is handled via session/cookies on the backend
            // No need to add Bearer token headers
            return headers;
        },
        credentials: 'include', // Important: include cookies in requests
    }),
    endpoints: (builder) => ({
        createPerson: builder.mutation({
            query: (userData: PersonRegister) => ({
                url: "/admin/persons",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        getPersons: builder.query<PersonRegister[], void>({
            query: () => "/admin/persons",
            providesTags: ["User"],
        }),
        deletePerson: builder.mutation<void, string>({
            query: (id) => ({
                url: `/admin/persons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),
        updatePerson: builder.mutation<PersonRegister, PersonRegister>({
            query: (person) => ({
                url: `/admin/persons/${person.personId}`,
                method: "PATCH",
                body: person,
            }),
            invalidatesTags: ["User"],
        }),

        // ==================== PATIENTS ENDPOINTS ====================
        
        /**
         * GET /api/admin/persons/patients
         * Получить список всех пациентов в больнице
         */
        getAllPatients: builder.query<Patient[], void>({
            query: () => "/admin/persons/patients",
            providesTags: ["Patients"],
        }),

        // ==================== ANALYTICS ENDPOINTS ====================
        
        /**
         * GET /api/analytics/events/stats
         * Получить общую статистику событий
         */
        getEventStats: builder.query<EventStatsDTO, DateRangeParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.startDate) searchParams.append('startDate', params.startDate);
                if (params?.endDate) searchParams.append('endDate', params.endDate);
                return `/analytics/events/stats${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/users/{userId}/activity
         * Получить активность пользователя
         */
        getUserActivity: builder.query<UserActivityDTO, { userId: string } & DateRangeParams>({
            query: ({ userId, startDate, endDate }) => {
                const searchParams = new URLSearchParams();
                if (startDate) searchParams.append('startDate', startDate);
                if (endDate) searchParams.append('endDate', endDate);
                return `/analytics/users/${userId}/activity${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/performance
         * Получить метрики производительности
         */
        getPerformanceStats: builder.query<PerformanceStatsDTO, DateRangeParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.startDate) searchParams.append('startDate', params.startDate);
                if (params?.endDate) searchParams.append('endDate', params.endDate);
                return `/analytics/performance${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/patients/stats
         * Получить статистику пациентов
         */
        getPatientStats: builder.query<PatientStatsDTO, DateRangeParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.startDate) searchParams.append('startDate', params.startDate);
                if (params?.endDate) searchParams.append('endDate', params.endDate);
                return `/analytics/patients/stats${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/events/recent?limit=50
         * Получить последние события
         */
        getRecentEvents: builder.query<AnalyticsEvent[], EventsQueryParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.limit) searchParams.append('limit', params.limit.toString());
                if (params?.startDate) searchParams.append('startDate', params.startDate);
                if (params?.endDate) searchParams.append('endDate', params.endDate);
                return `/analytics/events/recent${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/events/type/{eventType}
         * Получить события по типу
         */
        getEventsByType: builder.query<AnalyticsEvent[], { eventType: string } & DateRangeParams>({
            query: ({ eventType, startDate, endDate }) => {
                const searchParams = new URLSearchParams();
                if (startDate) searchParams.append('startDate', startDate);
                if (endDate) searchParams.append('endDate', endDate);
                return `/analytics/events/type/${eventType}${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/logs/recent?limit=100
         * Получить последние технические логи
         */
        getRecentLogs: builder.query<LogEntry[], LogsQueryParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.limit) searchParams.append('limit', params.limit.toString());
                if (params?.startDate) searchParams.append('startDate', params.startDate);
                if (params?.endDate) searchParams.append('endDate', params.endDate);
                return `/analytics/logs/recent${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),

        /**
         * GET /api/analytics/logs/level/{level}
         * Получить логи по уровню (INFO/WARN/ERROR)
         */
        getLogsByLevel: builder.query<LogEntry[], { level: string } & DateRangeParams>({
            query: ({ level, startDate, endDate }) => {
                const searchParams = new URLSearchParams();
                if (startDate) searchParams.append('startDate', startDate);
                if (endDate) searchParams.append('endDate', endDate);
                return `/analytics/logs/level/${level}${searchParams.toString() ? `?${searchParams}` : ''}`;
            },
            providesTags: ["Analytics"],
        }),
    }),
});

export const {
    // User Management
    useCreatePersonMutation,
    useGetPersonsQuery,
    useDeletePersonMutation,
    useUpdatePersonMutation,
    // Patients
    useGetAllPatientsQuery,
    // Analytics
    useGetEventStatsQuery,
    useGetUserActivityQuery,
    useGetPerformanceStatsQuery,
    useGetPatientStatsQuery,
    useGetRecentEventsQuery,
    useGetEventsByTypeQuery,
    useGetRecentLogsQuery,
    useGetLogsByLevelQuery,
} = apiAdminSlice;