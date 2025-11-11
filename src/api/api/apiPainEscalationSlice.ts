import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth.ts";
import type { PainTrendAnalysisDTO } from "../../types/common/types.ts";

export const apiPainEscalationSlice = createApi({
    reducerPath: "apiPainEscalation",
    tagTypes: ["PainTrend"],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getPainTrend: builder.query<PainTrendAnalysisDTO, string>({
            query: (mrn) => `/pain-escalation/patients/${mrn}/trend`,
            providesTags: (_result, _error, mrn) => [{ type: 'PainTrend' as const, id: mrn }],
        }),
    }),
});

export const { useGetPainTrendQuery, useLazyGetPainTrendQuery } = apiPainEscalationSlice;
