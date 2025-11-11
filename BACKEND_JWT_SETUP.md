# 🔐 Backend JWT Authentication Setup Guide

## Архитектура безопасности

### ❌ Проблема с localStorage
Хранение JWT токенов в `localStorage` или `sessionStorage` **НЕБЕЗОПАСНО**:
- Уязвимость к XSS атакам (JavaScript может украсть токены)
- Токены доступны любому скрипту на странице
- Нет защиты от CSRF атак

### ✅ Решение: HttpOnly Cookies
Токены хранятся в **HttpOnly cookies** на бэкенде:
- ✅ JavaScript НЕ имеет доступа к токенам (защита от XSS)
- ✅ Браузер автоматически отправляет cookies с каждым запросом
- ✅ Защита от CSRF через SameSite атрибут
- ✅ Фронтенд НЕ хранит токены вообще

---

## 🎯 Что нужно реализовать на бэкенде

### 1. Authentication Service (Port 8082)

#### POST /api/auth/login
**Запрос:**
```json
{
  "login": "doctor001",
  "password": "password123"
}
```

**Ответ (200 OK):**
```json
{
  "personId": "DOC001",
  "firstName": "John",
  "role": "DOCTOR",
  "temporaryCredentials": false
}
```

**ВАЖНО: Установить HttpOnly cookies в Response:**
```java
// Spring Boot пример
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
    @RequestBody LoginRequest request,
    HttpServletResponse response
) {
    // 1. Валидация credentials
    Person person = authService.authenticate(request.getLogin(), request.getPassword());
    
    // 2. Генерация токенов
    String accessToken = jwtService.generateAccessToken(person);
    String refreshToken = jwtService.generateRefreshToken(person);
    
    // 3. Установка HttpOnly cookies
    Cookie accessCookie = new Cookie("accessToken", accessToken);
    accessCookie.setHttpOnly(true);  // КРИТИЧНО: защита от XSS
    accessCookie.setSecure(true);    // Только HTTPS (в production)
    accessCookie.setPath("/");
    accessCookie.setMaxAge(15 * 60); // 15 минут
    accessCookie.setSameSite("Strict"); // Защита от CSRF
    response.addCookie(accessCookie);
    
    Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
    refreshCookie.setHttpOnly(true);
    refreshCookie.setSecure(true);
    refreshCookie.setPath("/api/auth/refresh"); // Только для refresh endpoint
    refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 дней
    refreshCookie.setSameSite("Strict");
    response.addCookie(refreshCookie);
    
    // 4. Возврат метаданных (БЕЗ токенов!)
    return ResponseEntity.ok(new LoginResponse(
        person.getPersonId(),
        person.getFirstName(),
        person.getRole(),
        person.isTemporaryCredentials()
    ));
}
```

---

#### POST /api/auth/refresh
**Описание:** Обновление access токена через refresh токен из cookie

**Запрос:** Пустой body, refreshToken берется из HttpOnly cookie

**Ответ (200 OK):**
```json
{
  "success": true
}
```

**Реализация:**
```java
@PostMapping("/refresh")
public ResponseEntity<RefreshResponse> refresh(
    @CookieValue("refreshToken") String refreshToken,
    HttpServletResponse response
) {
    // 1. Валидация refresh токена
    if (!jwtService.validateToken(refreshToken)) {
        return ResponseEntity.status(401).build();
    }
    
    // 2. Извлечение данных пользователя
    String personId = jwtService.extractPersonId(refreshToken);
    Person person = personRepository.findByPersonId(personId)
        .orElseThrow(() -> new UnauthorizedException("User not found"));
    
    // 3. Генерация нового access токена
    String newAccessToken = jwtService.generateAccessToken(person);
    
    // 4. Обновление accessToken cookie
    Cookie accessCookie = new Cookie("accessToken", newAccessToken);
    accessCookie.setHttpOnly(true);
    accessCookie.setSecure(true);
    accessCookie.setPath("/");
    accessCookie.setMaxAge(15 * 60); // 15 минут
    accessCookie.setSameSite("Strict");
    response.addCookie(accessCookie);
    
    return ResponseEntity.ok(new RefreshResponse(true));
}
```

---

#### POST /api/auth/logout
**Описание:** Удаление cookies (выход из системы)

**Реализация:**
```java
@PostMapping("/logout")
public ResponseEntity<LogoutResponse> logout(HttpServletResponse response) {
    // Удаление cookies (установка MaxAge = 0)
    Cookie accessCookie = new Cookie("accessToken", "");
    accessCookie.setHttpOnly(true);
    accessCookie.setPath("/");
    accessCookie.setMaxAge(0); // Удаляет cookie
    response.addCookie(accessCookie);
    
    Cookie refreshCookie = new Cookie("refreshToken", "");
    refreshCookie.setHttpOnly(true);
    refreshCookie.setPath("/api/auth/refresh");
    refreshCookie.setMaxAge(0);
    response.addCookie(refreshCookie);
    
    return ResponseEntity.ok(new LogoutResponse(true));
}
```

---

#### POST /api/auth/change-password
**Запрос:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Ответ:**
```json
{
  "message": "Password changed successfully",
  "success": true
}
```

---

#### GET /api/auth/me
**Описание:** Получить информацию о текущем пользователе (проверка токена)

**Ответ:**
```json
{
  "personId": "DOC001",
  "firstName": "John",
  "role": "DOCTOR",
  "temporaryCredentials": false
}
```

---

### 2. Monolith API (Port 8080) - JWT Filter

