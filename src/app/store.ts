import {configureStore} from "@reduxjs/toolkit";
import {apiPersonSlice} from "../api/api/apiPersonSlice.ts";
import {apiDoctorSlice} from "../api/api/apiDoctorSlice.ts";
import {apiAnesthesiologistSlice} from "../api/api/apiAnesthesiologistSlice.ts";
import {apiAdminSlice} from "../api/api/apiAdminSlice.ts";
import {apiNurseSlice} from "../api/api/apiNurseSlice.ts";
import {apiFhirSlice} from "../api/api/apiFhirSlice.ts";
import {apiExternalVasSlice} from "../api/api/apiExternalVasSlice.ts";
import {reportingApi} from "../api/api/apiReportingSlice.ts";
import {backupApi} from "../api/api/apiBackupSlice.ts";
import {listenerMiddleware} from "./listenerMiddleware.ts";


export const store = configureStore({
    reducer: {
        [apiAdminSlice.reducerPath]: apiAdminSlice.reducer,
        [apiPersonSlice.reducerPath]: apiPersonSlice.reducer,
        [apiDoctorSlice.reducerPath]: apiDoctorSlice.reducer,
        [apiAnesthesiologistSlice.reducerPath]: apiAnesthesiologistSlice.reducer,
        [apiNurseSlice.reducerPath]: apiNurseSlice.reducer,
        [apiFhirSlice.reducerPath]: apiFhirSlice.reducer,
        [apiExternalVasSlice.reducerPath]: apiExternalVasSlice.reducer,
        [reportingApi.reducerPath]: reportingApi.reducer,
        [backupApi.reducerPath]: backupApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .prepend(listenerMiddleware.middleware) // - важно: prepend, чтобы слушатели обрабатывались первыми
            .concat(apiAdminSlice.middleware)
            .concat(apiPersonSlice.middleware)
            .concat(apiDoctorSlice.middleware)
            .concat(apiAnesthesiologistSlice.middleware)
            .concat(apiNurseSlice.middleware)
            .concat(apiFhirSlice.middleware)
            .concat(apiExternalVasSlice.middleware)
            .concat(reportingApi.middleware)
            .concat(backupApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;