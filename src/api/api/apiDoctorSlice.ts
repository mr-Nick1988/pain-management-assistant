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
        searchPatients: builder.query<Patient[], {
            firstName?: string;
            lastName?: string;
            isActive?: boolean;
            birthDate?: string;
            gender?: string;
            insurancePolicyNumber?: string;
            address?: string;
            phoneNumber?: string;
            email?: string;
        }>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.firstName) searchParams.append('firstName', params.firstName);
                if (params.lastName) searchParams.append('lastName', params.lastName);
                if (params.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
                if (params.birthDate) searchParams.append('birthDate', params.birthDate);
                if (params.gender) searchParams.append('gender', params.gender);
                if (params.insurancePolicyNumber) searchParams.append('insurancePolicyNumber', params.insurancePolicyNumber);
                if (params.address) searchParams.append('address', params.address);
                if (params.phoneNumber) searchParams.append('phoneNumber', params.phoneNumber);
                if (params.email) searchParams.append('email', params.email);
                return `/doctor/patients?${searchParams.toString()}`;
            },
            providesTags: ["Patient"],
        }),

        // Diagnosis
        getIcdDiagnoses: builder.query<
            { icdCode: string; description: string }[],
            string
        >({
            query: (queryString) => ({
                url: `/icd/search`,
                params: { query: queryString },
            }),
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
        deleteEmr: builder.mutation<void, string>({
            query: (mrn) => ({
                url: `/doctor/patients/${mrn}/emr`,
                method: "DELETE",
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
    useSearchPatientsQuery,
    useLazySearchPatientsQuery,
    useGetEmrByPatientIdQuery,
    useGetAllEmrByPatientIdQuery,
    useCreateEmrMutation,
    useUpdateEmrMutation,
    useDeleteEmrMutation,
    useGetAllPendingRecommendationsQuery,
    useGetLastRecommendationQuery,
    useLazyGetLastRecommendationQuery,
    useApproveRecommendationMutation,
    useRejectRecommendationMutation,
    useGetIcdDiagnosesQuery,
} = apiDoctorSlice;