# 🎨 Frontend JWT Authentication Guide

## 🔐 Безопасная архитектура без хранения токенов

### ✅ Что реализовано

1. **HttpOnly Cookies** - токены хранятся только на бэкенде
2. **Автоматический refresh** - при 401 ошибке токен обновляется автоматически
3. **RTK Query** - все API запросы с `credentials: 'include'`
4. **Централизованная обработка auth** - один файл для всех API slices

---

## 📁 Структура файлов

```
src/
├── api/
│   ├── baseQueryWithReauth.ts        # Базовый query с auto-refresh
│   └── api/
│       ├── apiAuthSlice.ts           # Authentication Service API
│       ├── apiAdminSlice.ts          # Admin endpoints
│       ├── apiDoctorSlice.ts         # Doctor endpoints
│       ├── apiNurseSlice.ts          # Nurse endpoints
│       └── apiAnesthesiologistSlice.ts
├── components/
│   └── person_login/
│       └── Login.tsx                 # Login компонент
└── app/
    └── store.ts                      # Redux store
```

---

## 🔑 1. Authentication API (`apiAuthSlice.ts`)

### Endpoints

#### Login
```typescript
const [loginMutation] = useLoginMutation();

const response = await loginMutation({ 
    login: "doctor001", 
    password: "password123" 
}).unwrap();

// Response:
// {
//   personId: "DOC001",
//   firstName: "John",
//   role: "DOCTOR",
//   temporaryCredentials: false
// }

// Токены автоматически установлены в HttpOnly cookies!
```

#### Logout
```typescript
const [logoutMutation] = useLogoutMutation();

await logoutMutation().unwrap();
// Cookies удалены, пользователь разлогинен
```

#### Change Password
```typescript
const [changePasswordMutation] = useChangePasswordMutation();

await changePasswordMutation({
    currentPassword: "old123",
    newPassword: "new456"
}).unwrap();
```

#### Get Current User
```typescript
const { data: user } = useGetCurrentUserQuery();
// Проверяет токен и возвращает данные пользователя
```

---

## 🔄 2. Автоматический Refresh (`baseQueryWithReauth.ts`)

### Как это работает

```typescript
// 1. Выполняется оригинальный запрос
let result = await baseQuery(args, api, extraOptions);

// 2. Если получили 401 - автоматически обновляем токен
if (result.error && result.error.status === 401) {
    console.log("[Auth] 401 detected, attempting token refresh...");
    
    // 3. Вызываем /api/auth/refresh
    const refreshResult = await fetch("http://localhost:8082/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Отправляет refreshToken из cookie
    });
    
    if (refreshResult.ok) {
        // 4. Новый accessToken установлен, повторяем запрос
        result = await baseQuery(args, api, extraOptions);
    } else {
        // 5. Refresh не удался - редирект на логин
        localStorage.clear();
        window.location.href = "/login";
    }
}
```

### Преимущества
- ✅ Пользователь не замечает истечения токена
- ✅ Автоматическое продление сессии
- ✅ Централизованная обработка 401 ошибок
- ✅ Не нужно вручную обрабатывать refresh в каждом компоненте

---

## 🎯 3. Использование в компонентах

### Login компонент

```typescript
import { useLoginMutation } from "../../api/api/apiAuthSlice.ts";

const Login: React.FC = () => {
    const [loginMutation] = useLoginMutation();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await loginMutation({ login, password }).unwrap();
            
            // Сохраняем ТОЛЬКО метаданные (НЕ токены!)
            localStorage.setItem("userRole", response.role);
            localStorage.setItem("userFirstName", response.firstName);
            localStorage.setItem("isFirstLogin", String(response.temporaryCredentials));
            
            // Редирект по роли
            navigate(`/${response.role.toLowerCase()}`);
        } catch (err) {
            setError("Login failed");
        }
    };
    
    return (/* JSX */);
};
```

### Любой другой компонент

```typescript
import { useGetAllPatientsQuery } from "../../api/api/apiAdminSlice.ts";

const AdminPanel: React.FC = () => {
    // RTK Query автоматически отправляет cookies
    const { data: patients, isLoading, error } = useGetAllPatientsQuery();
    
    // Если токен истек (401) - автоматически обновится через baseQueryWithReauth
    
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading patients</div>;
    
    return (
        <div>
            {patients?.map(patient => (
                <div key={patient.mrn}>{patient.firstName}</div>
            ))}
        </div>
    );
};
```

---

## 🛠️ 4. Создание нового API Slice

Все новые API slices должны использовать `baseQueryWithReauth`:

```typescript
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQueryWithReauth.ts";

export const apiNewSlice = createApi({
    reducerPath: "apiNew",
    baseQuery: baseQueryWithReauth, // ← Используем общий baseQuery
    tagTypes: ["Resource"],
    endpoints: (builder) => ({
        getResources: builder.query<Resource[], void>({
            query: () => "/new/resources",
            providesTags: ["Resource"],
        }),
    }),
});
```

