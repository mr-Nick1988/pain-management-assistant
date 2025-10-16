import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {EMR, Patient, VAS, Recommendation} from "../../types/nurse.ts";

export const apiNurseSlice = createApi({
    reducerPath: "apiNurse",
    tagTypes: ["Patient", "Emr", "Vas", "Recommendation"],
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
        // PATIENT
        getPatients: builder.query<Patient[], {
            firstName?: string;
            lastName?: string;
            isActive?: boolean;
            birthDate?: string
        } | void>({
            query: (params) => {
                if (!params) return "/nurse/patients";
                const query = new URLSearchParams();
                if (params.firstName) query.append("firstName", params.firstName);
                if (params.lastName) query.append("lastName", params.lastName);
                if (params.isActive !== undefined) query.append("isActive", String(params.isActive));
                if (params.birthDate) query.append("birthDate", params.birthDate);
                return `/nurse/patients?${query.toString()}`;
            },
            providesTags: ["Patient"],
        }),
        getPatientByMrn: builder.query<Patient, string>({
            query: (mrn) => `/nurse/patients/mrn/${mrn}`,
            providesTags: ["Patient"],
        }),
        getPatientByEmail: builder.query<Patient, string>({
            query: (email) => `/nurse/patients/email/${email}`,
            providesTags: ["Patient"],
        }),
        getPatientByPhoneNumber: builder.query<Patient, string>({
            query: (phoneNumber) => `/nurse/patients/phoneNumber/${phoneNumber}`,
            providesTags: ["Patient"],
        }),
        createPatient: builder.mutation<Patient, Patient>({
            query: (patient) => ({
                url: "/nurse/patients",
                method: "POST",
                body: patient,
            }),
            invalidatesTags: ["Patient"],
        }),
        updatePatient: builder.mutation<Patient, { mrn: string; data: Partial<Patient> }>({
            query: ({mrn, data}) => ({
                url: `/nurse/patients/${mrn}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Patient"],
        }),
        deletePatient: builder.mutation<void, string>({
            query: (mrn) => ({
                url: `/nurse/patients/${mrn}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Patient"],
        }),

        // EMR
        getEmrByPatientId: builder.query<EMR, string>({
            query: (personId) => `/nurse/patients/${personId}/emr`,
            providesTags: ["Emr"],
        }),
        createEmr: builder.mutation<EMR, { mrn: string; data: EMR }>({
            query: ({mrn, data}) => ({
                url: `/nurse/patients/${mrn}/emr`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Emr"],
        }),
        updateEmr: builder.mutation<EMR, { mrn: string; data: Partial<EMR> }>({
            query: ({mrn, data}) => ({
                url: `/nurse/patients/${mrn}/emr`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Emr"],
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

        // VAS
        createVas: builder.mutation<VAS, { mrn: string; data: VAS }>({
            query: ({mrn, data}) => ({
                url: `/nurse/patients/${mrn}/vas`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Vas"],
        }),
        updateVas: builder.mutation<VAS, { mrn: string; data: Partial<VAS> }>({
            query: ({mrn, data}) => ({
                url: `/nurse/patients/${mrn}/vas`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Vas"],
        }),
        deleteVas: builder.mutation<void, string>({
            query: (mrn) => ({
                url: `/nurse/patients/${mrn}/vas`,
                method: "DELETE",
            }),
            invalidatesTags: ["Vas"],
        }),

        // Recommendation
        // Get all approved recommendations
        getAllApprovedRecommendations: builder.query<Recommendation[], void>({
            query: () => `/nurse/recommendations/approved`,
            providesTags: ["Recommendation"],
        }),
        createRecommendation: builder.mutation<Recommendation, { mrn: string; }>({
            query: ({mrn}) => ({
                url: `/nurse/patients/${mrn}/recommendation`,
                method: "POST",
            }),
            invalidatesTags: ["Recommendation"],
        }),

        getRecommendationByPatientId: builder.query<Recommendation, string>({
            query: (mrn) => `/nurse/patients/${mrn}/recommendation`,
            providesTags: ["Recommendation"],
        }),
    }),
});
export const {
    useGetPatientsQuery,
    useGetPatientByMrnQuery,
    useLazyGetPatientByMrnQuery,
    useLazyGetPatientByEmailQuery,
    useGetPatientByEmailQuery,
    useGetPatientByPhoneNumberQuery,
    useLazyGetPatientByPhoneNumberQuery,
    useCreatePatientMutation,
    useUpdatePatientMutation,
    useDeletePatientMutation,
    useGetEmrByPatientIdQuery,
    useCreateEmrMutation,
    useUpdateEmrMutation,
    useCreateVasMutation,
    useUpdateVasMutation,
    useDeleteVasMutation,
    useCreateRecommendationMutation,
    useGetRecommendationByPatientIdQuery,
    useGetIcdDiagnosesQuery,
    useGetAllApprovedRecommendationsQuery,
} = apiNurseSlice;
