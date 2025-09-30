import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";

/**
 * Универсальная функция для извлечения человеко-читаемого сообщения об ошибке
 * из ответа RTK Query.
 * Зачем она нужна:
 * RTK Query при ошибке возвращает объект `FetchBaseQueryError`, у которого может быть вложенное поле `data`.
 * Сервер обычно кладёт текст ошибки в `data.message`.
 * Но форма ошибки не всегда одинакова, поэтому мы проверяем структуру пошагово.
 */
export  function getErrorMessage(error: unknown): string {
    // Проверяем, что error — это объект с полем "status" (признак FetchBaseQueryError)
    if (typeof error === "object" && error != null && "status" in error) {
        const fetchError = error as FetchBaseQueryError;
        // Если сервер вернул тело ошибки (например, { message: "Пациент не найден" })
        if (
            fetchError.data &&
            typeof fetchError.data === "object" &&
            "message" in fetchError.data
        ) {
            // Достаём message и возвращаем как текст ошибки
            return (fetchError.data as { message: string }).message;
        }
        // Если структура ошибки неизвестна, возвращаем общий текст
        return "Unknown server error";
    }
    // Если это вообще не FetchBaseQueryError (например, ошибка JS или сети)
    return "Unexpected error";
}