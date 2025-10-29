import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_url } from "../../utils/constants.ts";
import type {
    AnesthesiologistRecommendationCreate,
    AnesthesiologistRecommendationUpdate,
} from "../../types/anesthesiologist.ts";
import type {
    Recommendation,
    RecommendationApprovalRejection,
    RecommendationWithVas,
    Patient,
    EMR
} from "../../types/common/types.ts";

export const apiAnesthesiologistSlice = createApi({
    reducerPath: "apiAnesthesiologist",
    baseQuery: fetchBaseQuery({
        baseUrl: base_url + "/anesthesiologist/",
        credentials: "include",
    }),
    tagTypes: ["Recommendation", "Escalation", "Patient", "EMR"],
    endpoints: (builder) => ({

        // ======== PATIENT & EMR ======== //

        getPatientByMrn: builder.query<Patient, string>({
            query: (mrn) => `patients/mrn/${mrn}`,
            providesTags: ["Patient"],
        }),

        getLastEmrByPatientMrn: builder.query<EMR, string>({
            query: (mrn) => `patients/${mrn}/emr/last`,
            providesTags: ["EMR"],
        }),

        // ======== ESCALATIONS & REJECTED ======== //

        getAllEscalations: builder.query<RecommendationWithVas[], void>({
            query: () => `escalations`,
            providesTags: ["Escalation"],
        }),

        getAllRejectedRecommendations: builder.query<RecommendationWithVas[], void>({
            query: () => `recommendations/rejected`,
            providesTags: ["Recommendation"],
        }),

        // ======== RECOMMENDATION ACTIONS ======== //

        approveRecommendation: builder.mutation<
            Recommendation,
            { recommendationId: number; dto: RecommendationApprovalRejection }
        >({
            query: ({ recommendationId, dto }) => ({
                url: `recommendations/${recommendationId}/approve`,
                method: "POST",
                body: dto,
            }),
            invalidatesTags: ["Recommendation", "Escalation"],
        }),

        rejectRecommendation: builder.mutation<
            Recommendation,
            { recommendationId: number; dto: RecommendationApprovalRejection }
        >({
            query: ({ recommendationId, dto }) => ({
                url: `recommendations/${recommendationId}/reject`,
                method: "POST",
                body: dto,
            }),
            invalidatesTags: ["Recommendation", "Escalation"],
        }),

        createRecommendationAfterRejection: builder.mutation<
            Recommendation,
            AnesthesiologistRecommendationCreate
        >({
            query: (dto) => ({
                url: `recommendations`,
                method: "POST",
                body: dto,
            }),
            invalidatesTags: ["Recommendation"],
        }),

        updateRecommendation: builder.mutation<
            Recommendation,
            { id: number; dto: AnesthesiologistRecommendationUpdate }
        >({
            query: ({ id, dto }) => ({
                url: `recommendations/${id}/update`,
                method: "PUT",
                body: dto,
            }),
            invalidatesTags: ["Recommendation", "Escalation"],
        }),

        // ======== PATIENT HISTORY (VAS + Recommendations) ======== //
        getPatientHistory: builder.query<RecommendationWithVas[], string>({
            query: (mrn) => `patients/${mrn}/history`,
            // кэш помечаем как Recommendation, чтобы инвалидация после approve/reject/create подтягивала историю
            providesTags: ["Recommendation"],
        }),
    }),
});

export const {
    useGetAllEscalationsQuery,
    useApproveRecommendationMutation,
    useRejectRecommendationMutation,
    useCreateRecommendationAfterRejectionMutation,
    useUpdateRecommendationMutation,
    useGetAllRejectedRecommendationsQuery,
    useGetPatientByMrnQuery,
    useGetLastEmrByPatientMrnQuery,
    useGetPatientHistoryQuery,
    useLazyGetPatientHistoryQuery
} = apiAnesthesiologistSlice;