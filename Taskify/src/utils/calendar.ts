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

    return tasks.filter(task => {
        if (!task.dueDate) return false;

        const taskDate = new Date(task.dueDate);
        const taskDateStr = getLocalDateString(taskDate);

        // 1. Exact date match (includes non-recurring tasks)
        if (taskDateStr === targetDateStr) return true;

        // 2. Check recurrence
        if (task.recurrence && task.recurrence.frequency !== 'none') {
            const startDateOnly = getLocalMidnight(new Date(task.dueDate));

            // Ignore if target date is before the start date
            if (targetDateOnly < startDateOnly) return false;

            // Check end date if exists
            if ((task.recurrence as any).endDate) {
                const endDateOnly = getLocalMidnight(new Date((task.recurrence as any).endDate));
                if (targetDateOnly > endDateOnly) return false;
            }

            const interval = (task.recurrence as any).interval || 1;
            const diffMs = targetDateOnly.getTime() - startDateOnly.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            switch (task.recurrence.frequency) {
                case 'daily':
                    return diffDays % interval === 0;

                case 'weekly': {
                    const daysOfWeek: number[] = task.recurrence.daysOfWeek || [];
                    if (daysOfWeek.length > 0) {
                        // Show on every specified day of the week
                        return daysOfWeek.includes(targetDayOfWeek);
                    }
                    // No daysOfWeek specified: show every N weeks from start
                    const diffWeeks = diffDays / 7;
                    return diffDays % 7 === 0 && diffWeeks % interval === 0;
                }

                case 'monthly': {
                    const startDay = startDateOnly.getDate();
                    if (targetDateOnly.getDate() !== startDay) return false;
                    const diffMonths =
                        (targetDateOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
                        (targetDateOnly.getMonth() - startDateOnly.getMonth());
                    return diffMonths % interval === 0 && diffMonths >= 0;
                }

                case 'six-months': {
                    if (targetDateOnly.getDate() !== startDateOnly.getDate()) return false;
                    const diffMonths =
                        (targetDateOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
                        (targetDateOnly.getMonth() - startDateOnly.getMonth());
                    return diffMonths % 6 === 0 && diffMonths >= 0;
                }

                case 'annually': {
                    return (
                        targetDateOnly.getMonth() === startDateOnly.getMonth() &&
                        targetDateOnly.getDate() === startDateOnly.getDate()
                    );
                }

                default:
                    return false;
            }
        }

        return false;
    });
};

export const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
};
