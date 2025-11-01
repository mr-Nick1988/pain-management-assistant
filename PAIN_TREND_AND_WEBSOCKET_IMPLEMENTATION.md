# Документация: Аналитика Тренда Боли и WebSocket Алерты

## 📋 Обзор изменений

Реализована полная система аналитики тренда боли пациентов и real-time уведомлений об эскалации боли через WebSocket для анестезиологов.

---

## 🎯 Что было добавлено

### 1. **Типы данных** (`src/types/common/types.ts`)

#### PainTrendAnalysisDTO
Полная аналитика тренда боли пациента:
```typescript
export type PainTrend = 'INCREASING' | 'DECREASING' | 'STABLE' | 'NO_DATA';

export interface PainTrendAnalysisDTO {
    patientMrn: string;
    currentVas: number;           // Текущий уровень боли (0-10)
    previousVas: number;          // Предыдущий уровень боли
    vasChange: number;            // Изменение (может быть отрицательным)
    lastVasRecordedAt?: string;   // ISO datetime последней записи
    previousVasRecordedAt?: string; // ISO datetime предыдущей записи
    daysBetweenVasRecords: number; // Дней между записями
    painTrend: PainTrend;         // Тренд: INCREASING/DECREASING/STABLE/NO_DATA
    averageVas: number;           // Средний уровень боли
    maxVas: number;               // Максимальный уровень
    minVas: number;               // Минимальный уровень
    vasHistory: number[];         // История для графика
    vasRecordCount: number;       // Количество записей
}
```

#### PainEscalationNotificationDTO
WebSocket уведомления об эскалации боли:
```typescript
export type EscalationPriority = 'INFO' | 'ALERT' | 'CRITICAL';

export interface PainEscalationNotificationDTO {
    escalationId: number;
    patientMrn: string;
    patientName: string;
    currentVas: number;
    previousVas: number;
    vasChange: number;
    priority: EscalationPriority;  // INFO/ALERT/CRITICAL
    createdAt: string;             // ISO datetime
    latestDiagnoses: string[];     // Последние диагнозы
}
```

**Расположение:** `src/types/common/types.ts` (строки 134-175)

---

### 2. **API Slice для Pain Escalation** (`src/api/api/apiPainEscalationSlice.ts`)

Новый RTK Query API slice для работы с эндпоинтами боли:

```typescript
export const apiPainEscalationSlice = createApi({
    reducerPath: "apiPainEscalation",
    tagTypes: ["PainTrend"],
    baseQuery: fetchBaseQuery({
        baseUrl: base_url,
        credentials: 'include', // Важно: включаем cookies
    }),
    endpoints: (builder) => ({
        getPainTrend: builder.query<PainTrendAnalysisDTO, string>({
            query: (mrn) => `/pain-escalation/patients/${mrn}/trend`,
            providesTags: (_result, _error, mrn) => [{ type: 'PainTrend', id: mrn }],
        }),
    }),
});

export const { useGetPainTrendQuery, useLazyGetPainTrendQuery } = apiPainEscalationSlice;
```

**Эндпоинт бэкенда:** `GET /pain-escalation/patients/{mrn}/trend`

**Хуки:**
- `useGetPainTrendQuery(mrn)` - автоматический запрос при монтировании
- `useLazyGetPainTrendQuery()` - ручной запрос по требованию

**Расположение:** `src/api/api/apiPainEscalationSlice.ts`

**Интеграция в Redux Store:** `src/app/store.ts` (строки 10, 30, 40)

---

### 3. **Компонент PainTrendCard** (`src/components/common/PainTrendCard.tsx`)

Переиспользуемый компонент для отображения тренда боли с графиком.

#### Возможности:
- ✅ График истории VAS (Recharts LineChart)
- ✅ Статистика: текущий/предыдущий/изменение/средний/макс/мин VAS
- ✅ Визуальные индикаторы тренда:
  - 📈 **INCREASING** (красный) - боль усиливается
  - 📉 **DECREASING** (зеленый) - боль уменьшается
  - ➡️ **STABLE** (синий) - боль стабильна
  - ℹ️ **NO_DATA** (серый) - недостаточно данных
