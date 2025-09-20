import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {
    CreateProtocolCommentRequest,
    CreateProtocolRequest,
    Escalation,
    Protocol,
    ProtocolComment,
    UpdateProtocolRequest
} from "../../types/anesthesiologist.ts";


export const apiAnesthesiologistSlice = createApi({
    reducerPath: "apiAnesthesiologist",
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
    }),
    tagTypes: ["Escalation", "Protocol", "ProtocolComment"],
    endpoints: (builder) => ({
        getEscalations: builder.query<Escalation[], void>({
            query: () => "/escalations",
            providesTags: ["Escalation"],
        }),
        getEscalationById: builder.query<Escalation, string>({
            query: (id) => `/escalations/${id}`,
            providesTags: (_result, _error, id) => [{type: "Escalation", id}],
        }),
        takeEscalation: builder.mutation<void, string>({
            query: (escalationId) => ({
                url: `/escalations/${escalationId}/take`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, escalationId) => [{type: "Escalation", id: escalationId}],
        }),
        getProtocolsByEscalation: builder.query<Protocol[], string>({
            query: (escalationId) => `/escalations/${escalationId}/protocols`,
            providesTags: (_result, _error, escalationId) => [{type: "Protocol", id: escalationId}],
        }),
        createProtocol: builder.mutation<Protocol, CreateProtocolRequest>({
            query: (protocol) => ({
                url: "/protocol",
                method: "POST",
                body: protocol
            }),
            invalidatesTags: ["Protocol", "Escalation"]
        }),
        updateProtocol: builder.mutation<Protocol, UpdateProtocolRequest>({
            query: ({id, ...patch}) => ({
                url: `/protocol/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (_result, _error, {id}) => [{type: "Protocol", id}, "Protocol"]
        }),
        approveProtocol: builder.mutation<void, string>({
            query: (protocolId) => ({
                url: `/protocol/${protocolId}/approve`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, protocolId) => [{
                type: "Protocol",
                id: protocolId
            }, "Protocol", "Escalation"]
        }),
        rejectProtocol: builder.mutation<void, { protocolId: string; reason: string }>({
            query: ({protocolId, reason}) => ({
                url: `/protocols/${protocolId}/reject`,
                method: "POST",
                body: {reason},
            }),
            invalidatesTags: (_result, _error, {protocolId}) => [
                {type: "Protocol", id: protocolId},
                "Protocol",
                "Escalation"
            ],
        }),
        getProtocolComments: builder.query<ProtocolComment[], string>({
            query: (protocolId) => `/protocol/${protocolId}/comments`,
            providesTags: (_result, _error, protocolId) => [{type: "ProtocolComment", id: protocolId}],
        }),
        addProtocolComment: builder.mutation<ProtocolComment, CreateProtocolCommentRequest>({
            query: (comment) => ({
                url: "/protocols/comments",
                method: "POST",
                body: comment
            }),
            invalidatesTags: (_result, _error, {protocolId}) => [{
                type: "ProtocolComment",
                id: protocolId
            }, "ProtocolComment"]
        }),
        sendQuestionToDoctor: builder.mutation<void, { escalationId: string; question: string }>({
            query: ({escalationId, question}) => ({
                url: `/escalations/${escalationId}/questions`,
                method: "POST",
                body: {question}
            }),
            invalidatesTags: (_result, _error, {escalationId}) => [{type: "Escalation", id: escalationId}, "Escalation"]
        }),
        resolveEscalation: builder.mutation<void, { escalationId: string, resolution: string }>({
            query: ({escalationId, resolution}) => ({
                url: `/escalations/${escalationId}/resolve`,
                method: "POST",
                body: {resolution}
            }),
            invalidatesTags: (_result, _error, {escalationId}) => [{
                type: "Escalation",
                id: escalationId
            }, "Escalation"],
        }),
    }),
});

export const {
    useGetEscalationsQuery,
    useGetEscalationByIdQuery,
    useTakeEscalationMutation,
    useGetProtocolsByEscalationQuery,
    useCreateProtocolMutation,
    useUpdateProtocolMutation,
    useApproveProtocolMutation,
    useRejectProtocolMutation,
    useGetProtocolCommentsQuery,
    useAddProtocolCommentMutation,
    useSendQuestionToDoctorMutation,
    useResolveEscalationMutation,
} = apiAnesthesiologistSlice;
