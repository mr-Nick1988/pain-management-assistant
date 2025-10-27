# 📡 External VAS Integration Module - Documentation

## Overview
Модуль External VAS Integration позволяет автоматически получать данные о боли (VAS) с внешних устройств:
- 🏥 Больничные мониторы боли
- 📱 Планшеты в палатах
- 📲 Мобильные приложения для пациентов
- 🔗 Интеграция с EMR системами других больниц

Для безопасности используется **API Key аутентификация** с:
- ✅ IP Whitelist (разрешенные IP адреса)
- ✅ Rate Limiting (ограничение запросов в минуту)
- ✅ Expiration (срок действия ключа)

---

## 🎯 Реализованные компоненты

### 1. **API Key Management** (`/admin/api-keys`) - ADMIN ONLY

Полнофункциональная система управления API ключами для внешних устройств.

#### Функциональность:

##### **Таблица API ключей:**
- Колонки: System Name, API Key (masked), Expires At, IP Whitelist, Rate Limit, Status, Actions
- API Key отображается как `pma_live_a1b2c3d4****` (первые 16 символов + звездочки)
- Status badges:
  - ✅ **Active** (зеленый) - ключ активен
  - ⚠️ **Expiring Soon** (желтый) - истекает менее чем через 30 дней
  - ❌ **Expired** (красный) - срок истек
  - ❌ **Deactivated** (серый) - деактивирован

##### **Генерация нового API ключа:**
Модальное окно с формой:
- **System Name** (required) - название системы
- **Description** (optional) - описание
- **Expires In Days** (optional) - срок действия в днях (пусто = никогда)
- **IP Whitelist** (optional) - разрешенные IP (`*` для любых)
- **Rate Limit Per Minute** (optional, default: 60)

##### **⚠️ КРИТИЧЕСКИ ВАЖНО - Показ ключа ТОЛЬКО ОДИН РАЗ:**
После генерации показывается модальное окно:
```
⚠️ SAVE THIS KEY NOW!
You won't be able to see this key again!

API Key: pma_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
[Copy to Clipboard]

System: Hospital Monitor System
Expires: 2026-10-26
IP Whitelist: 192.168.1.0/24
Rate Limit: 60/min

[I've Saved the Key]
```

##### **Edit функциональность:**
- Обновление IP Whitelist
- Обновление Rate Limit
- НЕ показывает полный API ключ (только masked)

##### **Деактивация:**
- Кнопка "Deactivate" с подтверждением
- Деактивированные ключи остаются в таблице но не работают

---

### 2. **External VAS Monitor** (`/nurse/external-vas-monitor`)

Real-time мониторинг VAS данных с внешних устройств.

#### Функциональность:

##### **Статистика (сверху):**
4 карточки с метриками:
- **Total Records Today**: 245
- **Average VAS**: 5.2
- **High Pain Alerts** (VAS ≥7): 🔴 12
- **Active Devices**: 8

##### **Фильтры:**
- **Device ID** (dropdown) - фильтр по устройству
- **Location** (dropdown) - фильтр по локации
- **Time Range** (dropdown):
  - Last 1 Hour
  - Last 6 Hours
  - Last 24 Hours

##### **Auto-refresh:**
- Checkbox "Auto-refresh every 30 seconds"
- Индикатор последнего обновления: "Last updated: 15 seconds ago"
- Автоматическое обновление данных каждые 30 секунд

##### **Таблица VAS записей:**
Колонки:
- **Time** - "2m ago", "5m ago" (time ago format)
- **Patient** - Имя + MRN
- **VAS Level** - с цветовым индикатором:
  - 🟢 0-3 (зеленый)
  - 🟡 4-6 (желтый)
  - 🔴 7-10 (красный)
- **Device ID** - ID устройства
- **Location** - локация
- **Source** - badge с типом источника:
  - VAS_MONITOR (синий)
  - MANUAL_ENTRY (серый)
  - EMR_SYSTEM (фиолетовый)
  - MOBILE_APP (зеленый)
  - TABLET (оранжевый)