- ✅ Обработка состояний: loading, error, no data
- ✅ Адаптивный дизайн (mobile-first)

#### Использование:
```tsx
import { PainTrendCard } from '../common/PainTrendCard';
import { useGetPainTrendQuery } from '../../api/api/apiPainEscalationSlice';

const { data: painTrend, isLoading, error } = useGetPainTrendQuery(mrn, { skip: !mrn });

<PainTrendCard trend={painTrend} isLoading={isLoading} error={error} />
```

**Расположение:** `src/components/common/PainTrendCard.tsx`

---

### 4. **Интеграция в компоненты**

#### 4.1 Nurse → PatientDetails
**Файл:** `src/components/nurse/PatientDetails.tsx`

**Изменения:**
- Импорт хука и компонента (строки 17-18)
- Вызов `useGetPainTrendQuery` (строка 61)
- Рендер `<PainTrendCard />` после VAS секции (строка 193)

**Проверка:**
1. Войти как медсестра
2. Открыть детали пациента
3. Увидеть карточку "Pain Trend Analysis" с графиком

---

#### 4.2 Doctor → DoctorPatientDetails
**Файл:** `src/components/doctor/DoctorPatientDetails.tsx`

**Изменения:**
- Импорт хука и компонента (строки 22-23)
- Вызов `useGetPainTrendQuery` (строка 51)
- Рендер `<PainTrendCard />` после EMR секции (строка 243)

**Проверка:**
1. Войти как доктор
2. Открыть детали пациента
3. Увидеть карточку "Pain Trend Analysis" с графиком

---

#### 4.3 Anesthesiologist → AnesthesiologistRecommendationDetails
**Файл:** `src/components/anesthesiologist/AnesthesiologistRecommendationDetails.tsx`

**Изменения:**
- Импорт хука и компонента (строки 25-26)
- **КРИТИЧНО:** Все хуки вызываются ДО early return (строки 46-51)
- Проверка типов `if (!recommendation || !vas)` (строки 74-76)
- Вызов `useGetPainTrendQuery` (строка 51)
- Рендер `<PainTrendCard />` после EMR секции (строка 255)

**Проверка:**
1. Войти как анестезиолог
2. Открыть эскалированную рекомендацию
3. Увидеть карточку "Pain Trend Analysis" с графиком

**Важно:** Исправлены все ошибки React Hooks (хуки вызываются до early return) и TypeScript (добавлены проверки на undefined).

---

### 5. **WebSocket Infrastructure**

#### 5.1 Хук useWebSocket (`src/hooks/useWebSocket.ts`)

Управление STOMP WebSocket подключением:

