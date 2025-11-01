# 🧪 WebSocket Testing Guide

## ✅ Что исправлено

### Проблема
```
❌ Request URL: http://localhost:8080/api/ws/info?t=1762012037813
❌ Status Code: 404 Not Found
```

### Решение
```typescript
// БЫЛО (неправильно):
const socket = new SockJS(`${base_url}/ws`); // base_url = 'http://localhost:8080/api'
// Результат: http://localhost:8080/api/ws ❌

// СТАЛО (правильно):
const WS_URL = 'http://localhost:8080/ws';
const socket = new SockJS(WS_URL);
// Результат: http://localhost:8080/ws ✅
```

---

## 🚀 Быстрый старт

### 1. Открыть тестовую страницу
```
http://localhost:5173/websocket-test
```

### 2. Проверить подключение
- Должен быть зеленый индикатор: **✅ WebSocket Connected**
- В консоли браузера (F12): `✅ WebSocket connected successfully`

### 3. Отправить тестовое уведомление
Нажать кнопку **"📤 Send Test Notification"**

### 4. Проверить результат
- В логе сообщений должно появиться уведомление
- В консоли: `📨 Received escalation notification`
- Toast уведомление в правом верхнем углу

---

## 📋 Пошаговая проверка

### Шаг 1: Проверить бэкенд

```bash
# Проверить статус WebSocket
curl http://localhost:8080/api/websocket/status

# Ожидаемый ответ:
{
  "status": "active",
  "endpoint": "ws://localhost:8080/ws",
  ...
}
```

### Шаг 2: Открыть фронтенд

```bash
cd C:\front_projects\pain_management_assistant
npm run dev
```

Открыть: `http://localhost:5173/websocket-test`

### Шаг 3: Проверить консоль браузера (F12)

**Должно быть:**
```
🔌 Initializing WebSocket connection to: http://localhost:8080/ws
✅ WebSocket connected successfully
🧪 WebSocket Test Component: Subscribing to test topics
```

**НЕ должно быть:**
```
❌ Failed to load resource: the server responded with a status of 404
```

### Шаг 4: Отправить тест с бэкенда

```bash
curl -X POST http://localhost:8080/api/websocket/test/pain-escalation
```

**Ожидаемый результат:**
- В консоли браузера: `📨 Received escalation notification`
- В логе сообщений на странице появится уведомление
- Toast уведомление

---

## 🎯 Проверка в реальном приложении

### Анестезиолог Dashboard

1. Войти как анестезиолог:
   - Login: `anesthesiologist1`
   - Password: `password`

2. Открыть: `http://localhost:5173/anesthesiologist`

3. Проверить индикатор:
   - **🟢 Real-time notifications active** - подключено ✅
   - **🔴 Connecting to notifications...** - не подключено ❌

4. Отправить тест:
```bash
curl -X POST http://localhost:8080/api/websocket/test/pain-escalation
```

5. Должен появиться Toast:
```
⚠️ Pain Escalation: Тестовый (MRN: TEST-12345) - VAS 5 → 9 (Δ +4)
```

---

## 🔍 Диагностика проблем

### Проблема: WebSocket не подключается

**Проверить:**

1. **Бэкенд запущен?**
```bash
curl http://localhost:8080/api/websocket/status
```

2. **Правильный URL?**
```typescript
// Должно быть:
const WS_URL = 'http://localhost:8080/ws'; // БЕЗ /api/
```

3. **Консоль браузера (F12):**
```
Ищите ошибки с "404" или "WebSocket"
```

### Проблема: Подключается, но уведомления не приходят

**Проверить:**

1. **Подписка выполнена?**
```
Консоль: "📡 Subscribing to /topic/escalations/anesthesiologists"
Консоль: "✅ Subscribed successfully"
```

2. **Бэкенд отправляет?**
```bash
# Проверить логи бэкенда
grep "Sending.*notification" logs/application.log
```

3. **Правильный топик?**
```typescript
// Для анестезиолога:
client.subscribe('/topic/escalations/anesthesiologists', callback);

// Для доктора:
client.subscribe('/topic/escalations/doctors', callback);
```

### Проблема: Уведомления приходят, но не отображаются

**Проверить:**

1. **Callback вызывается?**
```
Консоль: "📨 Received escalation notification"
```

2. **Toast работает?**
```typescript
toast.warning('Test'); // Проверить вручную
```

3. **Формат данных правильный?**
```
Консоль: "✅ Parsed notification: {...}"
```

---

## 📊 Тестовые команды

### Backend

```bash
# Проверить статус
curl http://localhost:8080/api/websocket/status

# Отправить тест (анестезиолог)
curl -X POST http://localhost:8080/api/websocket/test/pain-escalation

# Отправить тест (доктор)
curl -X POST http://localhost:8080/api/websocket/test/doctor-notification

# Отправить критическое
curl -X POST http://localhost:8080/api/websocket/test/critical-escalation
```

### Frontend (консоль браузера F12)

```javascript
// Проверить подключение
console.log('WebSocket connected:', window.stompClient?.connected);

// Отправить тестовое сообщение
fetch('http://localhost:8080/api/websocket/test/pain-escalation', {
    method: 'POST'
});
```

---

## 🎓 Как работает WebSocket

### 1. Подключение

```typescript
// Frontend подключается к бэкенду
const socket = new SockJS('http://localhost:8080/ws');
const client = Stomp.over(socket);
client.activate();
```

### 2. Подписка на топики

```typescript
// Анестезиолог подписывается на свой топик
client.subscribe('/topic/escalations/anesthesiologists', (message) => {
    const data = JSON.parse(message.body);
    console.log('Received:', data);
});
```

### 3. Бэкенд отправляет уведомление

```java
// Backend отправляет на топик
messagingTemplate.convertAndSend(
    "/topic/escalations/anesthesiologists",
    notification
);
```

### 4. Frontend получает и отображает

```typescript
// Callback вызывается автоматически
(message) => {
    const notification = JSON.parse(message.body);
    toast.warning(`Pain Escalation: ${notification.patientName}`);
}
```

---

## 📝 Checklist

- [ ] Бэкенд запущен
- [ ] `/api/websocket/status` возвращает 200 OK
- [ ] Фронтенд подключается к `http://localhost:8080/ws` (БЕЗ /api/)
- [ ] В консоли: "✅ WebSocket connected successfully"
- [ ] Тестовая страница: `http://localhost:5173/websocket-test`
- [ ] Индикатор показывает "Connected"
- [ ] Тестовое уведомление отправлено
- [ ] Уведомление получено и отображено
- [ ] Toast уведомление появилось
- [ ] Анестезиолог Dashboard показывает "🟢 Real-time notifications active"

---

## 🚨 Критические моменты

### ❌ НЕПРАВИЛЬНО

```typescript
// НЕ используйте base_url для WebSocket!
const socket = new SockJS(`${base_url}/ws`); // ❌
// base_url = 'http://localhost:8080/api'
// Результат: http://localhost:8080/api/ws (404 ошибка)
```

### ✅ ПРАВИЛЬНО

```typescript
// Используйте прямой URL без /api/
const WS_URL = 'http://localhost:8080/ws'; // ✅
const socket = new SockJS(WS_URL);
```

---

## 🎉 Готово!

Теперь WebSocket работает правильно:
- ✅ Подключение к правильному endpoint
- ✅ Подробное логирование
- ✅ Тестовая страница для отладки
- ✅ Индикатор подключения на дашборде
- ✅ Toast уведомления

**Следующие шаги:**
1. Открыть `http://localhost:5173/websocket-test`
2. Проверить подключение
3. Отправить тест
4. Получить уведомление! 🎊
