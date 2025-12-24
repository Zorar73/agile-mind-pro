# Система ролей и прав доступа

**Дата внедрения:** 22.12.2025
**Статус:** ✅ Активна и работает

---

## Обзор

Agile Mind Pro использует **модульную систему ролей** с гранулярными правами доступа. Каждая роль имеет настраиваемый доступ к модулям системы с 4 уровнями прав.

### Уровни доступа

| Уровень | Код | Описание |
|---------|-----|----------|
| **Нет доступа** | `none` | Модуль полностью скрыт |
| **Просмотр** | `view` | Только чтение данных |
| **Редактирование** | `edit` | Создание и изменение |
| **Администрирование** | `admin` | Полный контроль + настройка |

---

## Системные роли

### 1. 👑 Admin (Администратор)
- **ID:** `admin`
- **Системная:** Да (нельзя удалить)
- **Доступ:** Полный доступ ко всем модулям (admin)
- **Использование:** Главный администратор системы

### 2. 📊 Manager (Менеджер)
- **ID:** `manager`
- **Системная:** Да
- **Доступ:** Admin на проекты, edit на остальное
- **Использование:** Руководители проектов

### 3. 💼 Office (Офисный сотрудник)
- **ID:** `office`
- **Системная:** Да
- **Доступ:** Edit на основные модули, view на обучение
- **Использование:** Основные сотрудники компании
- **По умолчанию:** Да (новые пользователи получают эту роль)

### 4. 🎓 Trainee (Стажёр)
- **ID:** `trainee`
- **Системная:** Да
- **Доступ:** View на большинство модулей, edit на обучение
- **Использование:** Стажёры, новички

### 5. 👁️ Viewer (Наблюдатель)
- **ID:** `viewer`
- **Системная:** Да
- **Доступ:** Только view на все модули
- **Использование:** Клиенты, партнёры, наблюдатели

---

## Модули системы

| Модуль | ID | Описание |
|--------|-----|----------|
| Задачи | `tasks` | Личные задачи пользователя |
| Доски | `boards` | Kanban доски с колонками |
| Спринты | `sprints` | Agile спринты |
| Календарь | `calendar` | События и встречи |
| Наброски | `sketches` | Быстрые заметки и эскизы |
| Команды | `teams` | Рабочие группы с чатом |
| Новости | `news` | Новости компании |
| Обучение | `learning` | LMS система (курсы, уроки, экзамены) |
| База знаний | `knowledge` | Статьи и документация |
| Чат | `chat` | Общий чат (будущее) |
| Профиль | `profile` | Настройки пользователя |

---

## Структура данных

### Коллекция `roles`

```javascript
{
  id: "office",                    // ID роли
  name: "Офисный сотрудник",       // Название
  description: "Основной...",      // Описание
  isSystem: true,                  // Системная роль?
  isDefault: true,                 // Роль по умолчанию?
  usersCount: 15,                  // Количество пользователей
  modules: {                       // Права на модули
    tasks: "edit",
    boards: "edit",
    teams: "edit",
    learning: "view",
    // ...
  },
  createdAt: Timestamp,
  createdBy: "userId",
  updatedAt: Timestamp
}
```

### Коллекция `users`

```javascript
{
  uid: "user123",
  roleId: "office",               // ← Новое поле
  role: "member",                 // ← Старое поле (для совместимости)
  firstName: "Иван",
  lastName: "Иванов",
  // ... другие поля
}
```

---

## API (roleService)

### Получение ролей

```javascript
// Получить все роли
const { success, roles } = await roleService.getRoles();

// Получить роль по ID
const { success, role } = await roleService.getRole('office');

// Получить роль по умолчанию
const { success, role } = await roleService.getDefaultRole();
```

### Управление ролями

```javascript
// Создать роль
const { success, roleId } = await roleService.createRole({
  name: "Новая роль",
  description: "Описание",
  isDefault: false,
  modules: {
    tasks: "view",
    boards: "edit"
  }
}, userId);

// Обновить роль
await roleService.updateRole(roleId, {
  name: "Обновлённое название",
  modules: { tasks: "admin" }
});

// Удалить роль (только не системные)
await roleService.deleteRole(roleId);
```

### Назначение ролей

