# 🧪 ПРОСТАЯ ИНСТРУКЦИЯ: Импорт пациента с Observations из HAPI FHIR

## ШАГ 1: Открой HAPI FHIR Test Server

Открой в браузере:
```
https://hapi.fhir.org/
```

## ШАГ 2: Найди пациента с Observations

### 2.1 Попробуй готового тестового пациента

В адресной строке браузера открой:
```
https://hapi.fhir.org/resource?serverId=home_r4&pretty=true&resource=Patient&id=example
```

Это пациент **Peter James Chalmers**, ID = `example`

### 2.2 Проверь есть ли у него Observations

Открой:
```
https://hapi.fhir.org/search?serverId=home_r4&resource=Observation&param.0.0=&param.0.1=patient&param.0.2=example&param.0.name=patient&param.0.type=reference
```

**Если видишь список Observations** - отлично! Этот пациент подходит.
**Если пусто** - попробуй другого пациента (см. ниже).

### 2.3 Если пациент "example" не подходит

Найди другого пациента:

1. Открой: https://hapi.fhir.org/search?serverId=home_r4&resource=Patient
2. Кликни на любого пациента из списка
3. Запомни его **ID** (например: `1234567`)
4. Проверь Observations: замени `example` на этот ID в URL выше

---

## ШАГ 3: Запомни данные пациента

Из страницы пациента на HAPI FHIR запомни:
- **ID**: `example` (или другой ID)
- **First Name**: `Peter`
- **Last Name**: `Chalmers`
- **Birth Date**: `1974-12-25`

---

## ШАГ 4: Импортируй через твой Frontend

### 4.1 Войди в систему
```
Login: nurse
Password: (твой пароль)
```

### 4.2 Перейди к импорту
```
Nurse Dashboard → 📥 Import from FHIR
```

### 4.3 Введи данные в форму поиска

**ВАРИАНТ 1: Поиск по ID (быстрее):**
```
Patient ID (FHIR): example
```

**ВАРИАНТ 2: Поиск по имени:**
```
First Name: Peter
Last Name: Chalmers
Birth Date: 1974-12-25
```

### 4.4 Нажми "Search in FHIR System"

Должен появиться пациент в результатах.

### 4.5 Нажми "Import"

Дождись модального окна с результатом.

---

## ШАГ 5: Проверь результат импорта

В модальном окне смотри на строку:
```
Observations Imported: X
```

**Если X > 0** (например, 8) - отлично! Observations импортированы.
**Если X = 0** - у пациента нет Observations на HAPI FHIR, выбери другого пациента.

---

## ШАГ 6: Проверь маппинг в EMR

### 6.1 В модальном окне нажми "Go to Patient"

### 6.2 На странице пациента нажми "Load EMR"

### 6.3 Проверь лабораторные данные

Должны быть значения:
- Creatinine (Креатинин)
- Platelets (Тромбоциты)
- GFR
- Hemoglobin (Гемоглобин)
- WBC (Лейкоциты)
- INR

Это данные из FHIR Observations, которые бэкенд смапил в твою модель EMR.

---

## ШАГ 7: Проверь логи Backend

Открой консоль Backend и найди строки:
```
INFO: Importing patient from FHIR: Patient/example
INFO: Found X observations for patient
INFO: Mapping Observation: 2160-0 (Creatinine) = 1.2 mg/dL
INFO: Import completed: X observations imported
```

Это подтверждает что маппинг прошел успешно.

---

## Готово!

Теперь у тебя есть пациент с медицинскими данными из HAPI FHIR, которые смапились в твою модель EMR.

**Что проверить:**
- Observations Imported > 0 в модальном окне
- Лабораторные данные в EMR (Creatinine, Platelets, GFR и т.д.)
- Логи Backend показывают успешный маппинг
