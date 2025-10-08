import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {base_url} from "../../utils/constants.ts";
import type {
    EscalationResponse,
    EscalationResolution,
    EscalationStatus,
    EscalationPriority,
    EscalationStats,
    ProtocolResponse,
    ProtocolRequest,
    CommentResponse,
    CommentRequest
} from "../../types/anesthesiologist.ts";


export const apiAnesthesiologistSlice = createApi({
    reducerPath: "apiAnesthesiologist",
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
    }),
    tagTypes: ["Escalation", "Protocol", "Comment", "Stats"],
    endpoints: (builder) => ({
        // ================= ESCALATIONS ================= //

        getAllEscalations: builder.query<EscalationResponse[], void>({
            query: () => "anesthesiologist/escalations",
            providesTags: ["Escalation"],
        }),

        getEscalationsByStatus: builder.query<EscalationResponse[], EscalationStatus>({
            query: (status) => `anesthesiologist/escalations/status/${status}`,
            providesTags: ["Escalation"],
        }),

        getEscalationsByPriority: builder.query<EscalationResponse[], EscalationPriority>({
            query: (priority) => `anesthesiologist/escalations/priority/${priority}`,
            providesTags: ["Escalation"],
        }),

        getActiveEscalations: builder.query<EscalationResponse[], void>({
            query: () => "anesthesiologist/escalations/active",
            providesTags: ["Escalation"],
        }),

        approveEscalation: builder.mutation<EscalationResponse, { escalationId: number; resolution: EscalationResolution }>({
            query: ({escalationId, resolution}) => ({
                url: `anesthesiologist/escalations/${escalationId}/approve`,
                method: "POST",
                body: resolution,
            }),
            invalidatesTags: ["Escalation", "Stats"],
        }),

        rejectEscalation: builder.mutation<EscalationResponse, { escalationId: number; resolution: EscalationResolution }>({
            query: ({escalationId, resolution}) => ({
                url: `anesthesiologist/escalations/${escalationId}/reject`,
                method: "POST",
                body: resolution,
            }),
            invalidatesTags: ["Escalation", "Stats"],
        }),

        getEscalationStats: builder.query<EscalationStats, void>({
            query: () => "anesthesiologist/escalations/stats",
            providesTags: ["Stats"],
        }),

        // ================= PROTOCOLS ================= //

        createProtocol: builder.mutation<ProtocolResponse, ProtocolRequest>({
            query: (protocol) => ({
                url: "anesthesiologist/protocols",
                method: "POST",
                body: protocol
            }),
            invalidatesTags: ["Protocol", "Escalation"]
        }),

        approveProtocol: builder.mutation<ProtocolResponse, { protocolId: number; approvedBy: string }>({
            query: ({protocolId, approvedBy}) => ({
                url: `anesthesiologist/protocols/${protocolId}/approve`,
                method: "POST",
                body: { approvedBy },
            }),
            invalidatesTags: ["Protocol", "Escalation"]
        }),

        rejectProtocol: builder.mutation<ProtocolResponse, { protocolId: number; rejectedReason: string; rejectedBy: string }>({
            query: ({protocolId, rejectedReason, rejectedBy}) => ({
                url: `anesthesiologist/protocols/${protocolId}/reject`,
                method: "POST",
                body: { rejectedReason, rejectedBy },
            }),
            invalidatesTags: ["Protocol", "Escalation"]
        }),

        getProtocolsByEscalation: builder.query<ProtocolResponse[], number>({
            query: (escalationId) => `anesthesiologist/protocols/escalation/${escalationId}`,
            providesTags: (_result, _error, escalationId) => [{type: "Protocol", id: escalationId}],
        }),

        getPendingApprovalProtocols: builder.query<ProtocolResponse[], void>({
            query: () => "anesthesiologist/protocols/pending-approval",
            providesTags: ["Protocol"],
        }),

        // ================= COMMENTS ================= //

        addComment: builder.mutation<CommentResponse, CommentRequest>({
            query: (comment) => ({
                url: "anesthesiologist/comments",
                method: "POST",
                body: comment
            }),
            invalidatesTags: (_result, _error, {protocolId}) => [{type: "Comment", id: protocolId}]
        }),

        getCommentsByProtocol: builder.query<CommentResponse[], number>({
            query: (protocolId) => `anesthesiologist/comments/protocol/${protocolId}`,
            providesTags: (_result, _error, protocolId) => [{type: "Comment", id: protocolId}],
        }),

        deleteComment: builder.mutation<void, { commentId: number; userId: string }>({
            query: ({commentId, userId}) => ({
                url: `anesthesiologist/comments/${commentId}`,
                method: "DELETE",
                body: { userId }
            }),
            invalidatesTags: ["Comment"]
        }),
    }),
});

export const {
    useGetAllEscalationsQuery,
    useGetEscalationsByStatusQuery,
    useGetEscalationsByPriorityQuery,
    useGetActiveEscalationsQuery,
    useApproveEscalationMutation,
    useRejectEscalationMutation,
    useGetEscalationStatsQuery,
    useCreateProtocolMutation,
    useApproveProtocolMutation,
    useRejectProtocolMutation,
    useGetProtocolsByEscalationQuery,
    useGetPendingApprovalProtocolsQuery,
    useAddCommentMutation,
    useGetCommentsByProtocolQuery,
    useDeleteCommentMutation,
} = apiAnesthesiologistSlice;