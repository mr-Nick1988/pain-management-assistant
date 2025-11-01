# 🐛 WebSocket Debugging - Пошаговая диагностика

## ✅ Статус: Запрос отправлен успешно, но toast не появился

### Что работает:
- ✅ Backend получил запрос
- ✅ Backend вернул успешный ответ: `{"status": "success", "type": "PAIN_ESCALATION", "priority": "HIGH"}`
- ✅ WebSocket подключен (зеленый индикатор)

### Что НЕ работает:
- ❌ Toast уведомление не появилось
- ❓ Сообщение дошло до фронтенда?

---

## 🔍 ДИАГНОСТИКА (ПОШАГОВО)

### ШАГ 1: Проверить консоль браузера (F12)

Открой консоль и найди эти логи:

#### ✅ Должно быть:
```
🔌 Initializing WebSocket connection to: http://localhost:8080/ws
✅ WebSocket connected successfully
📡 Subscribing to multiple topics for debugging...
✅ Subscribed to all topics successfully
```

#### 📨 После отправки теста должно появиться:
```
📨 [ANESTHESIOLOGIST TOPIC] Received: {...}
✅ Parsed notification: {...}
```

#### ❌ Если этого НЕТ:
Сообщение не дошло до фронтенда! Проблема на бэкенде.

---

### ШАГ 2: Проверить логи бэкенда

После отправки POST запроса в логах бэкенда должно быть:

```
INFO  p.w.s.UnifiedNotificationService : Sending PAIN_ESCALATION notification to /topic/escalations/anesthesiologists
INFO  p.w.s.UnifiedNotificationService : Notification sent successfully
```

#### ❌ Если этого НЕТ:
Backend не отправляет на WebSocket топик!

---

### ШАГ 3: Проверить структуру данных

Бэкенд должен отправлять JSON в таком формате:

```json
{
  "type": "PAIN_ESCALATION",
  "priority": "HIGH",
  "patientMrn": "TEST-12345",
  "patientName": "Тестовый Пациент",
  "previousVas": 5,
  "currentVas": 9,
  "vasChange": 4,
  "message": "VAS увеличился с 5 до 9 через 2 часа после введения дозы",
  "timestamp": "2025-11-01T18:00:00"
}
```

#### ❌ Если формат другой:
Frontend не сможет распарсить и показать toast!

---

## 🧪 ТЕСТЫ ДЛЯ ПРОВЕРКИ

### Тест 1: Проверить, что бэкенд отправляет

```bash
# В логах бэкенда после этой команды должно появиться "Sending notification"
curl -X POST http://localhost:8080/api/websocket/test/pain-escalation
```

### Тест 2: Проверить консоль браузера

1. Открыть F12 (консоль браузера)
2. Нажать кнопку "🧪 Send Test Notification" на дашборде
3. Смотреть логи в консоли

**Ожидаемые логи:**
```
🧪 Sending test notification...
✅ Test response: {status: "success", ...}
📨 [ANESTHESIOLOGIST TOPIC] Received: {...}
✅ Parsed notification: {...}
```

### Тест 3: Проверить все топики

Сейчас фронтенд подписан на 3 топика:
- `/topic/escalations/anesthesiologists`
- `/topic/escalations/critical`
- `/topic/escalations/dashboard`

Если сообщение придет на ЛЮБОЙ из них - увидишь в консоли!

---

## 🔧 ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Проблема 1: Сообщение не приходит на фронтенд

**Симптомы:**
- В консоли НЕТ лога `📨 [ANESTHESIOLOGIST TOPIC] Received`
- Backend вернул success, но ничего не происходит

**Причина:**
Backend не отправляет на WebSocket топик

**Решение:**
Проверить код бэкенда в `WebSocketTestController.java`:

```java
@PostMapping("/test/pain-escalation")
public ResponseEntity<?> testPainEscalation() {
    // Должно быть:
    messagingTemplate.convertAndSend(
        "/topic/escalations/anesthesiologists",  // ← Правильный топик
        notification
    );
    
    // НЕ должно быть:
    // return ResponseEntity.ok("success"); // ← Только HTTP ответ, без WebSocket!
}
```

