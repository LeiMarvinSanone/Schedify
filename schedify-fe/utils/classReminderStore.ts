import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderOption = 'off' | 'at_time' | '10m' | '30m' | '1h' | '1d';
export type ReminderSelection = 'use_default' | ReminderOption;

export const CLASS_REMINDER_OPTIONS: ReminderOption[] = ['off', 'at_time', '10m', '30m', '1h', '1d'];

const DEFAULT_REMINDER_KEY = 'schedify:student:class-reminder:default:v1';
const OVERRIDES_KEY = 'schedify:student:class-reminder:overrides:v1';

const listeners = new Set<() => void>();

function notifyReminderSettingsChanged() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors to keep settings updates resilient.
    }
  });
}

export function subscribeReminderSettingsChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isReminderOption(value: unknown): value is ReminderOption {
  return typeof value === 'string' && CLASS_REMINDER_OPTIONS.includes(value as ReminderOption);
}

export function reminderOptionLabel(option: ReminderSelection, defaultOption?: ReminderOption): string {
  switch (option) {
    case 'use_default':
      return defaultOption ? `Default (${reminderOptionLabel(defaultOption)})` : 'Use default';
    case 'off':
      return 'Off';
    case 'at_time':
      return 'At time';
    case '10m':
      return '10m before';
    case '30m':
      return '30m before';
    case '1h':
      return '1h before';
    case '1d':
      return '1d before';
    default:
      return 'Use default';
  }
}

export async function getDefaultClassReminder(): Promise<ReminderOption> {
  try {
    const raw = await AsyncStorage.getItem(DEFAULT_REMINDER_KEY);
    if (isReminderOption(raw)) return raw;
  } catch {
    // Fall through to default.
  }
  return '30m';
}

export async function setDefaultClassReminder(value: ReminderOption): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_REMINDER_KEY, value);
  notifyReminderSettingsChanged();
}

export async function getClassReminderOverrides(): Promise<Record<string, ReminderOption>> {
  try {
    const raw = await AsyncStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const cleaned: Record<string, ReminderOption> = {};
    Object.entries(parsed).forEach(([eventId, value]) => {
      if (typeof eventId === 'string' && isReminderOption(value)) {
        cleaned[eventId] = value;
      }
    });
    return cleaned;
  } catch {
    return {};
  }
}

export async function setClassReminderSelection(eventId: string, selection: ReminderSelection): Promise<void> {
  const current = await getClassReminderOverrides();

  if (selection === 'use_default') {
    delete current[eventId];
  } else {
    current[eventId] = selection;
  }

  await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(current));
  notifyReminderSettingsChanged();
}
