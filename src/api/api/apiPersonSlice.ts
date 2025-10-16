import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {PersonLogin, ChangeCredentialsType, PersonLoginResponse} from "../../types/personRegister";

import {base_url} from "../../utils/constants";

export const apiPersonSlice = createApi({
    reducerPath: "apiUser",
    tagTypes: ["User"],
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
        login: builder.mutation<PersonLoginResponse, PersonLogin>({
            query: (credentials) => ({
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
