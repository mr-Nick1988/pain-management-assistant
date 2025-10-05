import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {
    Patient,
    PatientUpdate,
    EMR,
    EMRUpdate,
    RecommendationWithVas,
    RecommendationApprovalRejection
} from "../../types/doctor.ts";

interface RootState {
    auth?: {
        token?: string;
    }
}

export const apiDoctorSlice = createApi({
    reducerPath: "apiDoctor",
    tagTypes: ["Patient", "Emr", "Recommendation"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers, {getState}) => {
            const state = getState() as RootState;
            const token = state.auth?.token;
            if (token) headers.set('authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // PATIENT
        getPatientByMrn: builder.query<Patient, string>({
            query: (mrn) => `/doctor/patients/mrn/${mrn}`,
            providesTags: ["Patient"],
        }),
        getPatientByEmail: builder.query<Patient, string>({
            query: (email) => `/doctor/patients/email/${email}`,
            providesTags: ["Patient"],
        }),
        getPatientByPhoneNumber: builder.query<Patient, string>({
            query: (phoneNumber) => `/doctor/patients/phoneNumber/${phoneNumber}`,
            providesTags: ["Patient"],
        }),
        createPatient: builder.mutation<Patient, Patient>({
            query: (patient) => ({
                url: "/doctor/patients",
                method: "POST",
                body: patient,
            }),
            invalidatesTags: ["Patient"],
        }),
        updatePatient: builder.mutation<Patient, { mrn: string; data: PatientUpdate }>({
            query: ({mrn, data}) => ({
                url: `/doctor/patients/${mrn}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Patient"],
        }),
        deletePatient: builder.mutation<void, string>({
            query: (mrn) => ({
                url: `/doctor/patients/${mrn}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Patient"],
        }),

        // EMR
        getEmrByPatientId: builder.query<EMR, string>({
            query: (mrn) => `/doctor/patients/${mrn}/emr/last`,
            providesTags: ["Emr"],
        }),
        getAllEmrByPatientId: builder.query<EMR[], string>({
            query: (mrn) => `/doctor/patients/${mrn}/emr`,
            providesTags: ["Emr"],
        }),
        createEmr: builder.mutation<EMR, { mrn: string; data: EMR }>({
            query: ({mrn, data}) => ({
                url: `/doctor/patients/${mrn}/emr`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Emr"],
        }),
        updateEmr: builder.mutation<EMR, { mrn: string; data: EMRUpdate }>({
            query: ({mrn, data}) => ({
                url: `/doctor/patients/${mrn}/emr`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Emr"],
        }),

        // RECOMMENDATION
        getAllPendingRecommendations: builder.query<RecommendationWithVas[], void>({
            query: () => "/doctor/recommendations/pending",
            providesTags: ["Recommendation"],
        }),
        getLastRecommendation: builder.query<RecommendationWithVas, string>({
            query: (mrn) => `/doctor/patients/${mrn}/recommendations/last`,
            providesTags: ["Recommendation"],
        }),
        approveRecommendation: builder.mutation<void, { mrn: string; data: RecommendationApprovalRejection }>({
            query: ({mrn, data}) => ({
                url: `/doctor/patients/${mrn}/recommendations/approve`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Recommendation"],
        }),
        rejectRecommendation: builder.mutation<void, { mrn: string; data: RecommendationApprovalRejection }>({
            query: ({mrn, data}) => ({
                url: `/doctor/patients/${mrn}/recommendations/reject`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Recommendation"],
        }),
    }),
});

export const {
    useGetPatientByMrnQuery,
    useLazyGetPatientByMrnQuery,
    useGetPatientByEmailQuery,
    useLazyGetPatientByEmailQuery,
    useGetPatientByPhoneNumberQuery,
    useLazyGetPatientByPhoneNumberQuery,
    useCreatePatientMutation,
    useUpdatePatientMutation,
    useDeletePatientMutation,
    useGetEmrByPatientIdQuery,
    useGetAllEmrByPatientIdQuery,
    useCreateEmrMutation,
    useUpdateEmrMutation,
    useGetAllPendingRecommendationsQuery,
    useGetLastRecommendationQuery,
    useLazyGetLastRecommendationQuery,
    useApproveRecommendationMutation,
    useRejectRecommendationMutation,
} = apiDoctorSlice;