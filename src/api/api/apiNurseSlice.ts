import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {EMR, Patient, VAS, Recommendation} from "../../types/nurse.ts";

interface RootState {
    auth?: {
        token?: string;
    }
}


export const apiNurseSlice = createApi({
    reducerPath: "apiNurse",
    tagTypes: ["Patient", "Emr", "Vas", "Recommendation"],
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
        getPatients: builder.query<Patient[], void>({
            query: () => "/nurse/patients",
            providesTags: ["Patient"],
        }),
        getPatientById: builder.query<Patient, string>({
            query: (personId) => `/nurse/patients/${personId}`,
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
        updatePatient: builder.mutation<Patient, { personId: string; data: Partial<Patient> }>({
            query: ({personId, data}) => ({
                url: `/nurse/patients/${personId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Patient"],
        }),
        deletePatient: builder.mutation<void, string>({
            query: (personId) => ({
                url: `/nurse/patients/${personId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Patient"],
        }),

        // EMR
        getEmrByPatientId: builder.query<EMR, string>({
            query: (personId) => `/nurse/patients/${personId}/emr`,
            providesTags: ["Emr"],
        }),
        createEmr: builder.mutation<EMR, { personId: string; data: EMR }>({
            query: ({personId, data}) => ({
                url: `/nurse/patients/${personId}/emr`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Emr"],
        }),
        updateEmr: builder.mutation<EMR, { personId: string; data: Partial<EMR> }>({
            query: ({personId, data}) => ({
                url: `/nurse/patients/${personId}/emr`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Emr"],
        }),

        // VAS
        createVas: builder.mutation<VAS, { personId: string; data: VAS }>({
            query: ({personId, data}) => ({
                url: `/nurse/patients/${personId}/vas`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Vas"],
        }),
        updateVas: builder.mutation<VAS, { personId: string; data: Partial<VAS> }>({
            query: ({personId, data}) => ({
                url: `/nurse/patients/${personId}/vas`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Vas"],
        }),
        deleteVas: builder.mutation<void, string>({
            query: (personId) => ({
                url: `/nurse/patients/${personId}/vas`,
                method: "DELETE",
            }),
            invalidatesTags: ["Vas"],
        }),

        // Recommendation
        createRecommendation: builder.mutation<Recommendation, { personId: string; data: Recommendation }>({
            query: ({personId, data}) => ({
                url: `/nurse/patients/${personId}/recommendation`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Recommendation"],
        }),
    }),
});
export const {
    useGetPatientsQuery,
    useGetPatientByIdQuery,
    useCreatePatientMutation,
    useUpdatePatientMutation,
    useDeletePatientMutation,
    useGetEmrByPatientIdQuery,
    useCreateEmrMutation,
    useUpdateEmrMutation,
    useCreateVasMutation,
    useUpdateVasMutation,
    useDeleteVasMutation,
    useCreateRecommendationMutation
} = apiNurseSlice;