```javascript
// Назначить роль пользователю
await roleService.assignRole(userId, roleId);

// Массовое назначение
await roleService.assignRoleBulk([userId1, userId2], roleId);

// Получить пользователей роли
const { success, users } = await roleService.getUsersByRole(roleId);
```

---

## Хуки для проверки прав

### usePermissions

```javascript
import { usePermissions } from '../hooks/usePermissions';
import { MODULES, ACCESS_LEVELS } from '../constants';

function MyComponent() {
  const {
    loading,              // Загрузка данных роли
    userRole,             // Объект роли пользователя
    getModuleAccess,      // (module) => 'none'|'view'|'edit'|'admin'
    hasAccess,            // (module) => boolean (любой доступ)
    canView,              // (module) => boolean
    canEdit,              // (module) => boolean
    canAdmin,             // (module) => boolean
    isSystemAdmin,        // () => boolean
    getAccessibleModules, // () => ['tasks', 'boards', ...]
    getModulesMap,        // () => { tasks: 'edit', boards: 'view', ... }
  } = usePermissions();

  // Пример использования
  if (canEdit(MODULES.TASKS)) {
    // Показать кнопку создания задачи
  }

  if (isSystemAdmin()) {
    // Показать админ-панель
  }
}
```

### useModulePermission

```javascript
import { useModulePermission } from '../hooks/usePermissions';
import { MODULES, ACCESS_LEVELS } from '../constants';

function TasksPage() {
  const canEditTasks = useModulePermission(MODULES.TASKS, ACCESS_LEVELS.EDIT);

  return (
    <div>
      {canEditTasks && <CreateTaskButton />}
    </div>
  );
}
```

---

## Компонент защиты модулей

### ProtectedModule

```javascript
import ProtectedModule from '../components/Common/ProtectedModule';
import { MODULES, ACCESS_LEVELS } from '../constants';

function AdminPage() {
  return (
    <ProtectedModule
      module={MODULES.PROFILE}
      requiredLevel={ACCESS_LEVELS.ADMIN}
      showForbidden={true}  // Показать "Нет доступа" вместо редиректа
      redirectTo="/"        // Куда редиректить при отсутствии прав
    >
      {/* Контент страницы */}
    </ProtectedModule>
  );
}
```

---

## Firestore Security Rules

### Проверка доступа к модулю

```javascript
// Firestore Rules
function hasModuleAccess(module, requiredLevel) {
  let roleData = getUserRoleData();
  let userLevel = roleData != null && module in roleData.modules
    ? roleData.modules[module]
    : 'none';
  let levels = ['none', 'view', 'edit', 'admin'];
  let userLevelIndex = levels.indexOf(userLevel);
  let requiredLevelIndex = levels.indexOf(requiredLevel);
  return roleData != null && userLevel != 'none' && userLevelIndex >= requiredLevelIndex;
}

// Обратная совместимость
function canAccess(module, requiredLevel) {
  return hasModuleAccess(module, requiredLevel) || isApproved();
}
```

### Примеры правил

```javascript
// Задачи
match /tasks/{taskId} {
  allow list, get: if isSignedIn() && canAccess('tasks', 'view');
  allow create: if isSignedIn() && canAccess('tasks', 'edit');
  allow update: if isSignedIn() && canAccess('tasks', 'edit');
  allow delete: if isSignedIn() && (
    hasModuleAccess('tasks', 'admin') ||
    (canAccess('tasks', 'edit') && resource.data.createdBy == request.auth.uid)
  );
}

// Роли (только админы)
match /roles/{roleId} {
  allow read: if isSignedIn();
  allow create, update: if isAdminOrOwner() || getUserRoleId() == 'admin';
  allow delete: if (isAdminOrOwner() || getUserRoleId() == 'admin')
    && resource.data.isSystem != true;
}
```

---

## UI Адаптация

### Динамические табы в командах