- **Notes** - заметки

##### **Клик на запись:**
Переход к странице пациента `/nurse/patient/{mrn}`

---

### 3. **VAS Device Simulator** (`/nurse/vas-simulator`)

Компонент для тестирования интеграции с внешними устройствами.

#### Функциональность:

##### **Форма симуляции:**
- **API Key** - тестовый ключ (default: `pma_test_simulator_key`)
- **Patient MRN** (required)
- **VAS Level** - slider 0-10 с цветовым индикатором
- **Device ID** - ID устройства
- **Location** - локация
- **Source** - dropdown (VAS_MONITOR, MANUAL_ENTRY, EMR_SYSTEM, MOBILE_APP, TABLET)
- **Notes** (optional)

##### **Кнопки:**
- **📡 Send VAS Record** - отправить запись
- **🎲 Randomize** - случайные значения

##### **Response Display:**
После отправки показывается результат:
- ✅ Success (зеленый блок) - JSON с данными
- ❌ Error (красный блок) - JSON с ошибкой

##### **Quick Test Scenarios:**
3 готовых сценария:
- 🔴 **High Pain Alert** (VAS 8) - критическая боль
- 🟢 **Low Pain** (VAS 3) - низкая боль
- 🟡 **Moderate Pain** (VAS 5) - умеренная боль через Mobile App

---

## 📁 Структура файлов

```
src/
├── types/
│   └── externalVas.ts                   # Типы для External VAS
├── api/api/
│   └── apiExternalVasSlice.ts           # RTK Query API slice
├── components/
│   ├── admin/
│   │   └── ApiKeyManagement.tsx         # Управление API ключами
│   ├── nurse/
│   │   └── ExternalVasMonitor.tsx       # Мониторинг VAS
│   └── testing/
│       └── VasDeviceSimulator.tsx       # Симулятор устройства
├── app/
│   └── store.ts                         # Redux store (обновлен)
├── routes/
│   └── AppRoutes.tsx                    # Маршруты (обновлены)
└── exports/
    └── exports.ts                       # Экспорты (обновлены)
```

---

## 🔧 Технические детали

### Типы (externalVas.ts)

```typescript
// VAS Source types
export type VasSource = "VAS_MONITOR" | "MANUAL_ENTRY" | "EMR_SYSTEM" | "MOBILE_APP" | "TABLET";

// External VAS Record Request
export interface ExternalVasRecordRequest {
    patientMrn: string;
    vasLevel: number; // 0-10
    deviceId: string;
    location: string;
    timestamp: string; // ISO 8601
    notes?: string;
    source: VasSource;
}

// API Key DTO
export interface ApiKeyDTO {
    apiKey: string; // Masked
    systemName: string;
    description?: string;
    expiresAt?: string;
    ipWhitelist: string;
    rateLimitPerMinute: number;
    active: boolean;
    createdAt: string;
    createdBy: string;
}

// VAS Monitor Statistics
export interface VasMonitorStats {
    totalRecordsToday: number;
    averageVas: number;
    highPainAlerts: number;
    activeDevices: number;
}
```

### API Endpoints (apiExternalVasSlice.ts)

```typescript
// External VAS Endpoints (с API Key)
1. recordExternalVas - POST /external/vas/record
2. batchImportVas - POST /external/vas/batch
3. checkExternalVasHealth - GET /external/vas/health

// API Key Management (Admin только)
4. generateApiKey - POST /admin/api-keys/generate
5. getAllApiKeys - GET /admin/api-keys
6. deactivateApiKey - DELETE /admin/api-keys/{apiKey}
7. updateIpWhitelist - PUT /admin/api-keys/{apiKey}/whitelist
8. updateRateLimit - PUT /admin/api-keys/{apiKey}/rate-limit

// VAS Monitor
9. getExternalVasRecords - GET /external/vas/records
10. getVasMonitorStats - GET /external/vas/stats
```

