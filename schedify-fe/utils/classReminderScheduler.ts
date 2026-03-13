import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { StoredCalendarEvent } from './scheduleStore';
import type { ReminderOption } from './classReminderStore';

const NOTIF_MAP_KEY = 'schedify:student:class-reminder:notif-map:v1';

function reminderOffsetMs(option: ReminderOption): number {
  switch (option) {
    case 'off':
      return Number.POSITIVE_INFINITY;
    case 'at_time':
      return 0;
    case '10m':
      return 10 * 60 * 1000;
    case '30m':
      return 30 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '1d':
      return 24 * 60 * 60 * 1000;
    default:
      return 30 * 60 * 1000;
  }
}

function parseStartDate(dateIso: string, timeRange?: string): Date | null {
  if (!timeRange) return null;

  const startPart = timeRange.split('-')[0]?.trim();
  if (!startPart) return null;

  const match = startPart.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? '0');
  const meridiem = (match[3] ?? '').toLowerCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute < 0 || minute > 59) return null;

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (!meridiem && (hour < 0 || hour > 23)) return null;
  if (meridiem && (hour < 0 || hour > 23)) return null;

  const [y, m, d] = dateIso.split('-').map(Number);
  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return !!(requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL);
}

async function getNotificationMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const clean: Record<string, string> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof k === 'string' && typeof v === 'string') clean[k] = v;
    });
    return clean;
  } catch {
    return {};
  }
}

async function saveNotificationMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(NOTIF_MAP_KEY, JSON.stringify(map));
}

export async function syncClassReminderNotifications(
  allEvents: StoredCalendarEvent[],
  defaultReminder: ReminderOption,
  overrides: Record<string, ReminderOption>
): Promise<void> {
  if (Platform.OS === 'web') return;

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('class-reminders', {
      name: 'Class reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const notificationMap = await getNotificationMap();
  const classEvents = allEvents.filter((event) => event.type === 'class');
  const classIds = new Set(classEvents.map((event) => event.id));

  for (const [eventId, notifId] of Object.entries(notificationMap)) {
    if (!classIds.has(eventId)) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      } catch {
        // Ignore if already missing.
      }
      delete notificationMap[eventId];
    }
  }

  for (const event of classEvents) {
    const reminder = overrides[event.id] ?? defaultReminder;
    const existingNotifId = notificationMap[event.id];

    if (existingNotifId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(existingNotifId);
      } catch {
        // Ignore if missing.
      }
      delete notificationMap[event.id];
    }

    if (reminder === 'off') continue;

    const startDate = parseStartDate(event.date, event.time);
    if (!startDate) continue;

    const triggerDate = new Date(startDate.getTime() - reminderOffsetMs(reminder));
    if (triggerDate.getTime() <= Date.now()) continue;

    const bodyParts = [event.time, event.room, event.building].filter(Boolean);
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Class Reminder',
        body: `${event.label}${bodyParts.length ? ` • ${bodyParts.join(' • ')}` : ''}`,
        data: { scheduleId: event.id, type: event.type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        ...(Platform.OS === 'android' ? { channelId: 'class-reminders' } : {}),
      },
    });

    notificationMap[event.id] = notifId;
  }

  await saveNotificationMap(notificationMap);
}
