import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UserRole } from "../../types/personRegister.ts";

// ==================== TYPES ====================

export interface LoginRequest {
    login: string;
    password: string;
}

export interface LoginResponse {
    personId: string;
    firstName: string;
    role: UserRole;
    temporaryCredentials: boolean;
    // Токены НЕ возвращаются - они в HttpOnly cookies!
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    message: string;
    success: boolean;
}

// ==================== API SLICE ====================

/**
 * Authentication Service API
 * 
 * ВАЖНО: Токены хранятся в HttpOnly cookies на бэкенде!
 * Фронтенд НЕ имеет доступа к токенам - это безопасно.
 * 
 * Бэкенд должен:
 * 1. При /login - установить HttpOnly cookies (accessToken, refreshToken)
 * 2. При /refresh - обновить accessToken cookie
 * 3. При /logout - удалить cookies
 * 4. Все эндпоинты монолита проверяют accessToken из cookie
 */
export const apiAuthSlice = createApi({
    reducerPath: "apiAuth",
    tagTypes: ["Auth"],
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8082/api/auth",
        credentials: "include", // КРИТИЧНО: отправляет cookies с каждым запросом
        prepareHeaders: (headers) => {
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    endpoints: (builder) => ({
        /**
         * POST /api/auth/login
         * Логин пользователя
         * 
         * Бэкенд устанавливает HttpOnly cookies:
         * - accessToken (срок жизни: 15 минут)
         * - refreshToken (срок жизни: 7 дней)
         */
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["Auth"],
        }),

        /**
         * POST /api/auth/refresh
         * Обновление access токена
         * 
         * Использует refreshToken из HttpOnly cookie
         * Возвращает новый accessToken в HttpOnly cookie
         */
        refreshToken: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: "/refresh",
                method: "POST",
            }),
        }),

        /**
         * POST /api/auth/change-password
         * Смена пароля (для первого входа или по запросу)
         */
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
            query: (data) => ({
                url: "/change-password",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Auth"],
        }),

        /**
         * POST /api/auth/logout
         * Выход из системы
         * 
         * Бэкенд удаляет HttpOnly cookies
         */
        logout: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: "/logout",
                method: "POST",
            }),
            invalidatesTags: ["Auth"],
        }),

        /**
         * GET /api/auth/me
         * Получить информацию о текущем пользователе
         * 
         * Проверяет accessToken из HttpOnly cookie
         */
        getCurrentUser: builder.query<LoginResponse, void>({
            query: () => "/me",
            providesTags: ["Auth"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRefreshTokenMutation,
    useChangePasswordMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
} = apiAuthSlice;
