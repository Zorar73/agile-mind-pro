# 🚀 ДЕПЛОЙ НА TIMEWEB CLOUD + REG.RU

Пошаговая инструкция деплоя Agile Mind Pro на российскую инфраструктуру.

---

## 📋 ЧТО ПОТРЕБУЕТСЯ

- ✅ Аккаунт Timeweb Cloud (https://timeweb.cloud)
- ✅ Домен на Reg.ru
- ✅ SSH клиент (PuTTY для Windows / Terminal для Mac/Linux)
- ⏱️ Время: ~40-60 минут

---

## ЭТАП 1: ПОДГОТОВКА ПРОЕКТА (ЛОКАЛЬНО)

### 1.1. Firestore Rules - КРИТИЧНО! ⚠️

```bash
# У тебя есть файл: firestore.rules.new
```

**ОБЯЗАТЕЛЬНО примени в Firebase Console:**
1. https://console.firebase.google.com/project/agile-mind-pro
2. Firestore Database → Rules
3. Скопируй содержимое `firestore.rules.new`
4. Вставь и нажми **"Опубликовать"**

❌ **Без этого приложение небезопасно!**

---

### 1.2. Создай production .env

Создай файл `.env.production` в папке `frontend/`:

```env
# Production Environment Variables

# Gemini AI (обязательно)
VITE_GEMINI_API_KEY=твой_gemini_api_ключ

# Cloudinary (если используешь загрузку файлов)
VITE_CLOUDINARY_CLOUD_NAME=твой_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=agile_mind_pro

# Production mode
NODE_ENV=production
```

---

### 1.3. Production Build

```bash
cd frontend

# Установи зависимости (если еще не сделал)
npm install

# Build для production
npm run build

# Проверь, что build успешен
# Должна появиться папка dist/
ls -la dist/
```

**Проверь размер bundle:**
```bash
# Windows PowerShell:
Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum

# Linux/Mac:
du -sh dist/
```

Должно быть: **< 5MB**

---

### 1.4. Тест production build локально

```bash
npm run preview
# Открой http://localhost:4173
```

**Протестируй:**
- [ ] Вход/регистрация
- [ ] Создание доски
- [ ] Создание задачи
- [ ] Drag and drop
- [ ] Комментарии
- [ ] Загрузка файлов (если Cloudinary настроен)

Если все работает → переходи к Этапу 2.

---

## ЭТАП 2: НАСТРОЙКА TIMEWEB CLOUD

### 2.1. Создание облачного сервера

1. Зайди в [Timeweb Cloud](https://timeweb.cloud)
2. **Облачные серверы** → **Создать сервер**

**Рекомендуемая конфигурация:**
- **ОС:** Ubuntu 22.04 LTS
- **Тариф:** Минимум:
  - 1 vCPU
  - 1 GB RAM
  - 10 GB SSD
- **Локация:** По твоему выбору (Москва/Санкт-Петербург)

**Оптимальная (если хочешь стабильности):**
- 2 vCPU
- 2 GB RAM
- 20 GB SSD

3. **Настройки SSH:**
   - Придумай надежный пароль root
   - Или добавь SSH ключ (безопаснее)

4. Нажми **"Создать сервер"**

⏱️ Создание займет 2-3 минуты.

---

### 2.2. Получи IP адрес сервера

После создания:
1. Открой страницу сервера в Timeweb Cloud
2. Скопируй **IP адрес** (например: `85.192.34.56`)
3. Сохрани куда-нибудь - понадобится!

---

### 2.3. Подключись к серверу по SSH

**Windows (PuTTY):**
1. Скачай PuTTY: https://www.putty.org/
2. Запусти PuTTY
3. Host Name: `твой_IP_адрес`
4. Port: `22`
5. Connection type: SSH
6. Open
7. Логин: `root`
8. Пароль: тот, что создал

**Mac/Linux:**
```bash
ssh root@твой_IP_адрес
# Введи пароль
```

✅ Ты подключен к серверу!

---

## ЭТАП 3: НАСТРОЙКА СЕРВЕРА

Все команды ниже выполняй **на сервере** (в SSH терминале).

### 3.1. Обновление системы

```bash
# Обнови пакеты
apt update && apt upgrade -y

# Установи базовые утилиты
apt install -y curl wget git nano ufw
```

---

### 3.2. Установка Node.js (для функций, если нужно)

Если планируешь Firebase Functions:

```bash
# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверка
node -v  # Должно быть v20.x.x
npm -v
```

---

### 3.3. Установка Nginx

```bash
# Установка
apt install -y nginx

# Запуск
systemctl start nginx
systemctl enable nginx

# Проверка
systemctl status nginx
```

Открой в браузере: `http://твой_IP_адрес`

Должна появиться страница "Welcome to nginx!" ✅

---

### 3.4. Установка Certbot (для SSL)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Проверка
certbot --version
```

---

### 3.5. Настройка Firewall

```bash
# Разрешить SSH, HTTP, HTTPS
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Включить firewall
ufw --force enable

# Проверка
ufw status
```

---

## ЭТАП 4: НАСТРОЙКА ДОМЕНА (REG.RU)

### 4.1. Привязка домена к серверу

1. Зайди на [Reg.ru](https://www.reg.ru)
2. **Мои домены** → Выбери свой домен
3. **Управление доменом** → **DNS серверы и зона**

**Вариант А: Делегирование на Timeweb (проще):**

Если у Timeweb есть DNS серверы:
1. **DNS серверы** → Изменить
2. Укажи DNS серверы Timeweb:
   ```
   ns1.timeweb.ru
   ns2.timeweb.ru
   ns3.timeweb.org
   ns4.timeweb.org
   ```
3. Сохрани

Потом в панели Timeweb:
1. **Домены** → **Добавить домен**
2. Укажи свой домен
3. A-запись автоматически создастся на IP сервера

**Вариант Б: Настройка DNS в Reg.ru (быстрее):**

1. **DNS серверы и зона** → **Редактор зон**
2. Добавь/измени записи:

```
Тип    Субдомен    Значение              TTL
A      @           твой_IP_адрес         3600
A      www         твой_IP_адрес         3600
```

3. Сохрани изменения

⏱️ DNS обновление: 10 минут - 24 часа (обычно ~1 час).

---

### 4.2. Проверка DNS

Подожди 10-15 минут, затем проверь:

```bash
# На локальной машине (Windows PowerShell):
nslookup твой-домен.ru

# Linux/Mac:
dig твой-домен.ru +short
```

Должен вернуться твой IP адрес сервера ✅

---

## ЭТАП 5: ДЕПЛОЙ ПРИЛОЖЕНИЯ НА СЕРВЕР

### 5.1. Создание структуры папок

**На сервере:**

```bash
# Создай директорию для приложения
mkdir -p /var/www/agile-mind-pro

# Права доступа
chown -R www-data:www-data /var/www/agile-mind-pro
chmod -R 755 /var/www/agile-mind-pro
```

---

### 5.2. Загрузка файлов на сервер

**На локальной машине:**

**Вариант А: SCP (командная строка):**

```bash
# Windows PowerShell:
scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/

# Linux/Mac:
scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/
```

**Вариант Б: FileZilla (графический интерфейс):**

1. Скачай FileZilla: https://filezilla-project.org/
2. Новое соединение:
   - Хост: `sftp://твой_IP`
   - Пользователь: `root`
   - Пароль: твой пароль сервера
   - Порт: `22`
3. Подключись
4. Загрузи всё из папки `dist/` в `/var/www/agile-mind-pro/`

**Вариант В: WinSCP (только Windows):**

1. Скачай WinSCP: https://winscp.net/
2. Настрой подключение аналогично FileZilla
3. Загрузи файлы

---

### 5.3. Проверка загрузки

**На сервере:**

```bash
# Проверь, что файлы загружены
ls -la /var/www/agile-mind-pro/

# Должны быть:
# index.html
# assets/
# и другие файлы из dist/
```

---

## ЭТАП 6: НАСТРОЙКА NGINX

### 6.1. Создание конфига Nginx

**На сервере:**

```bash
# Создай конфиг для своего сайта
nano /etc/nginx/sites-available/agile-mind-pro
```

**Вставь следующий конфиг** (замени `твой-домен.ru`):

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name твой-домен.ru www.твой-домен.ru;

    # Для получения SSL сертификата
    location /.well-known/acme-challenge/ {
        root /var/www/agile-mind-pro;
    }

    # Временно оставь так, потом закомментируй после получения SSL
    location / {
        root /var/www/agile-mind-pro;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Сохрани и выйди:**
- Нажми `Ctrl + O` (сохранить)
- Нажми `Enter`
- Нажми `Ctrl + X` (выйти)

---

### 6.2. Активация конфига

```bash
# Создай симлинк
ln -s /etc/nginx/sites-available/agile-mind-pro /etc/nginx/sites-enabled/

# Удали дефолтный конфиг
rm -f /etc/nginx/sites-enabled/default

# Проверь конфиг на ошибки
nginx -t

# Если OK, перезапусти Nginx
systemctl restart nginx
```

---

### 6.3. Проверка HTTP

Открой в браузере: `http://твой-домен.ru`

Должно открыться твоё приложение! ✅

**Если не открывается:**
- Подожди еще 10 минут (DNS)
- Проверь `nginx -t`
- Проверь `systemctl status nginx`

---

## ЭТАП 7: НАСТРОЙКА SSL (HTTPS)

### 7.1. Получение SSL сертификата

**На сервере:**

```bash
# Получи сертификат Let's Encrypt
certbot --nginx -d твой-домен.ru -d www.твой-домен.ru

# Certbot спросит:
# Email: твой email
# Terms of Service: A (agree)
# Redirect HTTP to HTTPS: 2 (redirect)
```

Certbot автоматически:
- ✅ Получит SSL сертификат
- ✅ Настроит nginx для HTTPS
- ✅ Настроит автоматическое обновление

---

### 7.2. Обновление конфига Nginx для production

После получения SSL, обнови конфиг:

```bash
nano /etc/nginx/sites-available/agile-mind-pro
```

**Замени весь контент на:**

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name твой-домен.ru www.твой-домен.ru;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name твой-домен.ru www.твой-домен.ru;

    # SSL certificates (Let's Encrypt - Certbot добавит автоматически)
    ssl_certificate /etc/letsencrypt/live/твой-домен.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/твой-домен.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Document root
    root /var/www/agile-mind-pro;
    index index.html;

    # Логи
    access_log /var/log/nginx/agile-mind-pro.access.log;
    error_log /var/log/nginx/agile-mind-pro.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;

    # SPA routing - важно для React Router!
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (JS, CSS, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Запрет доступа к скрытым файлам
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Замени `твой-домен.ru` на свой домен!**

Сохрани: `Ctrl + O`, `Enter`, `Ctrl + X`

---

### 7.3. Применение конфига

```bash
# Проверка конфига
nginx -t

# Если OK:
systemctl reload nginx
```

---

### 7.4. Проверка HTTPS

Открой в браузере: `https://твой-домен.ru`

✅ Должен быть зеленый замок SSL!

---

## ЭТАП 8: ФИНАЛЬНАЯ ПРОВЕРКА

### 8.1. Функциональность

Протестируй **на production домене**:

- [ ] Открывается на `https://твой-домен.ru`
- [ ] Зеленый замок SSL
- [ ] Вход / Регистрация работает
- [ ] Создание досок
- [ ] Создание задач
- [ ] Drag and drop в Kanban
- [ ] Комментарии
- [ ] Mentions (@username)
- [ ] Загрузка файлов (Cloudinary)
- [ ] AI функции (Gemini)
- [ ] Уведомления

---

### 8.2. Мобильная версия

- [ ] Открой на телефоне: `https://твой-домен.ru`
- [ ] Sidebar работает (burger menu)
- [ ] Kanban вертикальный
- [ ] Dashboard адаптивный
- [ ] Touch targets удобные

---

### 8.3. Производительность

```bash
# На локальной машине:
npm install -g lighthouse

# Проверка производительности
lighthouse https://твой-домен.ru --view

# Цели:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 80
```

---

## ЭТАП 9: АВТОМАТИЗАЦИЯ (ОПЦИОНАЛЬНО)

### 9.1. Скрипт для быстрого обновления

**На локальной машине:**

Создай файл `deploy.sh` в папке `frontend/`:

```bash
#!/bin/bash

# Deploy script for Timeweb Cloud

echo "🚀 Starting deployment..."

# Build
echo "📦 Building..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Upload to server
echo "⬆️  Uploading to server..."
scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 https://твой-домен.ru"
else
    echo "❌ Upload failed!"
    exit 1
fi
```

**Windows (PowerShell):**

Создай `deploy.ps1`:

```powershell
# Deploy script for Timeweb Cloud

Write-Host "🚀 Starting deployment..." -ForegroundColor Green

# Build
Write-Host "📦 Building..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Upload to server
Write-Host "⬆️  Uploading to server..." -ForegroundColor Yellow
scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 https://твой-домен.ru" -ForegroundColor Cyan
} else {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}
```

**Использование:**

```bash
# Linux/Mac:
chmod +x deploy.sh
./deploy.sh

# Windows PowerShell:
./deploy.ps1
```

---

### 9.2. Автообновление SSL сертификата

Certbot автоматически настраивает обновление, но проверь:

```bash
# На сервере:
systemctl status certbot.timer

# Тест обновления
certbot renew --dry-run
```

Должно быть: `Congratulations, all simulated renewals succeeded`

---

## 🎉 ГОТОВО!

Твоё приложение теперь доступно на:
- 🌐 **https://твой-домен.ru**
- 🔒 **SSL сертификат** (зеленый замок)
- 📱 **Мобильная версия** работает
- ⚡ **Производительность** оптимизирована

---

## 🔧 ОБСЛУЖИВАНИЕ

### Мониторинг

```bash
# На сервере:

# Статус Nginx
systemctl status nginx

# Логи доступа
tail -f /var/log/nginx/agile-mind-pro.access.log

# Логи ошибок
tail -f /var/log/nginx/agile-mind-pro.error.log

# Использование диска
df -h

# Использование RAM
free -h
```

---

### Обновление приложения

1. Внеси изменения локально
2. `npm run build`
3. Загрузи на сервер:
   ```bash
   scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/
   ```
4. Готово! (nginx обслуживает статику, перезагрузка не нужна)

---

### Backup

**Настрой резервное копирование:**

```bash
# На сервере:
# Создай скрипт backup
nano /root/backup.sh
```

```bash
#!/bin/bash
# Backup script

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup приложения
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/agile-mind-pro/

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_$DATE.tar.gz"
```

```bash
# Права на выполнение
chmod +x /root/backup.sh

# Добавь в cron (ежедневно в 3:00)
crontab -e

# Добавь строку:
0 3 * * * /root/backup.sh
```

---

## 🆘 TROUBLESHOOTING

### Проблема: "502 Bad Gateway"

**Решение:**
```bash
# Проверь статус Nginx
systemctl status nginx

# Перезапусти
systemctl restart nginx

# Проверь логи
tail -f /var/log/nginx/error.log
```

---

### Проблема: "404 при обновлении страницы"

**Причина:** SPA routing не настроен

**Решение:** Проверь nginx конфиг:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### Проблема: "Долго загружается"

**Решение:**
1. Проверь gzip в nginx конфиге (должен быть включен)
2. Проверь кэширование статики
3. Оптимизируй bundle: `npm run build -- --report`

---

### Проблема: "Firebase не работает"

**Проверь:**
1. Firestore Rules применены в Console
2. `.env.production` загружен на сервер (если нужен)
3. API ключи корректные
4. CORS настроен в Firebase

---

### Проблема: "SSL сертификат не работает"

**Решение:**
```bash
# Проверь сертификат
certbot certificates

# Обнови
certbot renew --force-renewal

# Перезагрузи nginx
systemctl reload nginx
```

---

## 📞 КОНТАКТЫ ПОДДЕРЖКИ

- **Timeweb Cloud:** https://timeweb.cloud/support
- **Reg.ru:** https://www.reg.ru/support

---

**Успешного деплоя!** 🚀🎉
