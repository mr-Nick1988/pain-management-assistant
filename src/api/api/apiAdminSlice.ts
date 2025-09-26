import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {PersonRegister} from "../../types/personRegister.ts";
import {base_url} from "../../utils/constants";


export const apiAdminSlice = createApi({
    reducerPath: "apiAdmin",
    tagTypes: ["User"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        prepareHeaders: (headers) => {
            // Authentication is handled via session/cookies on the backend
            // No need to add Bearer token headers
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
        updatePerson: builder.mutation<PersonRegister, PersonRegister>({
            query: (person) => ({
                url: `/admin/persons/${person.personId}`,
                method: "PATCH",
                body: person,
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