### Redux Store

Добавлен `apiExternalVasSlice` в:
- `reducer` - apiExternalVasSlice.reducer
- `middleware` - apiExternalVasSlice.middleware

### Маршруты

```typescript
// Admin
/admin/api-keys -> ApiKeyManagement

// Nurse
/nurse/external-vas-monitor -> ExternalVasMonitor
/nurse/vas-simulator -> VasDeviceSimulator
```

---

## 🎨 Стилизация

### Gradient заголовки:
- **API Key Management**: purple → pink → red
- **External VAS Monitor**: blue → purple → pink

### Color-coded VAS levels:
- **0-3**: 🟢 `bg-green-50 text-green-600`
- **4-6**: 🟡 `bg-yellow-50 text-yellow-600`
- **7-10**: 🔴 `bg-red-50 text-red-600`

### Status badges:
- **Active**: `bg-green-100 text-green-800`
- **Expiring Soon**: `bg-yellow-100 text-yellow-800`
- **Expired**: `bg-red-100 text-red-800`
- **Deactivated**: `bg-gray-100 text-gray-800`

### Source badges:
- **VAS_MONITOR**: `bg-blue-100 text-blue-800`
- **MANUAL_ENTRY**: `bg-gray-100 text-gray-800`
- **EMR_SYSTEM**: `bg-purple-100 text-purple-800`
- **MOBILE_APP**: `bg-green-100 text-green-800`
- **TABLET**: `bg-orange-100 text-orange-800`

---

## 🚀 Workflow сценарии

### Сценарий 1: Настройка нового устройства (Admin)

```
1. Admin → /admin/api-keys
2. Click "Generate New API Key"
3. Fill form:
   - System Name: "Ward A Pain Monitors"
   - Description: "5 monitors in Ward A"
   - Expires In Days: 365
   - IP Whitelist: "192.168.1.0/24"
   - Rate Limit: 120
4. Click "Generate"
5. Modal shows FULL API KEY (ONLY ONCE!)
   ⚠️ SAVE THIS KEY NOW!
   pma_live_a1b2c3d4e5f6g7h8i9j0...
6. Copy key to clipboard
7. Click "I've Saved the Key"
8. Configure devices with this key
9. Devices start sending VAS data
```

### Сценарий 2: Мониторинг VAS (Nurse)

```
1. Nurse → /nurse/external-vas-monitor
2. See real-time VAS stream
3. Statistics:
   - 245 records today
   - Average VAS: 5.2
   - 12 high pain alerts 🔴
   - 8 active devices
4. Filter by "Ward A"
5. See patient MRN-42 with VAS=8 🔴
6. Click on record → /nurse/patient/MRN-42
7. View full patient details + VAS history
```

### Сценарий 3: Тестирование интеграции (Developer/Nurse)

```
1. Nurse → /nurse/vas-simulator
2. Fill form:
   - API Key: pma_test_simulator_key
   - Patient MRN: MRN-42
   - VAS Level: 8 (slider)
   - Device ID: SIMULATOR-001
   - Location: Ward A, Bed 12
   - Source: VAS_MONITOR
   - Notes: "Test high pain alert"
3. Click "Send VAS Record"
4. See response:
   ✅ Success
   {
     "status": "success",
     "vasId": 123,
     "patientMrn": "MRN-42",
     "vasLevel": 8
   }
5. Go to External VAS Monitor
6. See new record in table
7. Click "Quick Test Scenarios" for pre-filled forms
```

### Сценарий 4: Управление API ключами (Admin)

```
1. Admin → /admin/api-keys
2. See table with all keys
3. Click "Edit" on key
4. Update IP Whitelist: "192.168.1.0/24,10.0.0.0/8"
5. Click "Update IP Whitelist"
6. Or update Rate Limit: 200/min
7. Click "Update Rate Limit"
8. If key compromised → Click "Deactivate"
9. Confirm deactivation
10. Key status changes to ❌ Deactivated
```

