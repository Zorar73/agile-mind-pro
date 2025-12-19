// src/theme.js - Bauhaus Style Theme with Dark Mode
import { createTheme } from '@mui/material/styles';

// =====================
// ЦВЕТОВАЯ ПАЛИТРА
// =====================

const bauhaus = {
  // Primary Bauhaus
  red: '#E53935',
  blue: '#1E88E5',
  yellow: '#FDD835',
  
  // Extended palette
  coral: '#FF6B6B',
  teal: '#26A69A',
  purple: '#7E57C2',
  orange: '#FF9800',
  pink: '#EC407A',
  green: '#4CAF50',
  indigo: '#5C6BC0',
  cyan: '#00BCD4',
  
  // Neutrals
  black: '#1A1A1A',
  white: '#FFFFFF',
};

// Градиенты
export const gradients = {
  primary: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
  secondary: 'linear-gradient(135deg, #7E57C2 0%, #5E35B1 100%)',
  success: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
  warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
  error: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
  info: 'linear-gradient(135deg, #26A69A 0%, #00897B 100%)',
  
  // Красивые градиенты для карточек
  bluePurple: 'linear-gradient(135deg, #1E88E5 0%, #7E57C2 100%)',
  tealCyan: 'linear-gradient(135deg, #26A69A 0%, #00BCD4 100%)',
  orangeRed: 'linear-gradient(135deg, #FF9800 0%, #E53935 100%)',
  pinkPurple: 'linear-gradient(135deg, #EC407A 0%, #7E57C2 100%)',
  
  // Для тёмной темы
  darkCard: 'linear-gradient(135deg, #2D2D2D 0%, #1E1E1E 100%)',
  darkHeader: 'linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%)',
};

// Единые цвета статусов задач
export const statusColors = {
  todo: {
    main: '#9E9E9E',
    light: '#E0E0E0',
    dark: '#616161',
    bg: '#F5F5F5',
    bgDark: '#424242',
  },
  in_progress: {
    main: '#1E88E5',
    light: '#64B5F6',
    dark: '#1565C0',
    bg: '#E3F2FD',
    bgDark: '#1565C0',
  },
  review: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    bg: '#FFF3E0',
    bgDark: '#E65100',
  },
  done: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    bg: '#E8F5E9',
    bgDark: '#2E7D32',
  },
  overdue: {
    main: '#E53935',
    light: '#EF5350',
    dark: '#C62828',
    bg: '#FFEBEE',
    bgDark: '#B71C1C',
  },
  blocked: {
    main: '#7E57C2',
    light: '#B39DDB',
    dark: '#5E35B1',
    bg: '#EDE7F6',
    bgDark: '#4527A0',
  },
};

// Цвета приоритетов
export const priorityColors = {
  low: {
    main: '#9E9E9E',
    bg: '#F5F5F5',
    bgDark: '#424242',
  },
  normal: {
    main: '#1E88E5',
    bg: '#E3F2FD',
    bgDark: '#1565C0',
  },
  high: {
    main: '#FF9800',
    bg: '#FFF3E0',
    bgDark: '#E65100',
  },
  urgent: {
    main: '#E53935',
    bg: '#FFEBEE',
    bgDark: '#B71C1C',
  },
};

// =====================
// СВЕТЛАЯ ТЕМА
// =====================

const lightPalette = {
  mode: 'light',
  primary: {
    main: bauhaus.blue,
    light: '#64B5F6',
    dark: '#1565C0',
    contrastText: bauhaus.white,
  },
  secondary: {
    main: bauhaus.purple,
    light: '#B39DDB',
    dark: '#5E35B1',
    contrastText: bauhaus.white,
  },
  error: {
    main: bauhaus.red,
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: bauhaus.orange,
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  info: {
    main: bauhaus.teal,
    light: '#4DB6AC',
    dark: '#00897B',
  },
  success: {
    main: bauhaus.green,
    light: '#81C784',
    dark: '#388E3C',
  },
  background: {
    default: '#F8F9FA',
    paper: bauhaus.white,
    subtle: '#F1F3F4',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#5F6368',
    disabled: '#9AA0A6',
  },
  divider: '#E0E0E0',
  action: {
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(30, 136, 229, 0.08)',
    focus: 'rgba(30, 136, 229, 0.12)',
  },
  // Custom
  bauhaus: { ...bauhaus },
  status: statusColors,
  priority: priorityColors,
  gradients,
};

// =====================
// ТЁМНАЯ ТЕМА
// =====================

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#64B5F6',
    light: '#90CAF9',
    dark: '#1E88E5',
    contrastText: '#000000',
  },
  secondary: {
    main: '#B39DDB',
    light: '#D1C4E9',
    dark: '#7E57C2',
    contrastText: '#000000',
  },
  error: {
    main: '#EF5350',
    light: '#E57373',
    dark: '#E53935',
  },
  warning: {
    main: '#FFB74D',
    light: '#FFCC80',
    dark: '#FF9800',
    contrastText: '#000000',
  },
  info: {
    main: '#4DB6AC',
    light: '#80CBC4',
    dark: '#26A69A',
  },
  success: {
    main: '#81C784',
    light: '#A5D6A7',
    dark: '#4CAF50',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    subtle: '#2D2D2D',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6B6B6B',
  },
  divider: '#3D3D3D',
  action: {
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(100, 181, 246, 0.16)',
    focus: 'rgba(100, 181, 246, 0.24)',
  },
  // Custom
  bauhaus: { 
    ...bauhaus,
    // Более яркие версии для тёмной темы
    blue: '#64B5F6',
    red: '#EF5350',
    yellow: '#FFEE58',
    teal: '#4DB6AC',
    purple: '#B39DDB',
    green: '#81C784',
  },
  status: statusColors,
  priority: priorityColors,
  gradients,
};

