import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    ExternalVasRecordRequest,
    ExternalVasRecordResponse,
    BatchVasImportResponse,
    ExternalVasHealthResponse,
    ExternalVasRecord,
    GenerateApiKeyRequest,
    GenerateApiKeyResponse,
    GetAllApiKeysResponse,
    ApiKeyUpdateResponse,
    VasMonitorStats,
    VasMonitorFilters
} from "../../types/externalVas";

const BASE_URL = "http://localhost:8080/api";

export const apiExternalVasSlice = createApi({
    reducerPath: "apiExternalVas",
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
    tagTypes: ["ExternalVas", "ApiKeys", "VasMonitor"],
    endpoints: (builder) => ({
        // ========================================
        // External VAS Endpoints (с API Key)
        // ========================================

        // 1. Регистрация VAS с внешнего устройства
        recordExternalVas: builder.mutation<ExternalVasRecordResponse, { apiKey: string; data: ExternalVasRecordRequest }>({
            query: ({ apiKey, data }) => ({
                url: "/external/vas/record",
                method: "POST",
                headers: {
                    "X-API-Key": apiKey,
                },
                body: data,
            }),
            invalidatesTags: ["ExternalVas", "VasMonitor"],
        }),

        // 2. Batch импорт VAS (CSV)
        batchImportVas: builder.mutation<BatchVasImportResponse, { apiKey: string; csvData: string }>({
            query: ({ apiKey, csvData }) => ({
                url: "/external/vas/batch",
                method: "POST",
                headers: {
                    "X-API-Key": apiKey,
                    "Content-Type": "text/csv",
                },
                body: csvData,
            }),
            invalidatesTags: ["ExternalVas", "VasMonitor"],
        }),

        // 3. Health check
        checkExternalVasHealth: builder.query<ExternalVasHealthResponse, void>({
            query: () => "/external/vas/health",
        }),

        // ========================================
        // API Key Management (Admin только)
        // ========================================

        // 4. Генерация нового API ключа
        generateApiKey: builder.mutation<GenerateApiKeyResponse, GenerateApiKeyRequest>({
            query: (params) => ({
                url: "/admin/api-keys/generate",
                method: "POST",
                params: {
                    systemName: params.systemName,
                    description: params.description,
                    expiresInDays: params.expiresInDays,
                    createdBy: params.createdBy || "admin",
                },
            }),
            invalidatesTags: ["ApiKeys"],
        }),

        // 5. Получить все активные ключи
        getAllApiKeys: builder.query<GetAllApiKeysResponse, void>({
            query: () => "/admin/api-keys",
            providesTags: ["ApiKeys"],
        }),

        // 6. Деактивировать ключ
        deactivateApiKey: builder.mutation<ApiKeyUpdateResponse, string>({
            query: (apiKey) => ({
                url: `/admin/api-keys/${apiKey}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ApiKeys"],
        }),

        // 7. Обновить IP whitelist
        updateIpWhitelist: builder.mutation<ApiKeyUpdateResponse, { apiKey: string; ipWhitelist: string }>({
            query: ({ apiKey, ipWhitelist }) => ({
                url: `/admin/api-keys/${apiKey}/whitelist`,
                method: "PUT",
                params: { ipWhitelist },
            }),
            invalidatesTags: ["ApiKeys"],
        }),

        // 8. Обновить rate limit
        updateRateLimit: builder.mutation<ApiKeyUpdateResponse, { apiKey: string; rateLimitPerMinute: number }>({
            query: ({ apiKey, rateLimitPerMinute }) => ({
                url: `/admin/api-keys/${apiKey}/rate-limit`,
                method: "PUT",
                params: { rateLimitPerMinute },
            }),
            invalidatesTags: ["ApiKeys"],
        }),

        // ========================================
        // VAS Monitor Endpoints
        // ========================================

        // 9. Получить VAS записи для мониторинга
        getExternalVasRecords: builder.query<ExternalVasRecord[], VasMonitorFilters>({
            query: (filters) => ({
                url: "/external/vas/records",
                params: {
                    deviceId: filters.deviceId,
                    location: filters.location,
                    timeRange: filters.timeRange,
                    customStartDate: filters.customStartDate,
                    customEndDate: filters.customEndDate,
                    vasLevelMin: filters.vasLevelMin,
                    vasLevelMax: filters.vasLevelMax,
                },
            }),
            providesTags: ["VasMonitor"],
        }),

        // 10. Получить статистику VAS мониторинга
        getVasMonitorStats: builder.query<VasMonitorStats, void>({
            query: () => "/external/vas/stats",
            providesTags: ["VasMonitor"],
        }),
    }),
});

export const {
    useRecordExternalVasMutation,
    useBatchImportVasMutation,
    useCheckExternalVasHealthQuery,
    useGenerateApiKeyMutation,
    useGetAllApiKeysQuery,
    useDeactivateApiKeyMutation,
    useUpdateIpWhitelistMutation,
    useUpdateRateLimitMutation,
    useGetExternalVasRecordsQuery,
    useGetVasMonitorStatsQuery,
} = apiExternalVasSlice;
