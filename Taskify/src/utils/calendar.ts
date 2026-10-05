import { Task } from '../api/tasks';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to get a Date object at midnight local time
const getLocalMidnight = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getTasksForDate = (date: Date, tasks: Task[]): Task[] => {
    const targetDateStr = getLocalDateString(date);
    const targetDateOnly = getLocalMidnight(date);
    const targetDayOfWeek = date.getDay(); // 0 = Sunday … 6 = Saturday

    const result: Task[] = [];

    for (const task of tasks) {
        if (!task.dueDate) continue;

        const taskDate = new Date(task.dueDate);
        const taskDateStr = getLocalDateString(taskDate);
        const isRecurring = !!(task.recurrence && task.recurrence.frequency && task.recurrence.frequency !== 'none');

        // 1. Exact date match (non-recurring task)
        if (taskDateStr === targetDateStr && !isRecurring) {
            result.push(task);
            continue;
        }

        // 2. Check recurrence (or exact match for recurring task)
        if (isRecurring) {
            const startDateOnly = getLocalMidnight(new Date(task.dueDate));

            // Ignore if target date is before the start date
            if (targetDateOnly < startDateOnly) continue;

            // Check end date if exists
            if ((task.recurrence as any).endDate) {
                const endDateOnly = getLocalMidnight(new Date((task.recurrence as any).endDate));
                if (targetDateOnly > endDateOnly) continue;
            }

            let matches = false;

            if (taskDateStr === targetDateStr) {
                matches = true;
            } else {
                const interval = (task.recurrence as any).interval || 1;
                const diffMs = targetDateOnly.getTime() - startDateOnly.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

                switch (task.recurrence!.frequency) {
                    case 'daily':
                        matches = diffDays % interval === 0;
                        break;

                    case 'weekly': {
                        const daysOfWeek: number[] = task.recurrence!.daysOfWeek || [];
                        if (daysOfWeek.length > 0) {
                            // Show on every specified day of the week
                            matches = daysOfWeek.includes(targetDayOfWeek);
                        } else {
                            // No daysOfWeek specified: show every N weeks from start
                            const diffWeeks = diffDays / 7;
                            matches = diffDays % 7 === 0 && diffWeeks % interval === 0;
                        }
                        break;
                    }

                    case 'monthly': {
                        const startDay = startDateOnly.getDate();
                        if (targetDateOnly.getDate() === startDay) {
                            const diffMonths =
                                (targetDateOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
                                (targetDateOnly.getMonth() - startDateOnly.getMonth());
                            matches = diffMonths % interval === 0 && diffMonths >= 0;
                        }
                        break;
                    }

                    case 'six-months': {
                        if (targetDateOnly.getDate() === startDateOnly.getDate()) {
                            const diffMonths =
                                (targetDateOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
                                (targetDateOnly.getMonth() - startDateOnly.getMonth());
                            matches = diffMonths % 6 === 0 && diffMonths >= 0;
                        }
                        break;
                    }

                    case 'annually': {
                        matches = (
                            targetDateOnly.getMonth() === startDateOnly.getMonth() &&
                            targetDateOnly.getDate() === startDateOnly.getDate()
                        );
                        break;
                    }

                    default:
                        matches = false;
                }
            }

            if (matches) {
                // Adjust dueDate for this specific date occurrence so downstream components (like TaskCard)
                // evaluate overdue status against the target occurrence date rather than the original creation timestamp.
                const originalDueDate = new Date(task.dueDate);
                const instanceDueDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    originalDueDate.getHours(),
                    originalDueDate.getMinutes(),
                    originalDueDate.getSeconds(),
                    originalDueDate.getMilliseconds()
                );

                result.push({
                    ...task,
                    dueDate: instanceDueDate.toISOString(),
                });
            }
        }
    }

    return result;
};

export const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
};
