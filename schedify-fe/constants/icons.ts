// Professional icon system for the entire app
export const ICONS = {
  // Navigation
  nav: {
    dashboard: '▦',
    post: '✚',
    schedules: '▬',
    settings: '⚙',
    calendar: '📅',
    profile: '👤',
    events: '☰',
  },

  // Actions
  actions: {
    add: '✚',
    remove: '✕',
    close: '✕',
    edit: '✎',
    delete: '🗑',
    save: '✓',
    check: '✓',
  },

  // Schedule Types
  postTypes: {
    class: '📚',
    event: '★',
    suspension: '⛔',
  },

  // Statistics
  stats: {
    schedules: '📋',
    monthly: '📅',
    courses: '📖',
    departments: '🏢',
  },

  // Info/Meta
  meta: {
    time: '🕐',
    location: '📍',
    building: '🏛',
    organization: '🏢',
    room: '📍',
  },

  // Status
  status: {
    active: '●',
    inactive: '○',
    pending: '◐',
    archived: '◆',
  },

  // Separators & UI
  ui: {
    chevronDown: '▼',
    arrow: '→',
    menu: '☰',
    grid: '▦',
    dots: '⋮',
  },
};

// Icon sizes - consistent across app
export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

// Color mappings for different contexts
export const ICON_COLORS = {
  schedule: {
    class: '#4ade80',
    event: '#f6e05e',
    suspension: '#fc8181',
  },
  ui: {
    primary: '#a78bfa',
    muted: '#718096',
    active: '#e2e8f0',
    inactive: '#4a5568',
  },
  semantic: {
    success: '#4ade80',
    warning: '#f6e05e',
    error: '#fc8181',
    info: '#60a5fa',
  },
} as const;