---

### Проблема 2: Сообщение приходит, но неправильный формат

**Симптомы:**
- В консоли есть `📨 Received: {...}`
- Но есть ошибка `❌ Error parsing notification`

**Причина:**
Backend отправляет данные в неправильном формате

**Решение:**
Проверить, что backend отправляет объект `PainEscalationNotificationDTO` с полями:
- `patientMrn`
- `patientName`
- `previousVas`
- `currentVas`
- `vasChange`
- `priority`

---

### Проблема 3: Сообщение парсится, но toast не показывается

**Симптомы:**
- В консоли есть `✅ Parsed notification: {...}`
- Но toast не появляется

**Причина:**
Проблема с ToastContext

**Решение:**
Проверить, что `toast.warning()` работает:

```javascript
// В консоли браузера:
toast.warning('Test toast');
```

Если toast не появляется - проблема в ToastContext!

---

## 📋 CHECKLIST ДИАГНОСТИКИ

Пройди по порядку и отметь, что работает:

- [ ] WebSocket подключен (зеленый индикатор)
- [ ] В консоли: `✅ WebSocket connected successfully`
- [ ] В консоли: `✅ Subscribed to all topics successfully`
- [ ] POST запрос вернул `{"status": "success"}`
- [ ] В логах бэкенда: `Sending notification to /topic/...`
- [ ] В консоли браузера: `📨 [ANESTHESIOLOGIST TOPIC] Received`
- [ ] В консоли браузера: `✅ Parsed notification`
- [ ] Toast уведомление появилось

**Где остановилось?** ← Это покажет, где проблема!

---

## 🎯 БЫСТРАЯ ПРОВЕРКА (30 секунд)

1. **Открыть консоль браузера (F12)**
2. **Нажать кнопку "🧪 Send Test Notification"**
3. **Смотреть консоль:**

### Вариант A: Сообщение НЕ пришло
```
🧪 Sending test notification...
✅ Test response: {status: "success"}
(больше ничего нет)
```
**→ Проблема на бэкенде! Backend не отправляет на WebSocket.**

### Вариант B: Сообщение пришло, но ошибка парсинга
```
🧪 Sending test notification...
✅ Test response: {status: "success"}
📨 [ANESTHESIOLOGIST TOPIC] Received: {...}
❌ Error parsing notification: ...
```
**→ Неправильный формат данных от бэкенда!**

### Вариант C: Всё распарсилось, но toast не показался
```
🧪 Sending test notification...
✅ Test response: {status: "success"}
📨 [ANESTHESIOLOGIST TOPIC] Received: {...}
✅ Parsed notification: {...}
(toast не появился)
```
**→ Проблема с ToastContext!**

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

### Если сообщение НЕ приходит:

1. **Проверить бэкенд код:**
   - Файл: `WebSocketTestController.java`
   - Метод: `testPainEscalation()`
   - Должен вызывать: `messagingTemplate.convertAndSend(...)`

2. **Проверить логи бэкенда:**
   ```bash
   tail -f logs/application.log | grep "WebSocket\|notification"
   ```

3. **Проверить WebSocket конфигурацию:**
   - Файл: `WebSocketConfig.java`
   - Endpoint: `/ws`
   - Broker: `/topic`

### Если сообщение приходит, но toast не показывается:

1. **Проверить ToastContext:**
   ```javascript
   // В консоли браузера:
   toast.warning('Manual test');
   ```

2. **Проверить формат данных:**
   ```javascript
   // В консоли должен быть полный объект:
   console.log('Notification:', notification);
   ```

---

## 📞 ЧТО СООБЩИТЬ МНЕ

Скопируй и отправь:

1. **Что в консоли браузера после нажатия кнопки теста?**
   ```
   (скопируй все логи из консоли)
   ```

2. **Что в логах бэкенда после POST запроса?**
   ```
   (скопируй логи с "WebSocket" или "notification")
   ```

3. **Какой пункт checklist НЕ прошел?**
   ```
   Например: "В консоли НЕТ лога '📨 Received'"
   ```

Это поможет точно определить проблему! 🎯
