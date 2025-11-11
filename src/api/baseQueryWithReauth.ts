import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { base_url } from "../utils/constants";

/**
 * Базовый query с автоматическим обновлением токена при 401
 * 
 * АРХИТЕКТУРА:
 * 1. Все запросы идут с credentials: 'include' (отправляют HttpOnly cookies)
 * 2. При 401 ошибке - автоматически вызывается /api/auth/refresh
 * 3. Refresh обновляет accessToken в HttpOnly cookie
 * 4. Повторяется оригинальный запрос
 * 5. Если refresh тоже 401 - редирект на /login
 */

const baseQuery = fetchBaseQuery({
    baseUrl: base_url,
    credentials: "include", // КРИТИЧНО: отправляет HttpOnly cookies
    prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Выполняем оригинальный запрос
    let result = await baseQuery(args, api, extraOptions);

    // Если получили 401 - пробуем обновить токен
    if (result.error && result.error.status === 401) {
        console.log("[Auth] 401 detected, attempting token refresh...");

        // Пытаемся обновить токен
        const refreshResult = await fetch("http://localhost:8082/api/auth/refresh", {
            method: "POST",
            credentials: "include", // Отправляет refreshToken из HttpOnly cookie
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (refreshResult.ok) {
            console.log("[Auth] Token refreshed successfully, retrying original request...");
            
            // Токен обновлен (новый accessToken в HttpOnly cookie)
            // Повторяем оригинальный запрос
            result = await baseQuery(args, api, extraOptions);
        } else {
            console.log("[Auth] Token refresh failed, redirecting to login...");
            
            // Refresh не удался - пользователь не авторизован
            // Очищаем localStorage и редиректим на логин
            localStorage.removeItem("userRole");
            localStorage.removeItem("userFirstName");
            localStorage.removeItem("userLogin");
            localStorage.removeItem("isFirstLogin");
            
            // Редирект на логин
            window.location.href = "/login";
        }
    }

    return result;
};