// =====================
// ТИПОГРАФИКА
// =====================

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", -apple-system, sans-serif',
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  overline: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
};

// =====================
// КОМПОНЕНТЫ
// =====================

const getComponents = (mode) => {
  const isDark = mode === 'dark';
  
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDark ? '#2D2D2D' : '#F1F3F4',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? '#5F5F5F' : '#C4C4C4',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: isDark ? '#7F7F7F' : '#A0A0A0',
          },
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark 
              ? '0 4px 12px rgba(0,0,0,0.4)' 
              : '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: gradients.primary,
            '&:hover': {
              background: gradients.primary,
            },
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: isDark 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.06)',
          border: isDark ? '1px solid #3D3D3D' : '1px solid #E8E8E8',
          transition: 'all 0.2s ease',
          backgroundImage: 'none',
          '&:hover': {
            boxShadow: isDark 
              ? '0 8px 24px rgba(0,0,0,0.4)' 
              : '0 8px 24px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontWeight: 600,
          fontSize: '0.75rem',
          // Touch-friendly размеры для мобильных (WCAG: минимум 44px)
          '@media (max-width: 600px)': {
            minHeight: 44,
            fontSize: '0.875rem',
            '& .MuiChip-label': {
              padding: '0 16px',
            },
          },
        },
        filled: {
          '&.MuiChip-colorDefault': {
            backgroundColor: isDark ? '#3D3D3D' : '#F1F3F4',
            color: isDark ? '#E0E0E0' : '#5F6368',
          },
        },
        outlined: {
          borderWidth: 2,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderWidth: 2,
              borderColor: isDark ? '#3D3D3D' : '#E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: isDark ? '#5F5F5F' : '#BDBDBD',
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& fieldset': {
            borderWidth: 2,
          },
        },
      },
    },
    
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          border: isDark ? '2px solid #3D3D3D' : '2px solid #FFFFFF',
          boxShadow: isDark 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: isDark 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: isDark 
            ? '0 4px 12px rgba(0,0,0,0.35)' 
            : '0 4px 12px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: isDark 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.12)',
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: isDark ? '1px solid #3D3D3D' : '1px solid #E0E0E0',
          backgroundImage: 'none',
        },
      },
    },
    
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: isDark ? '1px solid #3D3D3D' : '1px solid #E0E0E0',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: isDark 
              ? 'rgba(100, 181, 246, 0.16)' 
              : 'rgba(30, 136, 229, 0.08)',
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(100, 181, 246, 0.24)' 
                : 'rgba(30, 136, 229, 0.12)',
            },
          },
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 48,
        },
      },
    },
    
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },
    
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: '20px 24px 12px',
        },
      },
    },
    
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
        },
      },
    },
    
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
        },
      },
    },
    
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease',
          // Touch-friendly размеры для мобильных (WCAG: минимум 44px)
          '@media (max-width: 600px)': {
            minWidth: 44,
            minHeight: 44,
            padding: 10,
          },
          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: isDark 
            ? '0 4px 12px rgba(0,0,0,0.4)' 
            : '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: isDark ? '#3D3D3D' : '#E0E0E0',
        },
      },
    },
    
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? '#424242' : '#1A1A1A',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
        arrow: {
          color: isDark ? '#424242' : '#1A1A1A',
        },
      },
    },
    
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9',
          color: isDark ? '#81C784' : '#2E7D32',
          '& .MuiAlert-icon': {
            color: isDark ? '#81C784' : '#2E7D32',
          },
        },
        standardError: {
          backgroundColor: isDark ? 'rgba(229, 57, 53, 0.15)' : '#FFEBEE',
          color: isDark ? '#EF5350' : '#C62828',
          '& .MuiAlert-icon': {
            color: isDark ? '#EF5350' : '#C62828',
          },
        },
        standardWarning: {
          backgroundColor: isDark ? 'rgba(255, 152, 0, 0.15)' : '#FFF3E0',
          color: isDark ? '#FFB74D' : '#E65100',
          '& .MuiAlert-icon': {
            color: isDark ? '#FFB74D' : '#E65100',
          },
        },
        standardInfo: {
          backgroundColor: isDark ? 'rgba(30, 136, 229, 0.15)' : '#E3F2FD',
          color: isDark ? '#64B5F6' : '#1565C0',
          '& .MuiAlert-icon': {
            color: isDark ? '#64B5F6' : '#1565C0',
          },
        },
      },
    },
    
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: isDark ? '1px solid #3D3D3D' : '1px solid #E0E0E0',
        },
        head: {
          fontWeight: 600,
          backgroundColor: isDark ? '#2D2D2D' : '#F8F9FA',
        },
      },
    },
    
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: isDark 
              ? 'rgba(255,255,255,0.04)' 
              : 'rgba(0,0,0,0.02)',
          },
        },
      },
    },
    
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: isDark 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.12)',
          border: isDark ? '1px solid #3D3D3D' : '1px solid #E8E8E8',
        },
      },
    },
    
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '8px 12px',
          '&:hover': {
            backgroundColor: isDark 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(0,0,0,0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: isDark 
              ? 'rgba(100, 181, 246, 0.16)' 
              : 'rgba(30, 136, 229, 0.08)',
          },
        },
      },
    },
    
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: 4,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': {
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        track: {
          borderRadius: 16,
          opacity: 1,
          backgroundColor: isDark ? '#5F5F5F' : '#E0E0E0',
        },
      },
    },
    
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: '0.7rem',
        },
      },
    },
    
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? '#3D3D3D' : '#E0E0E0',
        },
      },
    },
    
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? '#3D3D3D' : '#E8E8E8',
        },
      },
    },
  };
};

