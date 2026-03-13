import { 
  getSchedules as apiGetSchedules, 
  createSchedule as apiCreateSchedule, 
  updateSchedule as apiUpdateSchedule, 
  deleteSchedule as apiDeleteSchedule, 
  Schedule, 
  CreateScheduleInput 
} from './apiClient';

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

// Convert backend Schedule to frontend StoredCalendarEvent format
function convertScheduleToEvents(schedule: Schedule): StoredCalendarEvent[] {
  const events: StoredCalendarEvent[] = [];
  const typeMap: Record<string, StoredEventType> = {
    'Class Schedules': 'class',
    'Events': 'event',
    'Suspension': 'suspension',
  };
  
  const eventType = typeMap[schedule.type] || 'event';
  
  // If schedule has subjects, create an event for each subject
  if (schedule.subjects && schedule.subjects.length > 0) {
    schedule.subjects.forEach((subject, index) => {
      events.push({
        id: `${schedule._id}-${index}`,
        date: new Date().toISOString().split('T')[0], // Default to today
        label: subject.name,
        type: eventType,
        time: subject.timeRange,
        room: subject.room,
        department: schedule.department,
        description: `${schedule.course || ''} ${schedule.block || ''}`.trim(),
      });
    });
  } else {
    // Single event without subjects
    events.push({
      id: schedule._id,
      date: new Date().toISOString().split('T')[0],
      label: `${schedule.type} - ${schedule.tag || 'General'}`,
      type: eventType,
      department: schedule.department,
      description: schedule.tag,
    });
  }
  
  return events;
}

export async function getPostedCalendarEvents(): Promise<StoredCalendarEvent[]> {
  try {
    const schedules = await apiGetSchedules();
    const events: StoredCalendarEvent[] = [];
    
    schedules.forEach(schedule => {
      events.push(...convertScheduleToEvents(schedule));
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching schedules from API:', error);
    return [];
  }
}

export async function addPostedCalendarEvent(event: Omit<StoredCalendarEvent, 'id'>): Promise<StoredCalendarEvent> {
  try {
    const typeMap: Record<StoredEventType, string> = {
      'class': 'Class Schedules',
      'event': 'Events',
      'suspension': 'Suspension',
    };
    
    const scheduleData: CreateScheduleInput = {
      type: typeMap[event.type],
      department: event.department,
      tag: event.description || event.label,
      subjects: event.time ? [{
        name: event.label,
        day: 'Monday', // Default day
        timeRange: event.time,
        room: event.room,
      }] : undefined,
    };
    
    const response = await apiCreateSchedule(scheduleData);
    notifyScheduleChange();
    
    return {
      id: response.schedule._id,
      ...event,
    };
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
}

export async function updatePostedCalendarEvent(id: string, updates: Partial<Omit<StoredCalendarEvent, 'id'>>): Promise<void> {
  try {
    // Extract the actual schedule ID (before the dash if composite ID)
    const scheduleId = id.includes('-') ? id.split('-')[0] : id;
    
    const updateData: Partial<CreateScheduleInput> = {};
    
    if (updates.label) {
      updateData.tag = updates.label;
    }
    if (updates.department) {
      updateData.department = updates.department;
    }
    if (updates.description) {
      updateData.tag = updates.description;
    }
    
    await apiUpdateSchedule(scheduleId, updateData);
    notifyScheduleChange();
  } catch (error) {
    console.error('Error in updatePostedCalendarEvent:', error);
    throw error;
  }
}

export async function deletePostedCalendarEvent(id: string): Promise<void> {
  try {
    // Extract the actual schedule ID (before the dash if composite ID)
    const scheduleId = id.includes('-') ? id.split('-')[0] : id;
    
    await apiDeleteSchedule(scheduleId);
    notifyScheduleChange();
  } catch (error) {
    console.error('Error in deletePostedCalendarEvent:', error);
    throw error;
  }
}

// Direct API access for schedules (for admin use)
export async function getAllSchedules(): Promise<Schedule[]> {
  try {
    return await apiGetSchedules();
  } catch (error) {
    console.error('Error fetching all schedules:', error);
    return [];
  }
}

export { Schedule };
