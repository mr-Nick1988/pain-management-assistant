import {configureStore} from '@reduxjs/toolkit';
import {apiAdminSlice} from "../features/api/apiAdminSlice.ts";
import {apiPersonSlice} from "../features/api/apiPersonSlice.ts";
import {apiDoctorSlice} from "../features/api/apiDoctorSlice.ts";
// Импортируй свои slices здесь, когда создашь их

export const store = configureStore({
    reducer: {
        [apiAdminSlice.reducerPath]: apiAdminSlice.reducer,
        [apiPersonSlice.reducerPath]: apiPersonSlice.reducer,
        [apiDoctorSlice.reducerPath]: apiDoctorSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiAdminSlice.middleware)
            .concat(apiPersonSlice.middleware)
            .concat(apiDoctorSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;