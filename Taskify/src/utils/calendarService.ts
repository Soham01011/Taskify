import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../api/tasks';

const CALENDAR_ID_KEY = 'TASKIFY_DEVICE_CALENDAR_ID';
const CALENDAR_EVENTS_MAP_KEY = 'TASKIFY_CALENDAR_EVENT_MAP';

export class CalendarService {
    private static cachedCalendarId: string | null = null;
    private static eventMapCache: Record<string, string> | null = null;
    private static isSyncing = false;

    /**
     * Checks if calendar permissions are already granted
     */
    static async checkPermission(): Promise<boolean> {
        try {
            const { status } = await Calendar.getCalendarPermissionsAsync();
            return status === 'granted';
        } catch (e) {
            console.warn('Failed to check calendar permission:', e);
            return false;
        }
    }

    /**
     * Requests calendar permissions from the user
     */
    static async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            return status === 'granted';
        } catch (e) {
            console.warn('Failed to request calendar permission:', e);
            return false;
        }
    }

    /**
     * Gets an existing Taskify calendar or creates a dedicated one on the device
     */
    static async getOrCreateTaskifyCalendar(): Promise<string | null> {
        if (this.cachedCalendarId) {
            return this.cachedCalendarId;
        }

        const hasPermission = await this.checkPermission();
        if (!hasPermission) {
            return null;
        }

        try {
            // Check stored calendar ID
            const savedCalId = await AsyncStorage.getItem(CALENDAR_ID_KEY);
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

            if (savedCalId) {
                const existing = calendars.find(c => c.id === savedCalId && c.allowsModifications);
                if (existing) {
                    this.cachedCalendarId = existing.id;
                    return existing.id;
                }
            }

            // Check if there is already a calendar titled "Taskify"
            const existingTaskifyCal = calendars.find(c => c.title === 'Taskify' && c.allowsModifications);
            if (existingTaskifyCal) {
                this.cachedCalendarId = existingTaskifyCal.id;
                await AsyncStorage.setItem(CALENDAR_ID_KEY, existingTaskifyCal.id);
                return existingTaskifyCal.id;
            }

            // Otherwise, create a new dedicated calendar
            if (Platform.OS === 'ios') {
                let source: Calendar.Source | undefined;
                try {
                    const defaultCal = await Calendar.getDefaultCalendarAsync();
                    source = defaultCal.source;
                } catch {
                    source = calendars.find(c => c.source)?.source;
                }

                if (!source) {
                    const writable = calendars.find(c => c.allowsModifications);
                    if (writable) {
                        this.cachedCalendarId = writable.id;
                        return writable.id;
                    }
                    return null;
                }

                const newCalendarId = await Calendar.createCalendarAsync({
                    title: 'Taskify',
                    color: '#00AEEF',
                    entityType: Calendar.EntityTypes.EVENT,
                    sourceId: source.id,
                    source: source,
                    name: 'Taskify',
                    ownerAccount: 'personal',
                    accessLevel: Calendar.CalendarAccessLevel.OWNER,
                });

                this.cachedCalendarId = newCalendarId;
                await AsyncStorage.setItem(CALENDAR_ID_KEY, newCalendarId);
                return newCalendarId;
            } else {
                // Android requires a local source or Google account source
                const newCalendarId = await Calendar.createCalendarAsync({
                    title: 'Taskify',
                    color: '#00AEEF',
                    entityType: Calendar.EntityTypes.EVENT,
                    name: 'Taskify',
                    ownerAccount: 'Taskify',
                    accessLevel: Calendar.CalendarAccessLevel.OWNER,
                    source: {
                        isLocalAccount: true,
                        name: 'Taskify',
                        type: 'LOCAL',
                    },
                });

                this.cachedCalendarId = newCalendarId;
                await AsyncStorage.setItem(CALENDAR_ID_KEY, newCalendarId);
                return newCalendarId;
            }
        } catch (error) {
            console.error('Error getting or creating Taskify calendar:', error);
            // Fallback to any writable calendar
            try {
                const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                const writable = calendars.find(c => c.allowsModifications);
                if (writable) {
                    this.cachedCalendarId = writable.id;
                    return writable.id;
                }
            } catch {}
            return null;
        }
    }

    /**
     * Retrieves the stored taskId -> calendarEventId map
     */
    static async getEventMap(): Promise<Record<string, string>> {
        if (this.eventMapCache !== null) {
            return this.eventMapCache;
        }
        try {
            const raw = await AsyncStorage.getItem(CALENDAR_EVENTS_MAP_KEY);
            this.eventMapCache = raw ? JSON.parse(raw) : {};
            return this.eventMapCache!;
        } catch {
            this.eventMapCache = {};
            return this.eventMapCache;
        }
    }

    /**
     * Persists the stored taskId -> calendarEventId map
     */
    static async saveEventMap(map: Record<string, string>): Promise<void> {
        try {
            this.eventMapCache = { ...map };
            await AsyncStorage.setItem(CALENDAR_EVENTS_MAP_KEY, JSON.stringify(this.eventMapCache));
        } catch (e) {
            console.error('Failed to save event map:', e);
        }
    }

    /**
     * Creates or updates a calendar event for a given task, deduplicating any existing events in calendar
     */
    static async createOrUpdateTaskEvent(task: any): Promise<string | null> {
        const taskId = task._id || task.taskId || task.id;
        const dueDate = task.dueDate || task.duedate;
        if (!taskId || !dueDate) return null;

        const calendarId = await this.getOrCreateTaskifyCalendar();
        if (!calendarId) return null;

        const startDate = new Date(dueDate);
        if (isNaN(startDate.getTime())) return null;

        // Calculate duration: respect timeSlots if available, default to 30 mins
        let durationMinutes = 30;
        if (task.timeSlots && Array.isArray(task.timeSlots) && task.timeSlots.length > 0) {
            const slot = task.timeSlots[0];
            const hours = slot.hours ?? 0;
            const minutes = slot.minutes ?? 0;
            const total = hours * 60 + minutes;
            if (total > 0) durationMinutes = total;
        }
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

        const isAlarm = task.alarm_type === 'alarm';
        const alarms: Calendar.Alarm[] = [];

        // If alarm mode is chosen, set a direct alarm alert at event time
        if (isAlarm) {
            alarms.push({
                relativeOffset: 0, // at start time
                method: Calendar.AlarmMethod.ALERT,
            });

            // If a custom alarm reminder time was set earlier than due date
            if (task.alarm_reminder_time) {
                const reminderDate = new Date(task.alarm_reminder_time);
                if (!isNaN(reminderDate.getTime())) {
                    const offsetMinutes = Math.round((reminderDate.getTime() - startDate.getTime()) / 60000);
                    if (offsetMinutes < 0) {
                        alarms.push({
                            relativeOffset: offsetMinutes,
                            method: Calendar.AlarmMethod.ALERT,
                        });
                    }
                }
            }
        }

        const title = task.title || task.task || 'Task';
        const taskTag = `[TaskifyID:${taskId}]`;
        const rawDescription = task.description || (task.groupName ? `Group: ${task.groupName}` : '');
        const notes = rawDescription ? `${rawDescription}\n\n${taskTag}` : taskTag;
        const location = task.location || (task.groupName ? `Group: ${task.groupName}` : undefined);

        const eventDetails: any = {
            title,
            notes,
            startDate,
            endDate,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            location,
            alarms: alarms.length > 0 ? alarms : undefined,
        };

        const eventMap = await this.getEventMap();
        let existingEventId: string | undefined = eventMap[taskId];

        try {
            // 1. If we have a mapped event ID, try updating it
            if (existingEventId) {
                try {
                    await Calendar.updateEventAsync(existingEventId, eventDetails);
                    return existingEventId;
                } catch {
                    // ID no longer valid in calendar (e.g. user manually deleted it)
                    existingEventId = undefined;
                    delete eventMap[taskId];
                }
            }

            // 2. Direct calendar search around event date window (+- 3 days) to find existing events
            // and eliminate duplicates even if AsyncStorage was cleared
            const searchStart = new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000);
            const searchEnd = new Date(endDate.getTime() + 3 * 24 * 60 * 60 * 1000);

            try {
                const calendarEvents = await Calendar.getEventsAsync([calendarId], searchStart, searchEnd);
                const matchingEvents = calendarEvents.filter(e => {
                    if (e.notes && e.notes.includes(taskTag)) return true;
                    // Fallback check: matching title and start time within 2 minutes
                    const timeDiff = Math.abs(new Date(e.startDate).getTime() - startDate.getTime());
                    return e.title === title && timeDiff < 120000;
                });

                if (matchingEvents.length > 0) {
                    const primeEvent = matchingEvents[0];
                    await Calendar.updateEventAsync(primeEvent.id, eventDetails);
                    eventMap[taskId] = primeEvent.id;
                    await this.saveEventMap(eventMap);

                    // Clean up any extra duplicate events found in the calendar
                    for (let i = 1; i < matchingEvents.length; i++) {
                        try {
                            await Calendar.deleteEventAsync(matchingEvents[i].id);
                        } catch {}
                    }
                    return primeEvent.id;
                }
            } catch (searchErr) {
                console.warn('Failed searching calendar events for duplicate check:', searchErr);
            }

            // 3. No existing event exists anywhere -> create a new one
            const newEventId = await Calendar.createEventAsync(calendarId, eventDetails);
            eventMap[taskId] = newEventId;
            await this.saveEventMap(eventMap);
            return newEventId;
        } catch (error) {
            console.error('Failed to create/update calendar event for task:', taskId, error);
            return null;
        }
    }

    /**
     * Deletes a calendar event for a task
     */
    static async deleteTaskEvent(taskId: string): Promise<void> {
        try {
            const eventMap = await this.getEventMap();
            const eventId = eventMap[taskId];
            if (eventId) {
                try {
                    await Calendar.deleteEventAsync(eventId);
                } catch (e) {
                    console.log('Calendar event already removed or not found:', eventId);
                }
                delete eventMap[taskId];
                await this.saveEventMap(eventMap);
            }
        } catch (e) {
            console.error('Failed to delete task calendar event:', taskId, e);
        }
    }

    /**
     * Synchronizes all active tasks to the device calendar, deduplicating and cleaning up
     */
    static async syncTasksToCalendar(tasks: Task[], groups: any[] = []): Promise<void> {
        if (this.isSyncing) {
            return;
        }
        this.isSyncing = true;

        try {
            const hasPermission = await this.checkPermission();
            if (!hasPermission) return;

            const calendarId = await this.getOrCreateTaskifyCalendar();
            if (!calendarId) return;

            // Flatten personal and group tasks
            const allTasks: any[] = [...tasks];
            for (const group of groups) {
                if (group.tasks) {
                    for (const gTask of group.tasks) {
                        allTasks.push({
                            ...gTask,
                            groupName: group.name,
                            dueDate: gTask.duedate || gTask.dueDate,
                            title: gTask.task || gTask.title,
                        });
                    }
                }
            }

            const activeTaskIds = new Set<string>();
            const eventMap = await this.getEventMap();

            for (const task of allTasks) {
                const taskId = task._id || task.taskId || task.id;
                if (!taskId) continue;

                if (!task.completed) {
                    activeTaskIds.add(taskId);
                    const eventId = await this.createOrUpdateTaskEvent(task);
                    if (eventId) {
                        eventMap[taskId] = eventId;
                    }
                } else if (eventMap[taskId]) {
                    try {
                        await Calendar.deleteEventAsync(eventMap[taskId]);
                    } catch {}
                    delete eventMap[taskId];
                }
            }

            // Clean up calendar events for tasks that were deleted entirely
            for (const [taskId, eventId] of Object.entries(eventMap)) {
                if (!activeTaskIds.has(taskId)) {
                    try {
                        await Calendar.deleteEventAsync(eventId);
                    } catch {}
                    delete eventMap[taskId];
                }
            }
            await this.saveEventMap(eventMap);
        } finally {
            this.isSyncing = false;
        }
    }
}
