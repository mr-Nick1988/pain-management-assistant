import { configureStore } from '@reduxjs/toolkit';
import { apiAdminSlice } from './src/features/api/apiAdminSlice.ts';
import { apiPersonSlice } from './src/features/api/apiPersonSlice.ts';

export const store = configureStore({
    reducer: {
        [apiAdminSlice.reducerPath]: apiAdminSlice.reducer,
        [apiPersonSlice.reducerPath]: apiPersonSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiAdminSlice.middleware)
            .concat(apiPersonSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;