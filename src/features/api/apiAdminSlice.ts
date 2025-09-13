import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {PersonRegister} from "../../types/personRegister.ts";
import {base_url} from "../../utils/constants";

interface RootState {
    auth?: {
        token?: string;
    }
}

export const apiAdminSlice = createApi({
    reducerPath: "apiAdmin",
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
        createPerson: builder.mutation({
            query: (userData: PersonRegister) => ({
                url: "/admin/persons",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        getPersons: builder.query<PersonRegister[], void>({
            query: () => "/admin/persons",
            providesTags: ["User"],
        }),
        deletePerson: builder.mutation<void, string>({
            query: (id) => ({
                url: `/admin/persons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),
        updatePerson: builder.mutation({
            query: (id) => ({
                url: `/admin/persons/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useCreatePersonMutation,
    useGetPersonsQuery,
    useDeletePersonMutation,
    useUpdatePersonMutation,
} = apiAdminSlice;