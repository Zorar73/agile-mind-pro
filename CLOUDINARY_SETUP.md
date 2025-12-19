# Настройка Cloudinary - Пошаговая инструкция

## Что я исправил

1. ✅ Исправил вызов метода в `NewsCreateDialog.jsx` (`uploadImage` → `upload`)
2. ✅ Создал тестовую страницу `/cloudinary-test` для проверки загрузки
3. ✅ Добавил route для тестовой страницы

## Что нужно сделать тебе

### Шаг 1: Получить Cloud Name

1. Открой https://cloudinary.com/console (залогинься если нужно)

2. **ВАЖНО!** На главной странице Dashboard ты увидишь:
   ```
   Product Environment: [имя проекта]
   Cloud name: [dxxxxxxxxx] ← ВОТ ЭТОТ НУЖЕН!
   ```

3. **Cloud Name** обычно начинается с `d` и выглядит примерно так: `dab12cd34`
   - НЕ копируй "Product Environment" (это не то!)
   - НЕ пиши свое название типа `agile_mind_pro`
   - Копируй именно строку **Cloud name**

### Шаг 2: Создать Upload Preset

1. В боковом меню Cloudinary:
   ```
   Settings (шестеренка) → Upload → Upload presets
   ```

2. Нажми **"Add upload preset"** (справа вверху)

3. Заполни форму:
   ```
   Preset name: agile_mind_pro
   Signing Mode: Unsigned  ← ОБЯЗАТЕЛЬНО!
   Folder: agile-mind-pro
   Unique filename: Yes (включи чекбокс)
   ```

4. Нажми **Save**

### Шаг 3: Обновить конфиг

1. Открой файл:
   ```
   frontend/src/config/cloudinary.js
   ```

2. Найди строку 6:
   ```javascript
   cloudName: 'agile_mind_pro',
   ```

3. Замени на свой Cloud Name:
   ```javascript
   cloudName: 'dab12cd34',  // твой настоящий Cloud Name!
   ```

4. Сохрани файл (Ctrl+S)

### Шаг 4: Проверить настройку

1. Перезапусти dev сервер:
   ```bash
   # Ctrl+C (остановить)
   npm run dev
   ```

2. Открой в браузере:
   ```
   http://localhost:5173/cloudinary-test
   ```

3. На странице проверь:
   - ✅ "Конфигурация" должна показывать статус **"Настроено"**
   - ✅ Cloud Name должен быть твоим (например `dab12cd34`)
   - ✅ Upload Preset должен быть `agile_mind_pro`

4. Загрузи тестовую картинку:
   - Выбери любое изображение (jpg, png)
   - Нажми "Загрузить"
   - Должна появиться зеленая галочка ✅

### Шаг 5: Если не работает

#### Ошибка 404 (Not Found)
**Причина:** Неправильный Cloud Name

**Решение:**
1. Вернись в Cloudinary Dashboard
2. Убедись, что скопировал **Cloud name**, а не Product Environment
3. Cloud name всегда начинается с маленькой буквы и содержит цифры

#### Ошибка 400 (Bad Request) - "Invalid upload preset"
**Причина:** Preset не создан или неправильное имя

**Решение:**
1. Settings → Upload → Upload presets
2. Проверь, что preset называется **точно** `agile_mind_pro`
3. Проверь, что Signing Mode = **Unsigned**

#### Ошибка 401 (Unauthorized)
**Причина:** Signing Mode установлен в "Signed" вместо "Unsigned"

**Решение:**
1. Открой свой preset в Cloudinary
2. Измени Signing Mode на **Unsigned**
3. Save

#### CORS ошибка
**Причина:** Cloudinary блокирует загрузку с localhost

**Решение:**
1. Settings → Security → Allowed fetch domains
2. Добавь: `http://localhost:5173`
3. Save

### Шаг 6: Где используется Cloudinary

После настройки Cloudinary будет работать:

1. **Новости** (`/news`)
   - Загрузка изображений к новостям
   - Кнопка с иконкой изображения

2. **Комментарии** (везде где есть CommentInput)
   - Загрузка изображений к комментариям
   - Загрузка файлов к комментариям

3. **Аватары** (в будущем)
   - Загрузка фото профиля

4. **Наброски** (в будущем)
   - Загрузка изображений к наброскам

## Проверка что все работает

1. Открой `/news`
2. Нажми "Создать новость"
3. В диалоге есть кнопка загрузки изображения
4. Выбери картинку
5. Должна появиться надпись "Изображение загружено"
6. Создай новость
7. Картинка должна отображаться в новости

✅ Если все работает - Cloudinary настроен правильно!

## Консоль браузера (для отладки)

Нажми F12 → Console

### Успешная загрузка:
```
Cloudinary upload success: {url: "https://res.cloudinary.com/..."}
```

### Ошибка:
```
Cloudinary upload error: Upload failed: ...
```

Скопируй ошибку и дай мне - я помогу разобраться.

## Быстрая проверка через URL

Открой в браузере:
```
https://api.cloudinary.com/v1_1/ТВО_CLOUD_NAME/image/upload
```

Замени `ТВО_CLOUD_NAME` на свой Cloud Name.

**Правильно настроено:**
```json
{"error":{"message":"Missing required parameter - file"}}
```

**Неправильный Cloud Name:**
```json
{"error":{"message":"Unknown cloud name"}}
```
или просто 404

---

## Итого

1. Получить Cloud Name из Dashboard
2. Создать Upload Preset с именем `agile_mind_pro` (Unsigned!)
3. Вставить Cloud Name в `config/cloudinary.js`
4. Проверить на `/cloudinary-test`
5. Попробовать загрузить в новостях

**Время:** 5-10 минут
**Сложность:** Легко

Если застрял - дай знать на каком шаге!
