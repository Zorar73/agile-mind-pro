# ⚡ БЫСТРЫЙ СТАРТ: Timeweb Cloud + Reg.ru

Краткая версия для опытных пользователей.

---

## 📋 ЧЕКЛИСТ ЗА 30 МИНУТ

### ✅ 1. ПОДГОТОВКА (5 мин)

```bash
# Локально в папке frontend:

# 1. Firebase Rules - ОБЯЗАТЕЛЬНО!
# Примени firestore.rules.new в Firebase Console

# 2. Build
npm run build

# 3. Тест
npm run preview  # http://localhost:4173
```

---

### ✅ 2. TIMEWEB CLOUD (10 мин)

**Создай сервер:**
- Ubuntu 22.04
- 1-2 GB RAM
- Скопируй IP адрес

**SSH подключение:**
```bash
ssh root@твой_IP
```

**Установка:**
```bash
# Обновление
apt update && apt upgrade -y

# Nginx
apt install -y nginx

# Certbot (для SSL)
apt install -y certbot python3-certbot-nginx

# Firewall
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable

# Структура
mkdir -p /var/www/agile-mind-pro
chown -R www-data:www-data /var/www/agile-mind-pro
```

---

### ✅ 3. REG.RU DNS (5 мин)

**Reg.ru → Твой домен → DNS зона:**

```
Тип    Субдомен    Значение       TTL
A      @           твой_IP        3600
A      www         твой_IP        3600
```

Подожди 10-15 минут.

---

### ✅ 4. ЗАГРУЗКА ФАЙЛОВ (5 мин)

**Локально:**
```bash
scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/
```

Или используй FileZilla/WinSCP.

---

### ✅ 5. NGINX КОНФИГ (5 мин)

**На сервере:**

```bash
nano /etc/nginx/sites-available/agile-mind-pro
```

**Вставь (замени домен!):**

```nginx
server {
    listen 80;
    server_name твой-домен.ru www.твой-домен.ru;

    root /var/www/agile-mind-pro;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Активация:**
```bash
ln -s /etc/nginx/sites-available/agile-mind-pro /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

**Проверь:** `http://твой-домен.ru`

---

### ✅ 6. SSL (HTTPS) - 5 мин

**На сервере:**

```bash
certbot --nginx -d твой-домен.ru -d www.твой-домен.ru
# Email: твой email
# Agree: A
# Redirect: 2
```

**Проверь:** `https://твой-домен.ru` (зеленый замок!)

---

## 🎉 ГОТОВО!

Приложение доступно на: **https://твой-домен.ru**

---

## 🔧 ОБНОВЛЕНИЕ

```bash
# Локально:
npm run build
scp -r dist/* root@твой_IP:/var/www/agile-mind-pro/

# Готово! (nginx перезагрузка не нужна)
```

---

## 📄 Полная инструкция

См. `DEPLOY_TIMEWEB.md` для:
- Детальных объяснений
- Production конфига Nginx
- Мониторинга
- Troubleshooting
- Автоматизации
- Backup

---

## 🚨 КРИТИЧНЫЕ ВЕЩИ

⚠️ **НЕ ЗАБУДЬ:**
1. ✅ Firestore Rules применены
2. ✅ DNS обновился (проверь `nslookup`)
3. ✅ SSL сертификат установлен
4. ✅ `try_files $uri $uri/ /index.html;` в nginx (для SPA)

Если что-то не работает → см. `DEPLOY_TIMEWEB.md` (раздел Troubleshooting)
