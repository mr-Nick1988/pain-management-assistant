# 🚀 БЫСТРЫЙ ТЕСТ External VAS Integration

## ✅ ЧТО ДОБАВЛЕНО

В **External VAS Monitor** теперь есть **2 вкладки**:
1. **📊 Monitor** - просмотр VAS записей (было раньше)
2. **🧪 Device Simulator** - отправка VAS с устройства (НОВОЕ!)

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### ШАГ 1: Запустить приложения

```bash
# Backend (должен быть на порту 8080)
# Frontend
cd C:\front_projects\pain_management_assistant
npm run dev
```

Откроется: `http://localhost:5173`

---

### ШАГ 2: Войти как Admin

```
Login: admin
Password: (ваш пароль)
```

---

### ШАГ 3: Сгенерировать API ключ

1. **Перейти:** Admin Dashboard → 🔑 **API Key Management**
2. **Нажать:** "+ Generate New API Key"
3. **Заполнить:**
   - System Name: `Test`
   - Остальное оставить по умолчанию
4. **Нажать:** "Generate"
5. **ВАЖНО!** Скопировать ПОЛНЫЙ ключ из модального окна:
   ```
   pma_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```
6. **Сохранить в блокнот!**

---

### ШАГ 4: Создать пациента (если нет)

**Вариант A: Через Backend API**
```bash
curl -X POST http://localhost:8080/api/emr/mock/generate
```

**Вариант B: Через Frontend**
- Nurse Dashboard → Register Patient
- Запомнить MRN (например: `MRN-42`)

---

### ШАГ 5: Отправить VAS через Simulator

1. **Перейти:** Nurse Dashboard → 📡 **External VAS Monitor**
2. **Переключиться на вкладку:** 🧪 **Device Simulator**
3. **Заполнить форму:**
   ```
   🔑 API Key: pma_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   👤 Patient MRN: MRN-42
   📊 VAS Level: 8 (двигаем slider вправо)
   🖥️ Device ID: MONITOR-001
   📍 Location: Ward A, Bed 12
   🔌 Source: VAS Monitor
   📝 Notes: Test from simulator
   ```
4. **Нажать:** 📡 **Send VAS Record**

---

### ШАГ 6: Проверить результат

**Должно появиться:**
```
✅ Success toast: "VAS Record Created! ID: 123"
```

**Автоматически переключится на вкладку "Monitor"**

**В таблице появится запись:**
```
Time: Just now
Patient: [Имя] MRN-42
VAS Level: 🔴 8
Device: MONITOR-001
Location: Ward A, Bed 12
Source: VAS_MONITOR
Notes: Test from simulator
```

**Статистика обновится:**
```
Total Records Today: 1
Average VAS: 8.0
High Pain Alerts: 🔴 1
Active Devices: 1
```

---

## 🎯 ЧТО ТЕСТИРОВАТЬ

### ✅ Базовый функционал
- [ ] Генерация API ключа
- [ ] Отправка VAS через Simulator
- [ ] Запись появляется в Monitor
- [ ] Статистика обновляется
- [ ] Toast уведомления работают

### ✅ Валидация
- [ ] Без API ключа → ошибка "Please enter API Key"
- [ ] Без Patient MRN → ошибка "Please enter Patient MRN"
- [ ] Неверный API ключ → ошибка "Invalid API key"
- [ ] Несуществующий пациент → ошибка "Patient not found"

### ✅ Фильтры (вкладка Monitor)
- [ ] Фильтр по Device ID
- [ ] Фильтр по Location
- [ ] Фильтр по Time Range (1h, 6h, 24h)
- [ ] Auto-refresh каждые 30 секунд

### ✅ UI/UX
- [ ] Переключение между вкладками
- [ ] Slider для VAS Level (цвет меняется: зеленый → желтый → красный)
- [ ] Кнопка Reset очищает форму
- [ ] Кнопка Send блокируется во время отправки
- [ ] Клик на запись → переход к пациенту

---

## 🧪 ТЕСТ СЦЕНАРИИ

### Сценарий 1: Низкая боль (VAS 0-3)
```
VAS Level: 2
Ожидается: 🟢 Зеленый индикатор
```

### Сценарий 2: Средняя боль (VAS 4-6)
```
VAS Level: 5
Ожидается: 🟡 Желтый индикатор
```

### Сценарий 3: Высокая боль (VAS 7-10)
```
VAS Level: 9
Ожидается: 🔴 Красный индикатор + High Pain Alert +1
```

