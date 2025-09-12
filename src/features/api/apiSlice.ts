import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {UserLogin, UserRegister, ChangeCredentialsType} from "../../types/userRegister.ts";
import {base_url} from "../../utils/constants";


export const apiSlice = createApi({
    reducerPath: "api",
    tagTypes: ["User"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers, { getState }) => {
            // Get token from state (assuming it's stored in state.auth.token)
            const token = (getState() as any).auth?.token;
            
            // If token exists, add it to headers
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            
            return headers;
        },
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
        createUser: builder.mutation({
            query: (userData: UserRegister) => ({
                url: "/admin/users",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        changeCredentials: builder.mutation({
            query: (credentialsData: ChangeCredentialsType) => ({
                url: "/user/change-credentials",
                method: "PUT",
                body: credentialsData,
            }),
            invalidatesTags: ["User"],
        }),
        getUsers: builder.query({
            query: () => "/admin/users",
            providesTags: ["User"],
        }),
    }),
});
export const {
    useRegisterMutation, 
    useLoginMutation, 
    useCreateUserMutation, 
    useChangeCredentialsMutation,
    useGetUsersQuery
} = apiSlice;