**НЕ НУЖНО:**
- ❌ Добавлять Bearer токен в headers
- ❌ Читать токен из localStorage
- ❌ Вручную обрабатывать 401 ошибки
- ❌ Вручную вызывать refresh

**Все это делается автоматически!**

---

## 🔒 5. Что НЕ хранится в localStorage

```typescript
// ❌ НИКОГДА не храните:
localStorage.setItem("accessToken", token);  // ОПАСНО!
localStorage.setItem("refreshToken", token); // ОПАСНО!
localStorage.setItem("jwt", token);          // ОПАСНО!

// ✅ Храните только метаданные:
localStorage.setItem("userRole", "DOCTOR");
localStorage.setItem("userFirstName", "John");
localStorage.setItem("isFirstLogin", "false");
```

---

## 🚀 6. Тестирование

### Проверка автоматического refresh

1. Залогиньтесь в приложение
2. Откройте DevTools → Application → Cookies
3. Увидите `accessToken` и `refreshToken` (HttpOnly)
4. Подождите 15 минут (истечение accessToken)
5. Сделайте любой запрос к API
6. В консоли увидите: `[Auth] 401 detected, attempting token refresh...`
7. Запрос автоматически повторится с новым токеном

### Проверка logout

1. Нажмите кнопку Logout
2. Cookies `accessToken` и `refreshToken` удалены
3. Редирект на `/login`

---

## 📊 7. Диаграмма потока аутентификации

```
┌─────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────┘

User enters credentials
         │
         ▼
┌─────────────────────┐
│ useLoginMutation()  │
│ POST /auth/login    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ Backend sets HttpOnly cookies:              │
│ - accessToken (15 min)                      │
│ - refreshToken (7 days)                     │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ Frontend saves metadata to localStorage:    │
│ - userRole                                  │
│ - userFirstName                             │
│ - isFirstLogin                              │
└──────────┬──────────────────────────────────┘
           │
           ▼
    Redirect to dashboard


┌─────────────────────────────────────────────────────────────┐
│                      API REQUEST FLOW                       │
└─────────────────────────────────────────────────────────────┘

Component calls useGetPatientsQuery()
         │
         ▼
┌─────────────────────┐
│ baseQueryWithReauth │
│ credentials: include│ ← Автоматически отправляет cookies
└──────────┬──────────┘
           │
           ▼
    ┌──────────┐
    │ Response │
    └─────┬────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  200 OK      401 Unauthorized
    │           │
    │           ▼
    │    ┌──────────────────────┐
    │    │ Auto refresh token   │
    │    │ POST /auth/refresh   │
    │    └──────────┬───────────┘
    │               │
    │         ┌─────┴─────┐
    │         │           │
    │         ▼           ▼
    │    Success      Failed
    │         │           │
    │         │           ▼
    │         │    Clear localStorage
    │         │    Redirect to /login
    │         │
    │         ▼
    │    Retry original request
    │         │
    └─────────┴──────────▶ Return data to component
```

---

## 🔧 8. Troubleshooting

### Проблема: Cookies не отправляются

**Решение:**
1. Проверьте `credentials: 'include'` в baseQuery
2. Проверьте CORS на бэкенде: `allowCredentials: true`
3. Проверьте origin в CORS (должен быть точный, НЕ `*`)

### Проблема: 401 после refresh

**Причины:**
- refreshToken истек (7 дней)
- refreshToken невалидный
- Пользователь удален

**Решение:** Автоматический редирект на `/login`

### Проблема: Бесконечный цикл refresh

**Причина:** Endpoint `/auth/refresh` тоже возвращает 401

**Решение:** Проверьте, что refresh endpoint НЕ требует accessToken

---

## 📝 9. Checklist для разработчиков

### При создании нового API slice:
- [ ] Использовать `baseQueryWithReauth`
- [ ] НЕ добавлять Bearer токен в headers
- [ ] НЕ читать токены из localStorage

### При создании компонента с API:
- [ ] Использовать RTK Query hooks
- [ ] НЕ обрабатывать 401 вручную (автоматически)
- [ ] Показывать loading/error states

### При тестировании:
- [ ] Проверить cookies в DevTools
- [ ] Проверить автоматический refresh (подождать 15 мин)
- [ ] Проверить logout (cookies удалены)
- [ ] Проверить редирект на login при неудачном refresh

---

## 🎓 Дополнительные материалы

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [HttpOnly Cookies Security](https://owasp.org/www-community/HttpOnly)
- [CORS with Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)

---

## ✅ Итог

**Безопасность:**
- ✅ Токены НЕ доступны JavaScript
- ✅ Защита от XSS атак
- ✅ Защита от CSRF (SameSite=Strict)
- ✅ Автоматический refresh токенов
- ✅ Централизованная обработка auth

**Удобство:**
- ✅ Не нужно вручную добавлять токены в headers
- ✅ Не нужно обрабатывать 401 в каждом компоненте
- ✅ Автоматическое продление сессии
- ✅ Простой API для разработчиков