// =====================
// СОЗДАНИЕ ТЕМ
// =====================

const createAppTheme = (mode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette,
    typography,
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
      mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.25)' : '0 2px 4px rgba(0,0,0,0.06)',
      mode === 'dark' ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.08)',
      mode === 'dark' ? '0 6px 12px rgba(0,0,0,0.35)' : '0 6px 12px rgba(0,0,0,0.1)',
      mode === 'dark' ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.12)',
      mode === 'dark' ? '0 12px 24px rgba(0,0,0,0.45)' : '0 12px 24px rgba(0,0,0,0.14)',
      mode === 'dark' ? '0 16px 32px rgba(0,0,0,0.5)' : '0 16px 32px rgba(0,0,0,0.16)',
      ...Array(17).fill(mode === 'dark' ? '0 16px 32px rgba(0,0,0,0.5)' : '0 16px 32px rgba(0,0,0,0.16)'),
    ],
    components: getComponents(mode),
  });
};

// Экспорт тем
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

// Дефолтный экспорт — светлая тема (для обратной совместимости)
export default lightTheme;

// =====================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ЦВЕТАМИ
// =====================

/**
 * Получить цвет статуса задачи
 * @param {string} status - Статус (todo, in_progress, review, done, overdue, blocked)
 * @param {boolean} isDark - Тёмная тема
 * @returns {Object} - {main, light, dark, bg}
 */
export const getStatusColor = (status, isDark = false) => {
  const colors = statusColors[status] || statusColors.todo;
  return {
    ...colors,
    bg: isDark ? colors.bgDark : colors.bg,
  };
};

/**
 * Получить цвет приоритета
 * @param {string} priority - Приоритет (low, normal, high, urgent)
 * @param {boolean} isDark - Тёмная тема
 * @returns {Object} - {main, bg}
 */
export const getPriorityColor = (priority, isDark = false) => {
  const colors = priorityColors[priority] || priorityColors.normal;
  return {
    ...colors,
    bg: isDark ? colors.bgDark : colors.bg,
  };
};

/**
 * Получить градиент по имени
 * @param {string} name - Имя градиента
 * @returns {string} - CSS градиент
 */
export const getGradient = (name) => {
  return gradients[name] || gradients.primary;
};
