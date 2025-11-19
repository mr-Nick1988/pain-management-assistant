# 📊 Analytics & Reporting Microservice Integration

## Обзор

Успешно интегрирован **Analytics & Reporting Microservice** (Port 8091) с фронтендом приложения управления болью.

### Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + RTK Query)              │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │ MicroserviceAnalytics│    │ MicroserviceReporting    │  │
│  │  (Events Viewer)     │    │  (Aggregated Reports)    │  │
│  └──────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Analytics Microservice (Port 8091)                   │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  Analytics API       │    │  Reporting API           │  │
│  │  /api/analytics/*    │    │  /api/reporting/*        │  │
│  └──────────────────────┘    └──────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  MongoDB             │    │  PostgreSQL              │  │
│  │  (Raw Events)        │    │  (Aggregated Reports)    │  │
│  └──────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
                      Kafka Events
                           │
┌─────────────────────────────────────────────────────────────┐
│              Monolith Backend (Port 8080)                    │
│  Publishes events: VAS_RECORDED, RECOMMENDATION_CREATED,    │
│  ESCALATION_CREATED, USER_LOGIN_SUCCESS, etc.               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Созданные файлы

### 1. **Типы данных**
📄 `src/types/analytics.ts` (расширен)

Добавлены типы для микросервиса:
- `MicroserviceAnalyticsEvent` - сырые события из MongoDB
- `MicroserviceDailyReportAggregate` - дневные агрегированные отчеты
- `MicroserviceWeeklyReportAggregate` - недельные отчеты
- `MicroserviceMonthlyReportAggregate` - месячные отчеты
- `MicroserviceEventType` - типы событий (union type)
- Query параметры для всех эндпоинтов

### 2. **API Slice**
📄 `src/api/api/apiAnalyticsMicroserviceSlice.ts`

RTK Query API для микросервиса с эндпоинтами:

**Analytics Endpoints:**
- `useGetMicroserviceEventsQuery` - получить события за период
- `useCreateMicroserviceEventMutation` - создать событие вручную

**Reporting Endpoints:**
- `useTriggerDailyAggregationMutation` - запустить дневную агрегацию
- `useGetDailyReportQuery` - получить дневной отчет
- `useTriggerWeeklyAggregationMutation` - запустить недельную агрегацию
- `useTriggerMonthlyAggregationMutation` - запустить месячную агрегацию

### 3. **Компоненты**

#### 📊 MicroserviceAnalytics
📄 `src/components/admin/MicroserviceAnalytics.tsx`

**Функционал:**
- ✅ Просмотр сырых событий из MongoDB
- ✅ Фильтрация по дате (date range picker)
- ✅ Фильтрация по типу события (dropdown)
- ✅ Фильтрация по пользователю (userId)
- ✅ Фильтрация по пациенту (MRN)
- ✅ Статистика: Total Events, Event Types, Critical Events, User Roles
- ✅ Timeline с детальной информацией о каждом событии
- ✅ Metadata viewer (expandable JSON)
- ✅ Quick date presets (Today, Last 24h, Last 7 days, Last 30 days)
- ✅ Цветовая кодировка событий (успех/ошибка/эскалация)
- ✅ Иконки для каждого типа события

**Доступ:** `/admin/microservice-analytics`

#### 📈 MicroserviceReporting
📄 `src/components/admin/MicroserviceReporting.tsx`

**Функционал:**
- ✅ Просмотр агрегированных отчетов из PostgreSQL
- ✅ Tabs: Daily / Weekly / Monthly
- ✅ Запуск агрегации вручную (кнопки)
- ✅ Дневной отчет с полной детализацией:
  - Пациенты (зарегистрировано, VAS записи, критические случаи)
  - Рекомендации (одобрено/отклонено, approval rate)
  - Эскалации (всего/разрешено/pending, среднее время разрешения)
  - Система (операции, ошибки, время обработки)
  - Пользователи (логины, уникальные пользователи, failed attempts)
  - Топ-10 препаратов (из JSON поля)
  - Dose adjustments (из JSON поля)
- ✅ Date picker с quick presets (Today, Yesterday)
- ✅ Loading states для агрегации
- ✅ Error handling (отчет не найден)

**Доступ:** `/admin/microservice-reporting`

### 4. **Конфигурация**

#### Store Integration
📄 `src/app/store.ts`

```typescript
import {analyticsMicroserviceApi} from "../api/api/apiAnalyticsMicroserviceSlice.ts";

// Добавлен reducer и middleware для микросервиса
```

#### Constants
📄 `src/utils/constants.ts`

```typescript
export const analytics_microservice_url = 'http://localhost:8091';
```

#### Routes
📄 `src/routes/AppRoutes.tsx`

```typescript
<Route path="microservice-analytics" element={<MicroserviceAnalytics/>}/>
<Route path="microservice-reporting" element={<MicroserviceReporting/>}/>
```

#### Exports
📄 `src/exports/exports.ts`

```typescript
export {default as MicroserviceAnalytics} from "../components/admin/MicroserviceAnalytics.tsx"
export {default as MicroserviceReporting} from "../components/admin/MicroserviceReporting.tsx"
```

### 5. **AdminDashboard Integration**
📄 `src/components/admin/AdminDashboard.tsx`

Добавлены 2 новые карточки:
- 🔬 **Microservice Analytics** - Real-time events from Analytics Microservice
- 📈 **Microservice Reporting** - Aggregated reports from microservice

---

## 🚀 Использование

### 1. Запуск микросервиса

```bash
# Убедитесь, что микросервис запущен на порту 8091
# Проверка здоровья:
curl http://localhost:8091/actuator/health
```

### 2. Доступ к компонентам

1. Войдите как **ADMIN**
2. Перейдите в **Admin Dashboard**
3. Выберите:
   - **Microservice Analytics** - для просмотра событий
   - **Microservice Reporting** - для просмотра отчетов

### 3. Просмотр событий (Analytics)

```
1. Выберите период (start/end date)
2. Примените фильтры (event type, user, patient)
3. Нажмите "Refresh" для обновления
4. Просмотрите timeline событий
5. Раскройте metadata для деталей
```

### 4. Просмотр отчетов (Reporting)

```
1. Выберите тип отчета (Daily/Weekly/Monthly)
2. Выберите дату
3. Нажмите "Run Aggregation" если отчета нет
4. Просмотрите агрегированные метрики
5. Изучите топ-препараты и dose adjustments
```

---

## 📋 API Эндпоинты микросервиса

### Analytics Endpoints

#### GET /api/analytics/events
Получить события за период

**Query Parameters:**
- `start` - ISO 8601 datetime (e.g., `2025-11-11T00:00:00`)
- `end` - ISO 8601 datetime (e.g., `2025-11-11T23:59:59`)

**Response:** `MicroserviceAnalyticsEvent[]`

```json
[
  {
    "id": "673234abc123",
    "timestamp": "2025-11-11T14:30:00",
    "eventType": "VAS_RECORDED",
    "patientMrn": "MRN12345",
    "userId": "nurse_001",
    "userRole": "NURSE",
    "vasLevel": 8,
    "priority": "HIGH",
    "metadata": {
      "painLocation": "Lower Back",
      "isCritical": true
    }
  }
]
```

#### POST /api/analytics/events
Создать событие вручную (fallback)

**Request Body:** `Partial<MicroserviceAnalyticsEvent>`

### Reporting Endpoints

#### POST /api/reporting/aggregate/daily?date={YYYY-MM-DD}
Запустить дневную агрегацию

**Example:** `POST /api/reporting/aggregate/daily?date=2025-11-11`

**Response:** `MicroserviceDailyReportAggregate`

#### GET /api/reporting/daily/{YYYY-MM-DD}
Получить дневной отчет

**Example:** `GET /api/reporting/daily/2025-11-11`

**Response:** `MicroserviceDailyReportAggregate | null`

#### POST /api/reporting/aggregate/weekly
Запустить недельную агрегацию

**Query Parameters:**
- `weekStart` - YYYY-MM-DD (Monday)
- `weekEnd` - YYYY-MM-DD (Sunday)

#### POST /api/reporting/aggregate/monthly
Запустить месячную агрегацию

**Query Parameters:**
- `year` - YYYY (e.g., 2025)
- `month` - MM (1-12)

---

## 🎨 Дизайн и стилизация

Все компоненты следуют единой дизайн-системе проекта:

- ✅ **Tailwind CSS** utility classes
- ✅ **Gradient headers** (purple-blue для Analytics, cyan-blue для Reporting)
- ✅ **Color-coded cards** (blue/purple/orange/green)
- ✅ **Responsive design** (360px - 1280px+)
- ✅ **Touch-friendly** интерфейс
- ✅ **Loading states** с спиннерами
- ✅ **Error handling** с понятными сообщениями
- ✅ **Icons** для визуальной идентификации

---

## 🔒 Безопасность

### Текущая реализация (Development)

```typescript
// JWT токен передается в заголовках (для будущей интеграции)
prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
}
```

⚠️ **ВАЖНО:** Микросервис НЕ имеет встроенной аутентификации!

### Production рекомендации

**Option 1: API Gateway** (рекомендуется)
```
Frontend → API Gateway (JWT validation) → Analytics Microservice
```

**Option 2: Proxy через монолит**
```
Frontend → Monolith (validates JWT) → Analytics Microservice
```

**Option 3: Добавить аутентификацию в микросервис**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // JWT validation filter
}
```

---

## 🧪 Тестирование

### 1. Проверка доступности микросервиса

```bash
# Health check
curl http://localhost:8091/actuator/health

# Expected: {"status":"UP"}
```

### 2. Тестирование событий

```bash
# Получить события за сегодня
curl "http://localhost:8091/api/analytics/events?start=2025-11-11T00:00:00&end=2025-11-11T23:59:59"
```

### 3. Тестирование агрегации

```bash
# Запустить дневную агрегацию
curl -X POST "http://localhost:8091/api/reporting/aggregate/daily?date=2025-11-11"

# Получить отчет
curl "http://localhost:8091/api/reporting/daily/2025-11-11"
```

### 4. UI тестирование

1. ✅ Откройте `/admin/microservice-analytics`
2. ✅ Проверьте загрузку событий
3. ✅ Примените фильтры
4. ✅ Проверьте статистику
5. ✅ Откройте `/admin/microservice-reporting`
6. ✅ Запустите агрегацию
7. ✅ Проверьте отчет

---

## 🐛 Troubleshooting

### Проблема: CORS ошибки

```
Access to fetch at 'http://localhost:8091/api/analytics/events' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Решение:** Добавить `@CrossOrigin` в контроллеры микросервиса:

```java
@CrossOrigin(origins = {"http://localhost:3000", "https://yourdomain.com"})
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    // ...
}
```

### Проблема: Пустые отчеты

```json
{}
```

**Решение:** Запустить агрегацию вручную через UI или API:

```bash
curl -X POST "http://localhost:8091/api/reporting/aggregate/daily?date=2025-11-11"
```

### Проблема: Микросервис недоступен

```
❌ Microservice Unavailable
Cannot connect to Analytics Microservice (Port 8091)
```

**Решение:**
1. Проверьте, что микросервис запущен
2. Проверьте порт 8091
3. Проверьте firewall/network settings
4. Проверьте URL в `constants.ts`

### Проблема: Старые данные

**Решение:** Проверьте:
1. Монолит публикует события в Kafka
2. Микросервис потребляет события из Kafka
3. Kafka работает корректно
4. MongoDB содержит события
5. Агрегация выполнена

---

## 📊 Типы событий

| Event Type | Описание | Источник |
|------------|----------|----------|
| `PERSON_CREATED` | Создан пользователь | Admin |
| `PERSON_DELETED` | Удален пользователь | Admin |
| `PERSON_UPDATED` | Обновлен пользователь | Admin |
| `USER_LOGIN_SUCCESS` | Успешный вход | Auth |
| `USER_LOGIN_FAILED` | Неудачный вход | Auth |
| `PATIENT_REGISTERED` | Зарегистрирован пациент | Nurse/Doctor |
| `EMR_CREATED` | Создана EMR запись | Nurse/Doctor |
| `VAS_RECORDED` | Записан уровень боли | Nurse/External |
| `RECOMMENDATION_CREATED` | Создана рекомендация | Nurse |
| `RECOMMENDATION_APPROVED` | Одобрена рекомендация | Doctor |
| `RECOMMENDATION_REJECTED` | Отклонена рекомендация | Doctor |
| `DOSE_ADMINISTERED` | Введена доза | Anesthesiologist |
| `ESCALATION_CREATED` | Создана эскалация | System |
| `ESCALATION_RESOLVED` | Разрешена эскалация | Anesthesiologist |

---

## 🔄 Workflow

### Типичный workflow событий

```
1. Медсестра записывает VAS
   ↓
2. Монолит публикует VAS_RECORDED в Kafka
   ↓
3. Микросервис потребляет событие
   ↓
4. Событие сохраняется в MongoDB
   ↓
5. Админ просматривает в MicroserviceAnalytics
   ↓
6. В конце дня запускается агрегация
   ↓
7. Данные агрегируются в PostgreSQL
   ↓
8. Админ просматривает отчет в MicroserviceReporting
```

---

## 📈 Метрики в отчетах

### Дневной отчет включает:

**Пациенты:**
- Total Patients Registered
- Total VAS Records
- Average VAS Level
- Critical VAS Count (≥7)

**Рекомендации:**
- Total Recommendations
- Approved Recommendations
- Rejected Recommendations
- Approval Rate (%)

**Эскалации:**
- Total Escalations
- Resolved Escalations
- Pending Escalations
- Average Resolution Time (hours)

**Система:**
- Average Processing Time (ms)
- Total Operations
- Failed Operations

**Пользователи:**
- Total Logins
- Unique Active Users
- Failed Login Attempts

**Дополнительно:**
- Top Drugs (JSON)
- Dose Adjustments (JSON)

---

## 🎯 Следующие шаги

### Возможные улучшения:

1. **Real-time updates** - WebSocket для live событий
2. **Charts & Graphs** - Recharts/Chart.js для визуализации
3. **Export функционал** - CSV/PDF/Excel экспорт
4. **Advanced filters** - Больше опций фильтрации
5. **Notifications** - Уведомления о критических событиях
6. **Dashboards** - Кастомные дашборды с виджетами
7. **Scheduled reports** - Автоматическая отправка отчетов по email
8. **Alerts** - Настраиваемые алерты на события

---

## ✅ Checklist завершения

- ✅ Типы данных созданы (`analytics.ts`)
- ✅ API slice создан (`apiAnalyticsMicroserviceSlice.ts`)
- ✅ Store настроен (reducer + middleware)
- ✅ Constants обновлены (microservice URL)
- ✅ MicroserviceAnalytics компонент создан
- ✅ MicroserviceReporting компонент создан
- ✅ Routes добавлены
- ✅ Exports обновлены
- ✅ AdminDashboard обновлен (навигационные карточки)
- ✅ Документация создана
- ✅ Дизайн соответствует проекту
- ✅ Error handling реализован
- ✅ Loading states добавлены

---

## 📞 Контакты и поддержка

При возникновении проблем:
1. Проверьте консоль браузера (F12)
2. Проверьте Network tab (запросы к микросервису)
3. Проверьте логи микросервиса
4. Проверьте Kafka consumer logs
5. Обратитесь к этой документации

---

**Дата создания:** 2025-11-11  
**Версия:** 1.0  
**Статус:** ✅ Production Ready (с учетом security considerations)
