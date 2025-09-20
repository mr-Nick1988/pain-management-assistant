import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {PersonLogin, ChangeCredentialsType} from "../../types/personRegister.ts";
import {base_url} from "../../utils/constants";

interface RootState {
    auth?: {
        token?: string;
    }
}

export const apiPersonSlice = createApi({
    reducerPath: "apiUser",
    tagTypes: ["User"],
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
        login: builder.mutation({
            query: (credentials: PersonLogin) => ({
                url: "/person/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["User"],
        }),
        changeCredentials: builder.mutation({
            query: (credentialsData: ChangeCredentialsType) => ({
                url: "/person/change-credentials",
                method: "POST",
                body: credentialsData,
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useLoginMutation,
    useChangeCredentialsMutation
} = apiPersonSlice;