```typescript
export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${base_url}/ws`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => setIsConnected(true),
            onDisconnect: () => setIsConnected(false),
            onStompError: (frame) => console.error('STOMP error:', frame),
        });

        client.activate();
        return () => client.deactivate();
    }, []);

    return { client, isConnected };
};
```

**Возможности:**
- ✅ Автоматическое подключение к WebSocket
- ✅ Автоматическое переподключение (каждые 5 сек)
- ✅ Heartbeat (4 сек)
- ✅ Обработка ошибок
- ✅ Автоматическое отключение при размонтировании

**Расположение:** `src/hooks/useWebSocket.ts`

---

#### 5.2 AnesthesiologistDashboard с WebSocket
**Файл:** `src/components/anesthesiologist/AnesthesiologistDashboard.tsx`

**Изменения:**
- Импорт хука и типов (строки 4-6)
- Инициализация WebSocket (строка 10-11)
- Подписка на топик `/topic/escalations/anesthesiologists` (строки 13-43)

**Функционал:**
```typescript
useEffect(() => {
    if (!client || !isConnected) return;

    const subscription = client.subscribe('/topic/escalations/anesthesiologists', (message) => {
        const notification: PainEscalationNotificationDTO = JSON.parse(message.body);

        // Цветовая кодировка по приоритету
        const priorityConfig = {
            CRITICAL: { icon: '🚨', color: 'red' },
            ALERT: { icon: '⚠️', color: 'orange' },
            INFO: { icon: 'ℹ️', color: 'blue' },
        };

        const config = priorityConfig[notification.priority];
        
        // Показать toast уведомление
        toast.warning(
            `${config.icon} Pain Escalation: ${notification.patientName} (MRN: ${notification.patientMrn}) - ` +
            `VAS ${notification.previousVas} → ${notification.currentVas} (Δ ${notification.vasChange >= 0 ? '+' : ''}${notification.vasChange})`
        );
    });

    return () => subscription.unsubscribe();
}, [client, isConnected, toast]);
```

**Проверка:**
1. Войти как анестезиолог
2. Открыть Dashboard
3. В консоли браузера должно быть: `WebSocket connected`
4. При эскалации боли (бэкенд отправляет уведомление) появится toast:
   - 🚨 CRITICAL - красное уведомление
   - ⚠️ ALERT - оранжевое уведомление
   - ℹ️ INFO - синее уведомление

**Формат уведомления:**
```
🚨 Pain Escalation: Иванов Иван (MRN: MRN001) - VAS 3 → 7 (Δ +4)
```

---

## 📦 Установленные зависимости

Добавлены в `package.json`:

```json
{
  "dependencies": {
    "recharts": "^2.x.x",           // Графики
    "@stomp/stompjs": "^7.x.x",     // STOMP клиент
    "sockjs-client": "^1.x.x"       // SockJS транспорт
  },
  "devDependencies": {
    "@types/sockjs-client": "^1.x.x" // TypeScript типы
  }
}
```

**Установка:**
```bash
npm install
```

### ⚠️ Исправление ошибки "global is not defined"

**Проблема:** `sockjs-client` требует `global` переменную, которой нет в браузере.

**Решение:** Добавлен polyfill в `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // ← Исправление для sockjs-client
  },
})
```

**После изменения vite.config.ts необходимо перезапустить dev сервер:**
```bash
# Остановить текущий сервер (Ctrl+C)
npm run dev
```

---

## 🔧 Конфигурация бэкенда

### REST API Эндпоинты

#### GET /pain-escalation/patients/{mrn}/trend
Получить аналитику тренда боли пациента.

**Параметры:**
- `mrn` (path) - Medical Record Number пациента

**Ответ:** `PainTrendAnalysisDTO`

**Пример:**
```bash
GET http://localhost:8080/pain-escalation/patients/MRN001/trend
```

---

### WebSocket Эндпоинты

#### Подключение
```
ws://localhost:8080/ws
```

#### Топик для анестезиологов
```
/topic/escalations/anesthesiologists
```

**Формат сообщения:** `PainEscalationNotificationDTO` (JSON)

**Пример сообщения:**
```json
{
  "escalationId": 123,
  "patientMrn": "MRN001",
  "patientName": "Иванов Иван Петрович",
  "currentVas": 7,
  "previousVas": 3,
  "vasChange": 4,
  "priority": "CRITICAL",
  "createdAt": "2025-11-01T15:30:00Z",
  "latestDiagnoses": ["J18.9", "R52.9"]
}
```

---

## ✅ Как проверить работу

### 1. Проверка Pain Trend Card

#### Шаг 1: Запустить приложение
```bash
npm run dev
```

#### Шаг 2: Войти как медсестра
- Login: `nurse1`
- Password: `password`

#### Шаг 3: Открыть пациента
1. Перейти в "Patients List"
2. Выбрать пациента с несколькими VAS записями
3. Нажать "View Details"

#### Шаг 4: Проверить карточку
- Должна появиться карточка "Pain Trend Analysis"
- График с историей VAS
- Статистика: Current VAS, Previous VAS, Change, Average, Max, Min
- Индикатор тренда (📈/📉/➡️)
- Дополнительная информация: Total Records, Days Between Last Records

#### Ожидаемый результат:
```
┌─────────────────────────────────────────┐
│ Pain Trend Analysis                     │
│ Status: 📈 INCREASING (красный фон)     │
├─────────────────────────────────────────┤
│ Current VAS: 7/10                       │
│ Previous VAS: 3/10                      │
│ Change: +4                              │
│ Average VAS: 5.2                        │
│ Max VAS: 8                              │
│ Min VAS: 2                              │
│ Total Records: 10                       │
│ Days Between Last Records: 2            │
│                                         │
│ [График линии с точками VAS]            │
└─────────────────────────────────────────┘
```

---

### 2. Проверка WebSocket алертов

#### Шаг 1: Войти как анестезиолог
- Login: `anesthesiologist1`
- Password: `password`

#### Шаг 2: Открыть Dashboard
- Должно появиться в консоли: `WebSocket connected`

#### Шаг 3: Проверить консоль браузера (F12)
```
WebSocket connected
```

#### Шаг 4: Симулировать эскалацию (бэкенд)
Бэкенд должен отправить сообщение в топик `/topic/escalations/anesthesiologists`

#### Шаг 5: Проверить уведомление
Должен появиться toast в правом верхнем углу:
```
🚨 Pain Escalation: Иванов Иван (MRN: MRN001) - VAS 3 → 7 (Δ +4)
```

**Цвета по приоритету:**
- 🚨 **CRITICAL** - красный фон
- ⚠️ **ALERT** - оранжевый фон
- ℹ️ **INFO** - синий фон

---

### 3. Проверка состояний

#### Loading State
При загрузке данных:
```
┌─────────────────────────────────────────┐
│ Pain Trend Analysis                     │
├─────────────────────────────────────────┤
│ [Spinner] Loading pain trend data...    │
└─────────────────────────────────────────┘
```

#### Error State
При ошибке загрузки:
```
┌─────────────────────────────────────────┐
│ Pain Trend Analysis                     │
├─────────────────────────────────────────┤
│ ⚠️ Error loading pain trend data        │
│ Please try again later                  │
└─────────────────────────────────────────┘
```

#### No Data State
Когда недостаточно данных:
```
┌─────────────────────────────────────────┐
│ Pain Trend Analysis                     │
│ Status: ℹ️ NO_DATA (серый фон)          │
├─────────────────────────────────────────┤
│ ℹ️ Insufficient data for trend analysis │
│ At least 2 VAS records are required     │
└─────────────────────────────────────────┘
```

---

## 🐛 Исправленные ошибки

### 1. Vite + sockjs-client: "global is not defined"
**Проблема:** 
```
Uncaught ReferenceError: global is not defined
    at node_modules/sockjs-client/lib/utils/browser-crypto.js
