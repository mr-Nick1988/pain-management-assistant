# 📦 FHIR Integration Module - Documentation

## Overview
Модуль External EMR Integration позволяет импортировать пациентов из внешних FHIR-совместимых медицинских систем (например, HAPI FHIR Test Server). Система автоматически получает демографические данные, лабораторные показатели и синхронизирует изменения.

## 🎯 Реализованные компоненты

### 1. **ImportPatientFromFHIR** (`/nurse/import-patient`)
Страница для поиска и импорта пациентов из FHIR системы.

#### Функциональность:
- **Поиск пациентов** по First Name, Last Name, Birth Date
- **Отображение результатов** с информацией:
  - Имя, дата рождения, пол
  - MRN из identifiers
  - Телефон, email, адрес
  - Badge источника (FHIR Server / Mock Generator)
- **Импорт пациента** с проверкой дублирования
- **Модальное окно результата** импорта:
  - Success/Error статус
  - Match Confidence badge (HIGH/MEDIUM/LOW)
  - Warnings и Errors
  - Manual Review Required (если нужно)
  - Кнопка "Go to Patient"
- **Testing Tools**:
  - Генерация 1 мокового пациента
  - Batch генерация (1-100 пациентов)

#### API Endpoints используемые:
- `GET /api/emr/search` - поиск пациентов
- `POST /api/emr/import/{fhirPatientId}` - импорт пациента
- `GET /api/emr/check-import/{fhirPatientId}` - проверка импорта
- `POST /api/emr/mock/generate` - генерация мока
- `POST /api/emr/mock/generate-batch` - batch генерация

### 2. **PatientSyncDashboard** (`/nurse/patient-sync`)
Dashboard для синхронизации данных пациентов с FHIR системой.

#### Функциональность:
- **Sync All Patients** - синхронизация всех пациентов
- **Auto-refresh** - автоматическое обновление каждые 5 минут
- **Sync Result Summary**:
  - Total Patients
  - Successful Syncs (зеленый)
  - Failed Syncs (красный)
  - Patients with Changes (желтый)
  - Duration и timestamps
  - Список ошибок
- **Таблица пациентов**:
  - MRN, Name, Source Type, Last Sync, Status
  - Кнопка "Sync" для каждого пациента
  - Индикатор синхронизации
  - Time ago форматирование

#### API Endpoints используемые:
- `POST /api/emr/sync/all` - синхронизация всех
- `POST /api/emr/sync/patient/{mrn}` - синхронизация одного
- `GET /api/nurse/patients` - список пациентов

### 3. **NurseDashboard** - обновлен
Добавлены новые карточки:
- **Import from FHIR** 📥 - переход к импорту
- **Patient Sync** 🔄 - переход к sync dashboard

## 📁 Структура файлов

```
src/
├── types/
│   └── fhir.ts                          # Типы для FHIR интеграции
├── api/api/
│   └── apiFhirSlice.ts                  # RTK Query API slice
├── components/fhir/
│   ├── ImportPatientFromFHIR.tsx        # Компонент импорта
│   └── PatientSyncDashboard.tsx         # Компонент синхронизации
├── app/
│   └── store.ts                         # Redux store (обновлен)
├── routes/
│   └── AppRoutes.tsx                    # Маршруты (обновлены)
└── exports/
    └── exports.ts                       # Экспорты (обновлены)
```

## 🔧 Технические детали

### Типы (fhir.ts)
```typescript
- FhirPatientDTO - пациент из FHIR
- EmrImportResultDTO - результат импорта
- FhirObservationDTO - лабораторные данные
- EmrSyncResultDTO - результат синхронизации
- ImportCheckDTO - проверка импорта
- FhirSearchParams - параметры поиска
```

### API Slice (apiFhirSlice.ts)
```typescript
Endpoints:
- searchFhirPatients (query)
- importPatientFromFhir (mutation)
- generateMockPatient (mutation)
- generateBatchMockPatients (mutation)
- getFhirObservations (query)
- checkImportStatus (query)
- syncAllPatients (mutation)
- syncPatient (mutation)

Tags: ['FhirPatients', 'SyncStatus']
```