```javascript
// TeamDrawer.jsx
const tabsConfig = React.useMemo(() => {
  const allTabs = [
    { id: 'info', label: 'Инфо', icon: <Group />, alwaysShow: true },
    { id: 'chat', label: 'Чат', icon: <Chat />, alwaysShow: true },
    { id: 'boards', label: 'Доски', icon: <ViewKanban />, module: MODULES.BOARDS },
    { id: 'tasks', label: 'Задачи', icon: <Assignment />, module: MODULES.TASKS },
    { id: 'sketches', label: 'Наброски', icon: <Lightbulb />, module: MODULES.SKETCHES },
  ];

  return allTabs.filter(tab =>
    tab.alwaysShow || (tab.module && hasAccess(tab.module))
  );
}, [hasAccess]);
```

### Фильтрация меню в Sidebar

```javascript
// Sidebar.jsx
const menuItems = [
  { title: 'Главная', path: '/', alwaysShow: true },
  ...getAccessibleModules()
    .map(module => moduleToMenuItem[module])
    .filter(Boolean),
];
```

---

## Миграция (выполнена)

### Шаги миграции

1. ✅ **Инициализация ролей** - создано 5 системных ролей
2. ✅ **Миграция пользователей** - всем назначен `roleId` на основе `role`
3. ✅ **Обновление Security Rules** - добавлена проверка модульных прав
4. ✅ **Обратная совместимость** - старое поле `role` сохранено

### Маппинг старых ролей

```javascript
'admin' | 'owner' → roleId: 'admin'
'pending'         → roleId: 'trainee'
'member'          → roleId: 'office'
```

---

## Управление ролями

### Страница `/admin/roles`

**Доступ:** Только администраторы (`roleId: 'admin'` или `role: 'admin'`)

**Функции:**
- Просмотр всех ролей
- Создание новых ролей
- Редактирование прав доступа к модулям
- Назначение ролей пользователям
- Удаление ролей (кроме системных)

**Интерфейс:**
- Карточки ролей с индикаторами
- Модульная матрица прав (таблица модулей × уровни)
- Диалог назначения роли с выбором пользователей

---

## Константы

```javascript
// src/constants/roles.js

export const ACCESS_LEVELS = {
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
  ADMIN: 'admin',
};

export const MODULES = {
  TASKS: 'tasks',
  BOARDS: 'boards',
  SPRINTS: 'sprints',
  CALENDAR: 'calendar',
  SKETCHES: 'sketches',
  TEAMS: 'teams',
  NEWS: 'news',
  LEARNING: 'learning',
  CHAT: 'chat',
  KNOWLEDGE: 'knowledge',
  PROFILE: 'profile',
};

export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OFFICE: 'office',
  TRAINEE: 'trainee',
  VIEWER: 'viewer',
};
```

---

## Troubleshooting

### Пользователь не видит модули

**Причина:** Нет roleId или роль не имеет доступа

**Решение:**
1. Проверить в Firestore: `users/{userId}` → есть ли `roleId`
2. Проверить в Firestore: `roles/{roleId}` → есть ли доступ к модулю
3. Назначить правильную роль через `/admin/roles`

### Ошибка "Missing or insufficient permissions"

**Причина:** Firestore Rules блокируют доступ

**Решение:**
1. Проверить в Firebase Console → Firestore → Rules
2. Убедиться, что правила содержат `canAccess()` для обратной совместимости
3. Проверить логи Firestore в консоли браузера

### Системную роль нельзя удалить

**Это нормально!** Роли с `isSystem: true` защищены от удаления для безопасности системы.

---

## Best Practices

### ✅ DO

- Всегда проверяйте права перед отображением UI
- Используйте `ProtectedModule` для защиты страниц
- Используйте `canEdit()/canView()` для условного рендеринга
- Проверяйте права на сервере (Firestore Rules) И на клиенте

### ❌ DON'T

- Не удаляйте системные роли
- Не даёте всем `admin` доступ без необходимости
- Не полагайтесь только на клиентскую проверку прав
- Не удаляйте старое поле `role` (пока нужна совместимость)

---

## Roadmap

### Будущие улучшения

- [ ] Custom Claims в Firebase Auth для быстрой проверки прав
- [ ] Копирование ролей
- [ ] История изменений ролей (audit log)
- [ ] Экспорт/импорт конфигурации ролей
- [ ] Групповые роли (наследование)
- [ ] Временные роли (expires)

---

## Контакты

**Документация обновлена:** 22.12.2025
**Вопросы:** Обращайтесь к администратору системы
