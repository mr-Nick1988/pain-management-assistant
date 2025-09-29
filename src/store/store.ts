import {configureStore} from "@reduxjs/toolkit";
import {apiAdminSlice} from "../api/api/apiAdminSlice.ts";
import {apiPersonSlice} from "../api/api/apiPersonSlice.ts";
import {apiDoctorSlice} from "../api/api/apiDoctorSlice.ts";
import {apiAnesthesiologistSlice} from "../api/api/apiAnesthesiologistSlice.ts";
import {apiNurseSlice} from "../api/api/apiNurseSlice.ts";
// Импортируй свои slices здесь, когда создашь их




export const store = configureStore({
    reducer: {
        [apiAdminSlice.reducerPath]: apiAdminSlice.reducer,
        [apiPersonSlice.reducerPath]: apiPersonSlice.reducer,
        [apiDoctorSlice.reducerPath]: apiDoctorSlice.reducer,
        [apiAnesthesiologistSlice.reducerPath]: apiAnesthesiologistSlice.reducer,
        [apiNurseSlice.reducerPath]: apiNurseSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiAdminSlice.middleware)
            .concat(apiPersonSlice.middleware)
            .concat(apiDoctorSlice.middleware)
            .concat(apiAnesthesiologistSlice.middleware)
            .concat(apiNurseSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;