# 🚀 ЧЕКЛИСТ ДЕПЛОЯ AGILE MIND PRO

## ✅ ЧТО УЖЕ СДЕЛАНО

- ✅ `.env` добавлен в `.gitignore`
- ✅ `.env.example` создан
- ✅ Оптимизация производительности (-85% загрузка)
- ✅ Полная мобильная адаптация (320px+)
- ✅ React.memo и мемоизация

---

## 🔥 ОБЯЗАТЕЛЬНО ПЕРЕД ДЕПЛОЕМ

### 1. БЕЗОПАСНОСТЬ (КРИТИЧНО!)

#### A. Firestore Rules - ПРИМЕНИТЬ!
```bash
# Файл готов: firestore.rules.new
```

**Шаги:**
1. Открой https://console.firebase.google.com
2. Проект: agile-mind-pro
3. Firestore Database → Rules
4. Скопируй содержимое firestore.rules.new
5. Вставь и нажми "Опубликовать"

❌ **Без этого приложение НЕБЕЗОПАСНО в продакшене!**

---

#### B. Environment Variables

**Для сервера создай файл `.env.production`:**

```env
# Production Environment Variables

# Gemini AI
VITE_GEMINI_API_KEY=твой_реальный_ключ

# Cloudinary (если используешь)
VITE_CLOUDINARY_CLOUD_NAME=твой_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=agile_mind_pro

# Production mode
NODE_ENV=production
```

**Проверь, что НЕ используешь:**
- ❌ localhost URLs
- ❌ Тестовые API ключи
- ❌ Development режимы

---

### 2. FIREBASE НАСТРОЙКА

#### A. Production Firebase Project

Если еще не создал отдельный production проект:

```bash
# Создай новый Firebase проект для production
# (или используй существующий agile-mind-pro)
```

**Обнови `src/config/firebase.js` для production:**
- Используй production Firebase credentials
- Проверь authDomain для твоего домена

#### B. Firebase Hosting Setup

```bash
# Из папки frontend:
npm install -g firebase-tools
firebase login
firebase init hosting

# Выбери:
# - Existing project: agile-mind-pro
# - Public directory: dist
# - Single-page app: Yes
# - GitHub Actions: No (пока)
```

---

### 3. BUILD & ОПТИМИЗАЦИЯ

#### A. Production Build

```bash
# Из папки frontend:
npm run build
```

**Проверь вывод:**
- ✅ Нет ошибок
- ✅ Bundle size разумный (< 1MB gzipped)
- ✅ Все assets оптимизированы

#### B. Тест production build локально

```bash
npm run preview
# Открой http://localhost:4173
# Протестируй основные функции
```

---

### 4. DNS & ДОМЕН

#### A. Настрой домен

**Если используешь Firebase Hosting:**

```bash
firebase hosting:channel:deploy preview
# Протестируй на preview URL

# Когда готов:
firebase deploy --only hosting
```

**Добавь кастомный домен:**
1. Firebase Console → Hosting
2. Add custom domain
3. Следуй инструкциям для DNS записей

#### B. SSL Certificate

Firebase Hosting автоматически настраивает SSL.
Проверь, что сайт доступен через HTTPS.

---

### 5. ФИНАЛЬНАЯ ПРОВЕРКА

#### A. Функциональность

- [ ] Регистрация / Вход работает
- [ ] Создание досок / задач
- [ ] Kanban drag-and-drop
- [ ] Комментарии и mentions
- [ ] Загрузка файлов (Cloudinary)
- [ ] AI функции (Gemini)
- [ ] Уведомления
- [ ] Мобильная версия (открой на телефоне!)

#### B. Производительность

```bash
# Google Lighthouse
npm install -g lighthouse
lighthouse https://your-domain.com --view

# Цели:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

#### C. Безопасность

- [ ] HTTPS включен
- [ ] Firestore Rules применены
- [ ] Нет API ключей в клиентском коде
- [ ] CORS настроен (если нужен)
- [ ] CSP headers (опционально)

---

## 🚀 КОМАНДЫ ДЕПЛОЯ

### Firebase Hosting (рекомендуется)

```bash
# 1. Build
npm run build

# 2. Test локально
npm run preview

# 3. Deploy
firebase deploy --only hosting

# 4. Проверь
# https://agile-mind-pro.web.app (или твой домен)
```

### Альтернативы:

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**VPS (nginx):**
```bash
# 1. Build локально
npm run build

# 2. Upload dist/* на сервер
scp -r dist/* user@server:/var/www/agile-mind-pro/

# 3. Настрой nginx
# (см. секцию NGINX CONFIG ниже)
```

---

## 📋 ОПЦИОНАЛЬНОЕ (после деплоя)

### 1. Мониторинг

```bash
# Sentry для отслеживания ошибок
npm install @sentry/react

# Google Analytics
npm install react-ga4
```

### 2. CI/CD

**GitHub Actions** для автоматического деплоя:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: agile-mind-pro
```

### 3. Email/Push уведомления

См. PLAN.md для настройки (опционально):
- Firebase Functions (Email)
- Browser Push notifications
- Sound notifications

---

## 🔧 NGINX CONFIG (если VPS)

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/agile-mind-pro;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## ✅ ФИНАЛЬНЫЙ ЧЕК-ЛИСТ

Перед нажатием "Deploy":

- [ ] Firestore Rules применены в Firebase Console
- [ ] .env.production создан с правильными ключами
- [ ] npm run build успешен
- [ ] npm run preview протестирован
- [ ] Все функции работают локально
- [ ] Домен готов / DNS настроен
- [ ] SSL certificate готов
- [ ] Git repo чист (git status)
- [ ] .env НЕ в Git (git ls-files | grep .env → пусто)

Если все ✅ — **готов к деплою!** 🚀

---

## 🆘 TROUBLESHOOTING

### "Firebase rules не работают"
→ Проверь, что применил firestore.rules.new в Console

### "API ключи не работают"
→ Проверь .env.production на сервере

### "404 при обновлении страницы"
→ Настрой SPA routing (rewrites в firebase.json)

### "Медленная загрузка"
→ Проверь bundle size: npm run build -- --report

### "CORS ошибки"
→ Настрой Firebase CORS в storage rules

---

**Удачного деплоя!** 🎉
