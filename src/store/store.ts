import { configureStore } from '@reduxjs/toolkit';
// Импортируй свои slices здесь, когда создашь их

export const store = configureStore({
    reducer: {
        // Добавь свои reducers здесь
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;