### Redux Store
Добавлен `apiFhirSlice` в:
- `reducer` - apiFhirSlice.reducer
- `middleware` - apiFhirSlice.middleware

### Маршруты
```typescript
/nurse/import-patient -> ImportPatientFromFHIR
/nurse/patient-sync -> PatientSyncDashboard
```

## 🎨 Стилизация

Компоненты используют существующую UI библиотеку:
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Button` с вариантами: approve, update, default, reject, outline
- `Input`, `Label`
- `LoadingSpinner`
- `PageNavigation`

### Цветовая схема:
- **FHIR Server badge**: `bg-blue-100 text-blue-800`
- **Mock Generator badge**: `bg-gray-100 text-gray-800`
- **HIGH confidence**: `bg-green-100 text-green-800`
- **MEDIUM confidence**: `bg-yellow-100 text-yellow-800`
- **LOW confidence**: `bg-red-100 text-red-800`
- **Success**: зеленый
- **Warning**: желтый
- **Error**: красный
- **Manual Review**: оранжевый

## 🚀 Использование

### Импорт пациента:
1. Перейти в `/nurse/import-patient`
2. Ввести параметры поиска (First Name, Last Name, Birth Date)
3. Нажать "Search in FHIR System"
4. Выбрать пациента из результатов
5. Нажать "Import"
6. Проверить результат в модальном окне
7. Перейти к пациенту через "Go to Patient"

### Синхронизация:
1. Перейти в `/nurse/patient-sync`
2. Нажать "Sync All Patients" для полной синхронизации
3. Или нажать "Sync" для конкретного пациента
4. Включить "Auto-refresh" для автоматического обновления
5. Проверить результаты в Summary блоке

### Тестирование:
1. В `/nurse/import-patient` использовать "Testing Tools"
2. "Generate 1 Mock Patient" - создать одного тестового пациента
3. "Generate Batch" - создать несколько (1-100) пациентов

## ⚠️ Важные замечания

1. **Backend URL**: `http://localhost:8080/api/emr`
2. **Authorization**: Bearer token из localStorage
3. **Username**: берется из localStorage.getItem("username")
4. **Navigation**: после импорта переход к `/nurse/patient/{internalPatientId}`
5. **Error Handling**: все ошибки отображаются через toast notifications
6. **Loading States**: все операции имеют loading indicators

## 🔄 Workflow сценарии

### Сценарий 1: Импорт реального пациента
```
Nurse Dashboard → Import from FHIR → Search → Select → Import → View Result → Go to Patient
```

### Сценарий 2: Генерация тестовых данных
```
Import Patient → Testing Tools → Generate Mock/Batch → View Results
```

### Сценарий 3: Синхронизация
```
Nurse Dashboard → Patient Sync → Sync All → View Summary → Individual Sync (optional)
```

## 📊 Метрики и мониторинг

Dashboard отображает:
- Общее количество пациентов
- Успешные синхронизации
- Неудачные синхронизации
- Пациенты с изменениями
- Время начала/окончания синхронизации
- Длительность операции
- Список ошибок

## 🎯 Будущие улучшения

Возможные расширения:
1. Детальный просмотр изменений при синхронизации
2. История импортов
3. Фильтрация и сортировка в таблице синхронизации
4. Экспорт результатов синхронизации
5. Настройка интервала auto-refresh
6. Webhook уведомления о синхронизации
7. Batch импорт из результатов поиска

## 📝 Changelog

### Version 1.0.0 (2025-10-26)
- ✅ Создан модуль FHIR Integration
- ✅ Реализован ImportPatientFromFHIR компонент
- ✅ Реализован PatientSyncDashboard компонент
- ✅ Добавлены типы и API endpoints
- ✅ Интегрирован в Redux store
- ✅ Добавлены маршруты
- ✅ Обновлен NurseDashboard
- ✅ Успешная компиляция

---

**Модуль готов к использованию!** 🎉