### Сценарий 4: Несколько устройств
```
1. Отправить VAS с MONITOR-001
2. Отправить VAS с MONITOR-002
3. Отправить VAS с TABLET-001

Ожидается: Active Devices = 3
```

### Сценарий 5: Batch Import (через Postman)
```bash
POST http://localhost:8080/api/external/vas/batch
Headers:
  X-API-Key: pma_live_...
  Content-Type: text/csv

Body:
patientMrn,vasLevel,deviceId,location,timestamp
MRN-42,7,MONITOR-001,Ward A,2025-10-26T08:00:00
MRN-42,6,MONITOR-001,Ward A,2025-10-26T09:00:00
MRN-42,9,MONITOR-001,Ward A,2025-10-26T10:00:00

Ожидается: 3 записи добавлены, статистика обновлена
```

---

## ❌ TROUBLESHOOTING

### Проблема: "Invalid API key"
**Решение:**
1. Проверить что ключ скопирован полностью
2. Проверить что ключ активен (Admin → API Key Management)
3. Проверить что Backend запущен

### Проблема: "Patient not found"
**Решение:**
1. Проверить что пациент существует (MRN правильный)
2. Создать пациента через Nurse → Register Patient

### Проблема: Запись не появляется в Monitor
**Решение:**
1. Обновить страницу (F5)
2. Проверить фильтры (сбросить на "All")
3. Проверить Time Range (выбрать "Last 24 Hours")

### Проблема: Статистика не обновляется
**Решение:**
1. Нажать F5
2. Проверить что Backend endpoints работают:
   ```bash
   curl http://localhost:8080/api/external/vas/stats
   curl http://localhost:8080/api/external/vas/records
   ```

---

## 🎬 ПРЕЗЕНТАЦИОННЫЙ СЦЕНАРИЙ (10 минут)

### 0:00-0:02 - Генерация API ключа
- Показать Admin → API Key Management
- Сгенерировать ключ
- Показать что ключ показывается ОДИН РАЗ полностью
- После этого masked: `pma_live_a1b2c3d4****`

### 0:02-0:05 - Отправка VAS через Simulator
- Открыть Nurse → External VAS Monitor
- Вкладка Device Simulator
- Заполнить форму (VAS = 8)
- Отправить
- Показать success toast

### 0:05-0:07 - Проверка в Monitor
- Автоматически переключается на Monitor
- Запись появилась в таблице
- Статистика обновилась
- VAS Level красный (🔴 8)

### 0:07-0:09 - Фильтрация
- Фильтр по Device
- Фильтр по Location
- Фильтр по Time Range

### 0:09-0:10 - Batch Import (Postman)
- Отправить CSV с 3 записями
- Показать что все 3 появились
- Статистика пересчиталась

---

## 📊 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

После отправки 1 VAS записи (VAS=8):
```
✅ Success toast
✅ Запись в таблице Monitor
✅ Total Records Today: 1
✅ Average VAS: 8.0
✅ High Pain Alerts: 1 (🔴)
✅ Active Devices: 1
✅ API Key Usage Count: 1
```

После batch import 3 записей (VAS=7,6,9):
```
✅ Total Records Today: 4
✅ Average VAS: 7.5
✅ High Pain Alerts: 2 (VAS 8 и 9)
✅ Active Devices: 1
✅ API Key Usage Count: 4
```

---

## 🔥 БЫСТРЫЕ КОМАНДЫ

### Health Check
```bash
curl http://localhost:8080/api/external/vas/health
```

### Создать пациента
```bash
curl -X POST http://localhost:8080/api/emr/mock/generate
```

### Отправить VAS (curl)
```bash
curl -X POST http://localhost:8080/api/external/vas/record \
  -H "X-API-Key: pma_live_XXXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"patientMrn":"MRN-42","vasLevel":8,"deviceId":"MONITOR-001","location":"Ward A"}'
```

### Получить записи
```bash
curl http://localhost:8080/api/external/vas/records?timeRange=24h
```

### Получить статистику
```bash
curl http://localhost:8080/api/external/vas/stats
```

---

## ✅ ИТОГОВЫЙ CHECKLIST

**Перед тестированием:**
- [ ] Backend запущен (port 8080)
- [ ] Frontend запущен (port 5173)
- [ ] База данных доступна
- [ ] Создан хотя бы 1 пациент

**Во время теста:**
- [ ] API ключ сгенерирован
- [ ] VAS отправлен через Simulator
- [ ] Запись появилась в Monitor
- [ ] Статистика корректна
- [ ] Фильтры работают
- [ ] Toast уведомления показываются

**Готово к презентации!** 🎉
