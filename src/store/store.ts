import { configureStore } from '@reduxjs/toolkit';
// Импортируй свои slices здесь, когда создашь их
// import { userSlice } from './features/userSlice';

export const store = configureStore({
    reducer: {
        // Добавь свои reducers здесь
        // user: userSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;