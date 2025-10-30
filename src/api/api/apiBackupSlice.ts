import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BackupRequestDTO,
    BackupResponseDTO,
    RestoreRequestDTO,
    BackupStatisticsDTO
} from "../../types/backup";

const BASE_URL = "http://localhost:8080/api/backup";

export const backupApi = createApi({
    reducerPath: "backupApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        timeout: 120000, // 120 seconds for long-running operations (restore can take 15-30s)
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Backup", "Statistics"],
    endpoints: (builder) => ({
        // 1. Создать бэкап
        createBackup: builder.mutation<BackupResponseDTO, BackupRequestDTO>({
            query: (data) => ({
                url: "/create",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Backup", "Statistics"],
        }),

        // 2. Восстановить из бэкапа
        restoreBackup: builder.mutation<string, RestoreRequestDTO>({
            query: (data) => ({
                url: "/restore",
                method: "POST",
                body: data,
                responseHandler: async (response) => {
                    // Backend returns plain text, not JSON
                    const text = await response.text();
                    return text;
                },
            }),
            invalidatesTags: ["Backup"],
        }),

        // 3. История бэкапов
        getBackupHistory: builder.query<BackupResponseDTO[], void>({
            query: () => "/history",
            providesTags: ["Backup"],
        }),

        // 4. Статистика
        getBackupStatistics: builder.query<BackupStatisticsDTO, void>({
            query: () => "/statistics",
            providesTags: ["Statistics"],
        }),

        // 5. Очистка старых бэкапов
        cleanupOldBackups: builder.mutation<string, void>({
            query: () => ({
                url: "/cleanup",
                method: "DELETE",
            }),
            invalidatesTags: ["Backup", "Statistics"],
        }),
    }),
});

export const {
    useCreateBackupMutation,
    useRestoreBackupMutation,
    useGetBackupHistoryQuery,
    useGetBackupStatisticsQuery,
    useCleanupOldBackupsMutation,
} = backupApi;