---

## 📊 API Key Security

### Генерация ключа:
```
Format: pma_live_{random_32_chars}
Example: pma_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Хранение:
- Backend хранит **hash** ключа (не plain text)
- Frontend показывает **полный ключ ТОЛЬКО ОДИН РАЗ** при генерации
- После этого показывается **masked** версия: `pma_live_a1b2c3d4****`

### Валидация:
- Проверка API ключа в header `X-API-Key`
- Проверка IP адреса против whitelist
- Проверка rate limit (запросы в минуту)
- Проверка срока действия

### IP Whitelist формат:
```
* - любые IP (не рекомендуется для production)
192.168.1.0/24 - CIDR notation
192.168.1.0/24,10.0.0.0/8 - несколько подсетей
```

---

## 🧪 Тестирование

### Тест 1: Генерация API ключа
```
1. /admin/api-keys → Generate New API Key
2. System Name: "Test System"
3. Generate
4. Verify full key shown ONCE
5. Copy key
6. Close modal
7. Verify key is masked in table
```

### Тест 2: Отправка VAS с симулятора
```
1. /nurse/vas-simulator
2. Enter test API key
3. Enter patient MRN
4. Set VAS level
5. Send
6. Verify success response
7. Check External VAS Monitor
8. Verify record appears
```

### Тест 3: Auto-refresh
```
1. /nurse/external-vas-monitor
2. Enable auto-refresh
3. Send VAS from simulator
4. Wait 30 seconds
5. Verify table updates automatically
```

### Тест 4: Фильтрация
```
1. /nurse/external-vas-monitor
2. Send multiple VAS records with different devices
3. Filter by Device ID
4. Verify only matching records shown
5. Filter by Location
6. Verify filtering works
```

---

## ⚠️ Важные замечания

### Backend Requirements:
1. **API Key аутентификация** должна быть реализована
2. **IP Whitelist** проверка
3. **Rate Limiting** (например, через Redis)
4. **Expiration** проверка срока действия
5. **Hashing** API ключей в БД

### Security Best Practices:
- ✅ Никогда не логировать полные API ключи
- ✅ Показывать полный ключ ТОЛЬКО ОДИН РАЗ
- ✅ Использовать HTTPS для всех запросов
- ✅ Регулярно ротировать ключи
- ✅ Мониторить подозрительную активность

### Frontend Limitations:
- API ключ хранится в localStorage симулятора (только для тестов!)
- В production устройства должны хранить ключи безопасно
- Rate limiting обрабатывается на backend

---

## 📝 Changelog

### Version 1.0.0 (2025-10-26)
- ✅ Создан модуль External VAS Integration
- ✅ Реализован ApiKeyManagement компонент (Admin)
- ✅ Реализован ExternalVasMonitor компонент (Nurse)
- ✅ Реализован VasDeviceSimulator для тестирования
- ✅ Добавлены типы и API endpoints
- ✅ Интегрирован в Redux store
- ✅ Добавлены маршруты
- ✅ Обновлены Admin и Nurse dashboards
- ✅ Успешная компиляция (579.09 kB)

---

## 🎯 Будущие улучшения

Возможные расширения:
1. **Webhook notifications** - уведомления при критических VAS
2. **Analytics dashboard** - графики и тренды VAS данных
3. **Device health monitoring** - статус устройств
4. **Batch operations** - массовые операции с ключами
5. **Audit log** - детальный лог использования API
6. **Custom alerts** - настраиваемые оповещения
7. **Export data** - экспорт VAS данных в CSV/Excel
8. **Real-time WebSocket** - вместо polling

---

**Модуль готов к использованию!** 🎉

Для интеграции с реальными устройствами:
1. Сгенерируйте API ключ в `/admin/api-keys`
2. Настройте устройство с этим ключом
3. Устройство отправляет POST запросы на `/api/external/vas/record`
4. Мониторьте данные в `/nurse/external-vas-monitor`
