# 🔄 Migration Checklist: JWT с HttpOnly Cookies

## ✅ Что уже сделано на фронтенде

### 1. Создана инфраструктура
- ✅ `src/api/baseQueryWithReauth.ts` - автоматический refresh при 401
- ✅ `src/api/api/apiAuthSlice.ts` - Authentication Service API
- ✅ Обновлены все API slices для использования `baseQueryWithReauth`
- ✅ Обновлен `Login.tsx` для работы с новым auth service
- ✅ Добавлен `apiAuthSlice` в Redux store

### 2. Обновленные файлы
```
✅ src/api/baseQueryWithReauth.ts (NEW)
✅ src/api/api/apiAuthSlice.ts (NEW)
✅ src/api/api/apiAdminSlice.ts (UPDATED)
✅ src/api/api/apiDoctorSlice.ts (UPDATED)
✅ src/api/api/apiNurseSlice.ts (UPDATED)
✅ src/api/api/apiAnesthesiologistSlice.ts (UPDATED)
✅ src/api/api/apiPersonSlice.ts (UPDATED)
✅ src/api/api/apiPainEscalationSlice.ts (UPDATED)
✅ src/components/person_login/Login.tsx (UPDATED)
✅ src/app/store.ts (UPDATED)
```

---

## 🔨 Что нужно сделать на бэкенде

### 1. Authentication Service (Port 8082)

#### A. Создать AuthController

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtService jwtService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        // TODO: Implement
        // 1. Валидация credentials
        // 2. Генерация токенов
        // 3. Установка HttpOnly cookies
        // 4. Возврат метаданных
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
        @CookieValue("refreshToken") String refreshToken,
        HttpServletResponse response
    ) {
        // TODO: Implement
        // 1. Валидация refreshToken
        // 2. Генерация нового accessToken
        // 3. Обновление cookie
    }
    
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(HttpServletResponse response) {
        // TODO: Implement
        // Удаление cookies (MaxAge = 0)
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
        @RequestBody ChangePasswordRequest request,
        @CookieValue("accessToken") String accessToken
    ) {
        // TODO: Implement
    }
    
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(
        @CookieValue("accessToken") String accessToken
    ) {
        // TODO: Implement
    }
}
```

#### B. Создать JwtService

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
        // TODO: Implement
    }
    
    public String generateRefreshToken(Person person) {
        // TODO: Implement
    }
    
    public boolean validateToken(String token) {
        // TODO: Implement
    }
    
    public String extractPersonId(String token) {
        // TODO: Implement
    }
    
    public String extractRole(String token) {
        // TODO: Implement
    }
}
```

#### C. Настроить CORS

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // ВАЖНО: Точный origin (НЕ "*")
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // КРИТИЧНО: Разрешить credentials
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

---

### 2. Monolith API (Port 8080)

#### A. Создать JwtAuthenticationFilter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // TODO: Implement
        // 1. Извлечь accessToken из cookie
        // 2. Валидировать токен
        // 3. Установить SecurityContext
        
        filterChain.doFilter(request, response);
    }
}
```

#### B. Настроить Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

#### C. Настроить CORS (аналогично Auth Service)

---

## 🧪 Тестирование

### 1. Запустить оба сервиса
```bash
# Authentication Service
cd authentication-service
./mvnw spring-boot:run

# Monolith
cd monolith
./mvnw spring-boot:run

# Frontend
cd front_projects/pain_management_assistant
npm run dev
```

### 2. Проверить login
1. Открыть http://localhost:5173/login
2. Ввести credentials
3. Проверить в DevTools → Application → Cookies:
   - `accessToken` (HttpOnly, Secure, SameSite=Strict)
   - `refreshToken` (HttpOnly, Secure, SameSite=Strict)
4. Проверить редирект на dashboard

### 3. Проверить API запросы
1. Открыть любой dashboard (admin/doctor/nurse)
2. Проверить в DevTools → Network:
   - Все запросы содержат Cookie header
   - Ответы 200 OK

### 4. Проверить автоматический refresh
1. Изменить срок жизни accessToken на 1 минуту (для теста)
2. Подождать 1 минуту
3. Сделать любой API запрос
4. В консоли увидеть: `[Auth] 401 detected, attempting token refresh...`
5. Запрос автоматически повторится

### 5. Проверить logout
1. Нажать кнопку Logout
2. Проверить, что cookies удалены
3. Проверить редирект на /login

---

## 📋 Checklist для бэкенд разработчика

### Authentication Service (8082)
- [ ] Создан AuthController с endpoints: login, refresh, logout, change-password, me
- [ ] Создан JwtService для генерации и валидации токенов
- [ ] HttpOnly cookies устанавливаются при login
- [ ] accessToken: 15 минут, refreshToken: 7 дней
- [ ] Secure flag включен (для production)
- [ ] SameSite=Strict для защиты от CSRF
- [ ] CORS настроен с allowCredentials: true
- [ ] Endpoint /refresh обновляет accessToken cookie
- [ ] Endpoint /logout удаляет cookies (MaxAge = 0)

### Monolith API (8080)
- [ ] Создан JwtAuthenticationFilter
- [ ] Filter извлекает accessToken из cookie
- [ ] Filter валидирует токен и устанавливает SecurityContext
- [ ] При 401 фронтенд автоматически вызывает refresh
- [ ] CORS настроен с allowCredentials: true
- [ ] Все защищенные endpoints требуют валидный токен

### Тестирование
- [ ] Login работает, cookies устанавливаются
- [ ] API запросы проходят с токеном из cookie
- [ ] Автоматический refresh при 401
- [ ] Logout удаляет cookies
- [ ] Редирект на /login при неудачном refresh

---

## 🚨 Важные моменты

### 1. CORS Configuration
```java
// ❌ НЕ РАБОТАЕТ с credentials:
config.setAllowedOrigins(Arrays.asList("*"));

// ✅ ПРАВИЛЬНО:
config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
config.setAllowCredentials(true);
```

### 2. Cookie Settings
```java
// КРИТИЧНО для безопасности:
cookie.setHttpOnly(true);  // Защита от XSS
cookie.setSecure(true);    // Только HTTPS (production)
cookie.setSameSite("Strict"); // Защита от CSRF
```

### 3. Token Expiration
```properties
# application.properties
jwt.secret=your-secret-key-min-256-bits
jwt.access-expiration=900000    # 15 минут
jwt.refresh-expiration=604800000 # 7 дней
```

---

## 📚 Документация

Подробные инструкции:
- `BACKEND_JWT_SETUP.md` - полная документация для бэкенда
- `FRONTEND_AUTH_GUIDE.md` - руководство для фронтенд разработчиков

---

## 🎯 Следующие шаги

1. **Бэкенд разработчик:**
   - Прочитать `BACKEND_JWT_SETUP.md`
   - Реализовать Authentication Service
   - Реализовать JWT Filter в монолите
   - Протестировать с фронтендом

2. **Фронтенд разработчик:**
   - Прочитать `FRONTEND_AUTH_GUIDE.md`
   - Протестировать после готовности бэкенда
   - Обновить компоненты при необходимости

3. **DevOps:**
   - Настроить HTTPS для production
   - Настроить environment variables для JWT secret
   - Настроить CORS для production domain

---

## ✅ Готово!

Фронтенд полностью готов к работе с JWT через HttpOnly cookies.
Осталось только реализовать бэкенд по инструкции в `BACKEND_JWT_SETUP.md`.
