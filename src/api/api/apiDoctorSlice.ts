import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {Patient, PatientCreation, Recommendation, RecommendationApproval} from "../../types/recommendation.ts";


interface RootState {
    auth?: {
        token?: string;
    }
}

export const apiDoctorSlice = createApi({
    reducerPath: "apiDoctor",
    tagTypes: ["Recommendations","Patients"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers, {getState}) => {
            const state = getState() as RootState;
            const token = state.auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getRecommendations: builder.query<Recommendation[], void>({
            query: () => "/doctor/recommendations",
            providesTags: ["Recommendations"],
        }),
        getRecommendation: builder.query<Recommendation, string>({
            query: (id) => `/doctor/recommendations/${id}`,
            providesTags: (_result, _error, id) => [{type: "Recommendations", id}],
        }),
        approveRecommendation: builder.mutation<Recommendation, RecommendationApproval>({
            query: ({recommendationId, ...data}) => ({
                url: `/doctor/recommendations/${recommendationId}/approve`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Recommendations"],
        }),
        rejectRecommendation: builder.mutation<Recommendation, RecommendationApproval>({
            query: ({recommendationId, ...data}) => ({
                url: `/doctor/recommendations/${recommendationId}/reject`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Recommendations"],
        }),
        updateRecommendation: builder.mutation <Recommendation, Partial<Recommendation> & { id: string }>({
            query: ({id, ...data}) => ({
                url: `/doctor/recommendations/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (_result, _error, arg) => [{type: "Recommendations", id: arg.id}],
        }),
        getPatients: builder.query<Patient[], void>({
            query: () => "/doctor/patients",
            providesTags: ["Patients"],
        }),
        getPatient: builder.query<Patient, string>({
            query: (id) => `/doctor/patients/${id}`,
            providesTags: (_result, _error, id) => [{type: "Patients", id}],
        }),
        createPatient: builder.mutation<Patient, PatientCreation>({
            query: (patientData) => ({
                url: "/doctor/patients",
                method: "POST",
                body: patientData,
            }),
            invalidatesTags: ["Patients"],
        }),
    }),
});
export const {
    useGetRecommendationsQuery,
    useGetRecommendationQuery,
    useApproveRecommendationMutation,
    useRejectRecommendationMutation,
    useUpdateRecommendationMutation,
    useGetPatientsQuery,
    useGetPatientQuery,
    useCreatePatientMutation,
} = apiDoctorSlice;