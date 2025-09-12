import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {UserLogin, UserRegister, ChangeCredentialsType} from "../../types/userRegister.ts";
import {base_url} from "../../utils/constants";

interface RootState {
    auth?: {
        token?: string;
    }
}

export const apiSlice = createApi({
    reducerPath: "api",
    tagTypes: ["User"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers, {getState}) => {
            // Get token from state (assuming it's stored in state.auth.token)
            const state = getState() as RootState;
            const token = state.auth?.token;
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
        createPerson: builder.mutation({
            query: (userData: UserRegister) => ({
                url: "/admin/persons",
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
        getPersons: builder.query<UserRegister[],void>({
            query: () => "/admin/persons",
            providesTags: ["User"],
        }),
    }),
});
export const {
    useRegisterMutation,
    useLoginMutation,
    useCreatePersonMutation,
    useChangeCredentialsMutation,
    useGetPersonsQuery
} = apiSlice;