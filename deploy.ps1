# ================================================================
# DEPLOY SCRIPT ДЛЯ TIMEWEB CLOUD
# Автоматический деплой Agile Mind Pro на сервер
# ================================================================

param(
    [string]$ServerIP = "",
    [switch]$SkipBuild,
    [switch]$Help
)

# Цвета для вывода
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Помощь
if ($Help) {
    Write-Info "
🚀 DEPLOY SCRIPT для Agile Mind Pro

ИСПОЛЬЗОВАНИЕ:
  ./deploy.ps1 -ServerIP <IP_адрес_сервера>

ПАРАМЕТРЫ:
  -ServerIP <IP>    IP адрес сервера Timeweb Cloud (обязательно)
  -SkipBuild        Пропустить build (если уже собран)
  -Help             Показать эту справку

ПРИМЕРЫ:
  # Полный деплой
  ./deploy.ps1 -ServerIP 85.192.34.56

  # Деплой без пересборки
  ./deploy.ps1 -ServerIP 85.192.34.56 -SkipBuild

ПЕРВЫЙ ЗАПУСК:
  1. Создай сервер в Timeweb Cloud
  2. Настрой DNS на Reg.ru (A-запись на IP сервера)
  3. Запусти этот скрипт
  4. После первого деплоя настрой SSL

ДОКУМЕНТАЦИЯ:
  📖 DEPLOY_FOR_BEGINNERS.md - Подробная инструкция для новичков (РЕКОМЕНДУЕТСЯ!)
  📖 DEPLOY_TIMEWEB.md - Полное руководство
  ⚡ QUICK_START_TIMEWEB.md - Быстрый старт
"
    exit 0
}

# Проверка ServerIP
if (-not $ServerIP) {
    Write-Error "❌ Ошибка: не указан IP адрес сервера!"
    Write-Warning "
Использование: ./deploy.ps1 -ServerIP <IP_адрес>
Пример:        ./deploy.ps1 -ServerIP 85.192.34.56

Для справки:   ./deploy.ps1 -Help
"
    exit 1
}

Write-Info "
╔════════════════════════════════════════════════════════════╗
║          🚀 DEPLOY TO TIMEWEB CLOUD                        ║
╚════════════════════════════════════════════════════════════╝
"

Write-Info "📋 Параметры деплоя:"
Write-Info "   Сервер: $ServerIP"
Write-Info "   Пропустить build: $SkipBuild"
Write-Info ""

# ================================================================
# ШАГ 1: BUILD
# ================================================================

if (-not $SkipBuild) {
    Write-Info "📦 [1/4] Building production version..."

    $buildResult = npm run build 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Build failed!"
        Write-Error $buildResult
        exit 1
    }

    Write-Success "✅ Build successful!"
} else {
    Write-Warning "⏭️  [1/4] Skipping build..."
}

# ================================================================
# ШАГ 2: ПРОВЕРКА DIST
# ================================================================

Write-Info "🔍 [2/4] Checking dist folder..."

if (-not (Test-Path "dist")) {
    Write-Error "❌ Папка dist не найдена!"
    Write-Error "Запусти: npm run build"
    exit 1
}

$distFiles = Get-ChildItem -Path dist -Recurse | Measure-Object
if ($distFiles.Count -eq 0) {
    Write-Error "❌ Папка dist пуста!"
    exit 1
}

Write-Success "✅ Found $($distFiles.Count) files in dist/"

# ================================================================
# ШАГ 3: UPLOAD TO SERVER
# ================================================================

Write-Info "⬆️  [3/4] Uploading to server $ServerIP..."
Write-Warning "   (Тебя попросят ввести пароль root от сервера)"

# Используем scp для загрузки
$scpCommand = "scp -r dist/* root@${ServerIP}:/var/www/agile-mind-pro/"

Write-Info "   Executing: $scpCommand"
Write-Info ""

$uploadResult = Invoke-Expression $scpCommand 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Upload failed!"
    Write-Error $uploadResult
    Write-Warning "
Возможные причины:
  1. Неверный IP адрес сервера
  2. Неверный пароль
  3. Папка /var/www/agile-mind-pro не существует на сервере
  4. SSH порт закрыт firewall'ом

Проверь:
  - IP адрес: $ServerIP
  - SSH подключение: ssh root@$ServerIP
  - Firewall: ufw status (на сервере)
"
    exit 1
}

Write-Success "✅ Files uploaded successfully!"

# ================================================================
# ШАГ 4: ФИНАЛЬНАЯ ПРОВЕРКА
# ================================================================

Write-Info "🔍 [4/4] Verifying deployment..."

# Проверка доступности сервера
$pingResult = Test-Connection -ComputerName $ServerIP -Count 1 -Quiet

if (-not $pingResult) {
    Write-Warning "⚠️  Server $ServerIP не отвечает на ping"
    Write-Warning "   (Это нормально если ICMP отключен в firewall)"
} else {
    Write-Success "✅ Server is reachable"
}

# ================================================================
# ГОТОВО!
# ================================================================

Write-Success "
╔════════════════════════════════════════════════════════════╗
║          ✅ DEPLOYMENT SUCCESSFUL!                         ║
╚════════════════════════════════════════════════════════════╝
"

Write-Info "📋 Следующие шаги:"
Write-Info ""
Write-Info "1️⃣  Проверь сайт (HTTP):"
Write-Info "   http://$ServerIP"
Write-Info ""
Write-Info "2️⃣  Если есть домен, открой:"
Write-Info "   http://твой-домен.ru"
Write-Info ""
Write-Info "3️⃣  Настрой SSL (если еще не сделал):"
Write-Info "   ssh root@$ServerIP"
Write-Info "   certbot --nginx -d твой-домен.ru -d www.твой-домен.ru"
Write-Info ""
Write-Info "4️⃣  После SSL откроется:"
Write-Info "   https://твой-домен.ru 🔒"
Write-Info ""
Write-Success "🎉 Готово! Приложение развернуто на сервере!"
Write-Info ""
Write-Info "📖 Полная инструкция: DEPLOY_TIMEWEB.md"
Write-Info "⚡ Быстрая справка: QUICK_START_TIMEWEB.md"
Write-Info ""
