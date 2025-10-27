import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    FhirPatientDTO,
    EmrImportResultDTO,
    FhirObservationDTO,
    EmrSyncResultDTO,
    ImportCheckDTO,
    FhirSearchParams
} from "../../types/fhir";

const BASE_URL = "http://localhost:8080/api/emr";

export const apiFhirSlice = createApi({
    reducerPath: "apiFhir",
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
    tagTypes: ["FhirPatients", "SyncStatus"],
    endpoints: (builder) => ({
        // 1. Поиск пациентов в FHIR системе
        searchFhirPatients: builder.query<FhirPatientDTO[], FhirSearchParams>({
            query: (params) => ({
                url: "/search",
                params,
            }),
            providesTags: ["FhirPatients"],
        }),

        // 2. Импорт пациента из FHIR системы
        importPatientFromFhir: builder.mutation<EmrImportResultDTO, { fhirPatientId: string; importedBy?: string }>({
            query: ({ fhirPatientId, importedBy = "system" }) => ({
                url: `/import/${fhirPatientId}`,
                method: "POST",
                params: { importedBy },
            }),
            invalidatesTags: ["FhirPatients", "SyncStatus"],
        }),

        // 3. Генерация мокового пациента
        generateMockPatient: builder.mutation<EmrImportResultDTO, { createdBy?: string }>({
            query: ({ createdBy = "system" }) => ({
                url: "/mock/generate",
                method: "POST",
                params: { createdBy },
            }),
            invalidatesTags: ["FhirPatients"],
        }),

        // 4. Генерация batch моковых пациентов
        generateBatchMockPatients: builder.mutation<EmrImportResultDTO[], { count?: number; createdBy?: string }>({
            query: ({ count = 10, createdBy = "system" }) => ({
                url: "/mock/generate-batch",
                method: "POST",
                params: { count, createdBy },
            }),
            invalidatesTags: ["FhirPatients"],
        }),

        // 5. Получить лабораторные анализы пациента
        getFhirObservations: builder.query<FhirObservationDTO[], string>({
            query: (fhirPatientId) => `/observations/${fhirPatientId}`,
        }),

        // 6. Проверить, импортирован ли пациент
        checkImportStatus: builder.query<ImportCheckDTO, string>({
            query: (fhirPatientId) => `/check-import/${fhirPatientId}`,
        }),

        // 7. Синхронизация всех FHIR пациентов
        syncAllPatients: builder.mutation<EmrSyncResultDTO, void>({
            query: () => ({
                url: "/sync/all",
                method: "POST",
            }),
            invalidatesTags: ["SyncStatus"],
        }),

        // 8. Синхронизация конкретного пациента
        syncPatient: builder.mutation<string, string>({
            query: (mrn) => ({
                url: `/sync/patient/${mrn}`,
                method: "POST",
            }),
            invalidatesTags: ["SyncStatus"],
        }),
    }),
});

export const {
    useSearchFhirPatientsQuery,
    useLazySearchFhirPatientsQuery,
    useImportPatientFromFhirMutation,
    useGenerateMockPatientMutation,
    useGenerateBatchMockPatientsMutation,
    useGetFhirObservationsQuery,
    useLazyGetFhirObservationsQuery,
    useCheckImportStatusQuery,
    useLazyCheckImportStatusQuery,
    useSyncAllPatientsMutation,
    useSyncPatientMutation,
} = apiFhirSlice;
