import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQueryWithReauth} from "../baseQueryWithReauth.ts";
import type {PersonLogin, ChangeCredentialsType, PersonLoginResponse} from "../../types/personRegister";

export const apiPersonSlice = createApi({
    reducerPath: "apiUser",
    tagTypes: ["User"],
    baseQuery: baseQueryWithReauth,
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