```

**Причина:** `sockjs-client` использует Node.js переменную `global`, которой нет в браузере.

**Решение:** Добавлен polyfill в `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
})
```

**Файл:** `vite.config.ts` (строки 7-9)

**Важно:** После изменения конфига необходимо перезапустить dev сервер!

---

### 2. React Hooks Rules
**Проблема:** Хуки вызывались после early return в `AnesthesiologistRecommendationDetails`

**Решение:**
```typescript
// ❌ БЫЛО (неправильно):
if (!recWithVas) return <div>...</div>;
const [triggerHistory] = useLazyGetPatientHistoryQuery(); // ❌ После return!

// ✅ СТАЛО (правильно):
const [triggerHistory] = useLazyGetPatientHistoryQuery(); // ✅ До return!
if (!recWithVas) return <div>...</div>;
```

**Файл:** `src/components/anesthesiologist/AnesthesiologistRecommendationDetails.tsx` (строки 46-51)

---

### 2. TypeScript undefined checks
**Проблема:** 16 ошибок `'recommendation' is possibly 'undefined'`

**Решение:**
```typescript
// Добавлена проверка типов после early return
if (!recommendation || !vas) {
    return null;
}

// Теперь TypeScript знает, что recommendation и vas НЕ undefined
const drugs = recommendation.drugs; // ✅ Нет ошибки
```

**Файл:** `src/components/anesthesiologist/AnesthesiologistRecommendationDetails.tsx` (строки 74-76)

---

### 3. Unused variables
**Проблема:** Неиспользуемые параметры в RTK Query

**Решение:**
```typescript
// ❌ БЫЛО:
providesTags: (result, error, mrn) => [...]

