# Firebase Setup Instructions

## Проблема: Missing or insufficient permissions

Вам нужно настроить правила безопасности Firestore и создать индексы.

## Решение

### Вариант 1: Через Firebase Console (быстро, но вручную)

#### 1. Настройка правил безопасности:
1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите проект `agile-mind-pro`
3. Перейдите в **Firestore Database** → **Rules**
4. Скопируйте содержимое файла `firestore.rules` в редактор правил
5. Нажмите **Publish**

#### 2. Создание индексов:
Когда вы увидите ошибку в консоли браузера с ссылкой на создание индекса:
- Кликните по ссылке в ошибке
- Нажмите "Create Index"
- Подождите пока индекс создастся (1-2 минуты)

### Вариант 2: Через Firebase CLI (рекомендуется)

#### Установка Firebase CLI:
```bash
npm install -g firebase-tools
```

#### Инициализация проекта:
```bash
# Залогиньтесь в Firebase
firebase login

# Перейдите в папку проекта
cd C:\Users\1\agile-mind-pro\frontend

# Инициализируйте Firebase (если еще не сделано)
firebase init

# Выберите:
# - Firestore: Configure security rules and indexes files
# - Выберите существующий проект: agile-mind-pro
# - Firestore rules file: firestore.rules (уже создан)
# - Firestore indexes file: firestore.indexes.json (уже создан)
```

#### Деплой правил и индексов:
```bash
# Деплой только правил Firestore
firebase deploy --only firestore:rules

# Деплой только индексов
firebase deploy --only firestore:indexes

# Или все сразу
firebase deploy --only firestore
```

## Что содержат файлы:

### firestore.rules
Правила безопасности для всех коллекций:
- ✅ `courses` - админы могут создавать/редактировать, все читать
- ✅ `lessons` - админы могут создавать/редактировать, все читать
- ✅ `course_categories` - админы могут создавать/редактировать, все читать
- ✅ `exams` - админы могут создавать/редактировать, все читать
- ✅ `exam_results` - студенты могут создавать свои, админы все
- ✅ `user_progress` - студенты могут создавать/редактировать свои, админы все
- ✅ `teams`, `boards`, `tasks`, `news`, `notifications`, `sprints`, `sketches`

### firestore.indexes.json
Составные индексы для быстрых запросов:
- ✅ `lessons` по `courseId` и `order`
- ✅ `user_progress` по `userId` и `courseId`
- ✅ `exam_results` по `examId` и `submittedAt`
- ✅ `exam_results` по `userId`, `examId` и `submittedAt`
- ✅ `exams` по `courseId`
- ✅ `course_categories` по `order`

## Проверка

После деплоя:
1. Обновите страницу в браузере
2. Проверьте консоль - не должно быть ошибок permissions
3. Если все еще есть ошибки про индексы - кликните по ссылке в ошибке для автосоздания

## Troubleshooting

### Ошибка: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Ошибка: "Not authorized"
```bash
firebase logout
firebase login
```

### Индексы не создаются
- Подождите 1-2 минуты после деплоя
- Или создайте вручную через консоль по ссылке из ошибки

### Правила не применяются
- Убедитесь что нажали "Publish" в консоли
- Или используйте `firebase deploy --only firestore:rules`
- Подождите 10-30 секунд для применения

## Безопасность

Текущие правила:
- ✅ Только авторизованные пользователи могут читать данные
- ✅ Только админы/владельцы могут создавать/редактировать курсы и экзамены
- ✅ Студенты могут создавать только свой прогресс и результаты экзаменов
- ✅ Пользователи видят только свои прогресс и результаты (кроме админов)
