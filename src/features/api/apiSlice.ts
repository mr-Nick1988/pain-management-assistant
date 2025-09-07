import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {UserLogin, UserRegister} from "../../types/userRegister.ts";
import {base_url} from "../../utils/constants";


export const apiSlice = createApi({
    reducerPath: "api",
    tagTypes: ["User"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
    }),
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (userData: UserRegister) => ({
                url: "/register",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        login: builder.mutation({
            query: (credentials: UserLogin) => ({
                url: "/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["User"],
        }),
    }),
});
export const {useRegisterMutation, useLoginMutation} = apiSlice;