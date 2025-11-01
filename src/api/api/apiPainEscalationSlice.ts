import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_url } from "../../utils/constants.ts";
import type { PainTrendAnalysisDTO } from "../../types/common/types.ts";

export const apiPainEscalationSlice = createApi({
    reducerPath: "apiPainEscalation",
    tagTypes: ["PainTrend"],
    refetchOnFocus: true,
    refetchOnReconnect: true,
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
        getPainTrend: builder.query<PainTrendAnalysisDTO, string>({
            query: (mrn) => `/pain-escalation/patients/${mrn}/trend`,
            providesTags: (_result, _error, mrn) => [{ type: 'PainTrend' as const, id: mrn }],
        }),
    }),
});

export const { useGetPainTrendQuery, useLazyGetPainTrendQuery } = apiPainEscalationSlice;
