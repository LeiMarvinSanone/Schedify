import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredEventType = 'class' | 'suspension' | 'event';

export interface StoredCalendarEvent {
  id: string;
  date: string;
  label: string;
  type: StoredEventType;
  time?: string;
  room?: string;
  building?: string;
  department?: string;
  org?: string;
  description?: string;
}

const STORAGE_KEY = 'schedify:posted-calendar-events:v1';

const listeners = new Set<() => void>();

function notifyScheduleChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors to avoid breaking storage updates.
    }
  });
}

export function subscribeScheduleChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getPostedCalendarEvents(): Promise<StoredCalendarEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item =>
      item &&
      typeof item.id === 'string' &&
      typeof item.date === 'string' &&
      typeof item.label === 'string' &&
      typeof item.type === 'string'
    );
  } catch {
    return [];
  }
}

export async function addPostedCalendarEvent(event: Omit<StoredCalendarEvent, 'id'>): Promise<StoredCalendarEvent> {
  const existing = await getPostedCalendarEvents();
  const next: StoredCalendarEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  const updated = [next, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyScheduleChange();
  return next;
}

export async function deletePostedCalendarEvent(id: string): Promise<void> {
  try {
    console.log('deletePostedCalendarEvent called with id:', id);
    const existing = await getPostedCalendarEvents();
    console.log('Existing events before delete:', existing.map(e => ({ id: e.id, label: e.label })));
    const updated = existing.filter(e => e.id !== id);
    console.log('Events after filter:', updated.map(e => ({ id: e.id, label: e.label })));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('AsyncStorage updated successfully');
    notifyScheduleChange();
    const verify = await getPostedCalendarEvents();
    console.log('Verification - events still in storage:', verify.map(e => ({ id: e.id, label: e.label })));
  } catch (error) {
    console.error('Error in deletePostedCalendarEvent:', error);
    throw error;
  }
}