Все эндпоинты монолита должны проверять `accessToken` из HttpOnly cookie:

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Извлечение accessToken из cookie
        String accessToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }
        
        // 2. Валидация токена
        if (accessToken != null && jwtService.validateToken(accessToken)) {
            String personId = jwtService.extractPersonId(accessToken);
            String role = jwtService.extractRole(accessToken);
            
            // 3. Установка SecurityContext
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(personId, null, 
                    Collections.singletonList(new SimpleGrantedAuthority(role)));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

### 3. CORS Configuration

**КРИТИЧНО:** Настроить CORS для работы с credentials:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // ВАЖНО: Указать точный origin (НЕ "*")
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // КРИТИЧНО: Разрешить credentials (cookies)
        config.setAllowCredentials(true);
        
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("Set-Cookie"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

**⚠️ ВАЖНО:**
- `allowCredentials(true)` требует точного origin (НЕ `*`)
- Без `allowCredentials(true)` браузер НЕ будет отправлять cookies

---

## 🔄 Как это работает на фронтенде

### 1. Login
```typescript
// Фронтенд отправляет credentials
const response = await loginMutation({ login, password }).unwrap();

// Бэкенд устанавливает HttpOnly cookies автоматически
// Фронтенд сохраняет ТОЛЬКО метаданные (НЕ токены!)
localStorage.setItem("userRole", response.role);
localStorage.setItem("userFirstName", response.firstName);
```

### 2. Все последующие запросы
```typescript
// RTK Query автоматически отправляет cookies с каждым запросом
baseQuery: fetchBaseQuery({
    baseUrl: base_url,
    credentials: "include", // КРИТИЧНО: отправляет HttpOnly cookies
})
```

### 3. Автоматический refresh при 401
```typescript
// baseQueryWithReauth перехватывает 401 и обновляет токен
if (result.error && result.error.status === 401) {
    // Вызов /api/auth/refresh (refreshToken из HttpOnly cookie)
    const refreshResult = await fetch("http://localhost:8082/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Отправляет refreshToken cookie
    });
    
    if (refreshResult.ok) {
        // Новый accessToken установлен в cookie, повторяем запрос
        result = await baseQuery(args, api, extraOptions);
    } else {
        // Refresh не удался - редирект на логин
        window.location.href = "/login";
    }
}
```

---

## 🛡️ Security Checklist

### Authentication Service (8082)
- [ ] HttpOnly cookies для accessToken и refreshToken
- [ ] Secure flag (только HTTPS в production)
- [ ] SameSite=Strict для защиты от CSRF
- [ ] accessToken: 15 минут, refreshToken: 7 дней
- [ ] refreshToken доступен только для `/api/auth/refresh`
- [ ] CORS с `allowCredentials: true`

### Monolith API (8080)
- [ ] JWT Filter проверяет accessToken из cookie
- [ ] При 401 - фронтенд автоматически вызывает refresh
- [ ] CORS с `allowCredentials: true`
- [ ] Все защищенные эндпоинты требуют валидный токен

### Frontend
- [ ] `credentials: 'include'` во всех API запросах
- [ ] НЕ хранить токены в localStorage/sessionStorage
- [ ] Автоматический refresh при 401
- [ ] Редирект на /login при неудачном refresh

---

## 📝 Пример JWT Service (Spring Boot)

```java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.access-expiration:900000}") // 15 минут
    private long accessExpiration;
    
    @Value("${jwt.refresh-expiration:604800000}") // 7 дней
    private long refreshExpiration;
    
    public String generateAccessToken(Person person) {
        return Jwts.builder()
            .setSubject(person.getPersonId())
            .claim("role", person.getRole())
            .claim("firstName", person.getFirstName())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + accessExpiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public String generateRefreshToken(Person person) {
        return Jwts.builder()
            .setSubject(person.getPersonId())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public String extractPersonId(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    public String extractRole(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody()
            .get("role", String.class);
    }
}
```

---

## 🚀 Тестирование

### 1. Login
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"doctor001","password":"password123"}' \
  -c cookies.txt -v
```

Проверь в ответе:
```
Set-Cookie: accessToken=eyJhbGc...; HttpOnly; Secure; Path=/; Max-Age=900; SameSite=Strict
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; Path=/api/auth/refresh; Max-Age=604800; SameSite=Strict
```

### 2. Запрос к монолиту с токеном
```bash
curl http://localhost:8080/api/doctor/patients \
  -b cookies.txt -v
```

### 3. Refresh токена
```bash
curl -X POST http://localhost:8082/api/auth/refresh \
  -b cookies.txt -c cookies.txt -v
```

---

## 📚 Дополнительные ресурсы

- [OWASP: HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Итоговая архитектура

```
┌─────────────────┐
│   Frontend      │
│  (localhost:    │
│     5173)       │
└────────┬────────┘
         │
         │ credentials: 'include'
         │ (автоматически отправляет HttpOnly cookies)
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│ Auth Service    │              │   Monolith      │
│ (port 8082)     │              │   (port 8080)   │
│                 │              │                 │
│ /auth/login     │              │ /doctor/*       │
│ /auth/refresh   │              │ /nurse/*        │
│ /auth/logout    │              │ /admin/*        │
│                 │              │ /anesthesio*    │
│ Устанавливает   │              │                 │
│ HttpOnly cookies│              │ Проверяет       │
│ с токенами      │              │ accessToken     │
│                 │              │ из cookie       │
└─────────────────┘              └─────────────────┘
```

**Безопасность:**
- ✅ Токены НЕ доступны JavaScript (HttpOnly)
- ✅ Защита от XSS атак
- ✅ Защита от CSRF (SameSite=Strict)
- ✅ Автоматический refresh при 401
- ✅ Фронтенд НЕ хранит токены