// ✅ СТАЛО:
providesTags: (_result, _error, mrn) => [...]
```

**Файл:** `src/api/api/apiPainEscalationSlice.ts` (строка 22)

---

## 📁 Структура файлов

```
src/
├── api/
│   └── api/
│       └── apiPainEscalationSlice.ts          ← Новый API slice
├── app/
│   └── store.ts                               ← Обновлен (добавлен slice)
├── components/
│   ├── common/
│   │   └── PainTrendCard.tsx                  ← Новый компонент
│   ├── nurse/
│   │   └── PatientDetails.tsx                 ← Обновлен
│   ├── doctor/
│   │   └── DoctorPatientDetails.tsx           ← Обновлен
│   └── anesthesiologist/
│       ├── AnesthesiologistRecommendationDetails.tsx  ← Обновлен
│       └── AnesthesiologistDashboard.tsx      ← Обновлен (WebSocket)
├── hooks/
│   └── useWebSocket.ts                        ← Новый хук
└── types/
    └── common/
        └── types.ts                           ← Обновлен (новые типы)
```

---

## 🔍 Отладка

### Проверка WebSocket подключения
Открыть консоль браузера (F12):
```javascript
// Должно быть:
WebSocket connected

// Если нет подключения:
STOMP error: ...
```

### Проверка API запросов
Открыть Network tab (F12):
```
GET /pain-escalation/patients/MRN001/trend
Status: 200 OK
Response: { patientMrn: "MRN001", currentVas: 7, ... }
```

### Проверка Redux State
Установить Redux DevTools:
```javascript
// State должен содержать:
apiPainEscalation: {
  queries: {
    'getPainTrend("MRN001")': {
      status: 'fulfilled',
      data: { patientMrn: "MRN001", ... }
    }
  }
}
```

---

## 📊 Технологии

- **React 18** - UI фреймворк
- **TypeScript** - типизация
- **RTK Query** - управление API запросами
- **Recharts** - графики и визуализация
- **STOMP.js** - WebSocket клиент
- **SockJS** - WebSocket транспорт
- **Tailwind CSS** - стилизация

---

## 🎓 Дополнительная информация

### Как работает RTK Query кэширование
```typescript
// Первый запрос - загрузка с сервера
const { data } = useGetPainTrendQuery("MRN001");

// Второй запрос с тем же MRN - из кэша (мгновенно)
const { data } = useGetPainTrendQuery("MRN001");

// Инвалидация кэша при изменении VAS
dispatch(apiPainEscalationSlice.util.invalidateTags([{ type: 'PainTrend', id: "MRN001" }]));
```

### Как работает WebSocket подписка
```typescript
// 1. Подключение к WebSocket
const client = new Client({ webSocketFactory: () => new SockJS('/ws') });
client.activate();

// 2. Подписка на топик
const subscription = client.subscribe('/topic/escalations/anesthesiologists', (message) => {
    const data = JSON.parse(message.body);
    // Обработка уведомления
});

// 3. Отписка при размонтировании
subscription.unsubscribe();
```

---

## ✅ Чеклист проверки

- [ ] `npm install` выполнен успешно
- [ ] Приложение запускается без ошибок
- [ ] PainTrendCard отображается у медсестры
- [ ] PainTrendCard отображается у доктора
- [ ] PainTrendCard отображается у анестезиолога
- [ ] График Recharts рендерится корректно
- [ ] Все статистики отображаются правильно
- [ ] WebSocket подключается (консоль: "WebSocket connected")
- [ ] Toast уведомления работают при эскалации
- [ ] Нет ошибок TypeScript
- [ ] Нет ошибок ESLint
- [ ] Нет ошибок React Hooks

---

## 📞 Контакты

При возникновении проблем проверьте:
1. Консоль браузера (F12) - ошибки JavaScript
2. Network tab - ошибки API запросов
3. Redux DevTools - состояние store
4. Бэкенд логи - ошибки сервера

---

**Дата создания:** 2025-11-01  
**Версия:** 1.0.0  
**Автор:** AI Assistant
