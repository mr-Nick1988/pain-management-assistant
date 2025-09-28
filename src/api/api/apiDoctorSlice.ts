import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {Patient, PatientCreation, Recommendation, RecommendationApproval} from "../../types/./doctor.ts";


export const apiDoctorSlice = createApi({
    reducerPath: "apiDoctor",
    tagTypes: ["Recommendations", "Patients"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers) => {
            // Authentication is handled via session/cookies on the backend
            // No need to add Bearer token headers
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
            query: ({createdBy, ...patientData}) => ({
                url: `/doctor/patients?createdBy=${createdBy}`,
                method: "POST",
                body: patientData,
            }),
            invalidatesTags: ["Patients"],
        }),
        searchPatients: builder.query<Patient[], {
            firstName?: string;
            lastName?: string;
            dateOfBirth?: string;
            insurance?: string;
            mrn?: string;
        }>({
            query: (params) => ({
                url: "/doctor/patients/search",
                method: "GET",
                params,
            }),
            providesTags: ["Patients"],
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
    useSearchPatientsQuery,
    useLazySearchPatientsQuery,
} = apiDoctorSlice;