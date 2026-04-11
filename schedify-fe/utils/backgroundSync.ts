import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getPostedCalendarEvents } from './scheduleStore';
import {
  getClassReminderOverrides,
  getDefaultClassReminder,
} from './classReminderStore';
import { syncClassReminderNotifications } from './classReminderScheduler';

export const BACKGROUND_SYNC_TASK = 'schedify-class-reminder-sync';

// Define what happens when background task runs
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const [events, defaultReminder, overrides] = await Promise.all([
      getPostedCalendarEvents(),
      getDefaultClassReminder(),
      getClassReminderOverrides(),
    ]);

    await syncClassReminderNotifications(events, defaultReminder, overrides);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task — call this once when app starts
export async function registerBackgroundSync() {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    // Check if background fetch is available on this device
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.log('Background fetch is not available on this device');
      return;
    }

    // Check if already registered — don't double-register
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) return;

    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 60 * 15,  // every 15 minutes (minimum allowed)
      stopOnTerminate: false,     // keep running after app is closed
      startOnBoot: true,          // restart after device reboot
    });

    console.log('Background sync registered successfully');
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
}