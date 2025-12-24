// src/hooks/usePermissions.js
import { useState, useEffect, useContext, useMemo } from 'react';
import { UserContext } from '../App';
import roleService from '../services/role.service';
import { ACCESS_LEVELS, MODULES, hasModuleAccess } from '../constants';

/**
 * Хук для проверки прав доступа пользователя к модулям
 * @returns {Object} Объект с функциями проверки прав
 */
export function usePermissions() {
  const { user } = useContext(UserContext);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем роль пользователя
  useEffect(() => {
    if (!user?.roleId) {
      setLoading(false);
      return;
    }

    const loadUserRole = async () => {
      setLoading(true);
      const result = await roleService.getRole(user.roleId);

      if (result.success) {
        setUserRole(result.role);
      }

      setLoading(false);
    };

    loadUserRole();
  }, [user?.roleId]);

  // Мемоизируем функции проверки прав
  const permissions = useMemo(() => {
    /**
     * Получить уровень доступа к модулю
     */
    const getModuleAccess = (module) => {
      if (!userRole || !userRole.modules) {
        return ACCESS_LEVELS.NONE;
      }

      return userRole.modules[module] || ACCESS_LEVELS.NONE;
    };

    /**
     * Проверка наличия доступа к модулю (любого уровня кроме none)
     */
    const hasAccess = (module) => {
      const access = getModuleAccess(module);
      return access !== ACCESS_LEVELS.NONE;
    };

    /**
     * Проверка прав на просмотр модуля
     */
    const canView = (module) => {
      const access = getModuleAccess(module);
      return hasModuleAccess(access, ACCESS_LEVELS.VIEW);
    };

    /**
     * Проверка прав на редактирование модуля
     */
    const canEdit = (module) => {
      const access = getModuleAccess(module);
      return hasModuleAccess(access, ACCESS_LEVELS.EDIT);
    };

    /**
     * Проверка прав администрирования модуля
     */
    const canAdmin = (module) => {
      const access = getModuleAccess(module);
      return hasModuleAccess(access, ACCESS_LEVELS.ADMIN);
    };

    /**
     * Получить список доступных модулей
     */
    const getAccessibleModules = () => {
      if (!userRole || !userRole.modules) {
        return [];
      }

      return Object.keys(userRole.modules).filter(module => {
        return userRole.modules[module] !== ACCESS_LEVELS.NONE;
      });
    };

    /**
     * Проверка, является ли пользователь администратором системы
     */
    const isSystemAdmin = () => {
      return userRole?.isSystem && userRole.id === 'admin';
    };

    /**
     * Получить маппинг модулей с их уровнями доступа
     */
    const getModulesMap = () => {
      if (!userRole || !userRole.modules) {
        return {};
      }

      return userRole.modules;
    };

    return {
      loading,
      userRole,
      getModuleAccess,
      hasAccess,
      canView,
      canEdit,
      canAdmin,
      getAccessibleModules,
      isSystemAdmin,
      getModulesMap,
    };
  }, [userRole, loading]);

  return permissions;
}

/**
 * Хук для проверки прав на конкретный модуль
 * Более простой вариант usePermissions для частых случаев
 *
 * @param {string} module - ID модуля из MODULES
 * @param {string} requiredLevel - Требуемый уровень доступа (по умолчанию VIEW)
 * @returns {boolean} Есть ли доступ
 *
 * @example
 * const canEditLearning = useModulePermission(MODULES.LEARNING, ACCESS_LEVELS.EDIT);
 */
export function useModulePermission(module, requiredLevel = ACCESS_LEVELS.VIEW) {
  const { getModuleAccess } = usePermissions();

  return useMemo(() => {
    const access = getModuleAccess(module);
    return hasModuleAccess(access, requiredLevel);
  }, [getModuleAccess, module, requiredLevel]);
}

/**
 * Хук для получения только доступных модулей (для меню)
 * @returns {Array<string>} Массив ID доступных модулей
 */
export function useAccessibleModules() {
  const { getAccessibleModules } = usePermissions();

  return useMemo(() => {
    return getAccessibleModules();
  }, [getAccessibleModules]);
}
