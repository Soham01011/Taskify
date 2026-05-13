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

    return tasks.filter(task => {
        if (!task.dueDate) return false;
        
        const taskDate = new Date(task.dueDate);
        const taskDateStr = getLocalDateString(taskDate);

        // 1. Exact match
        if (taskDateStr === targetDateStr) return true;

        // 2. Check recurrence
        if (task.recurrence && task.recurrence.frequency !== 'none') {
            const startDate = new Date(task.dueDate);
            const startDateOnly = getLocalMidnight(startDate);
            
            // Ignore if target date is before the start date
            if (targetDateOnly < startDateOnly) return false;

            // Check end date if exists
            if (task.recurrence.endDate) {
                const endDate = new Date(task.recurrence.endDate);
                const endDateOnly = getLocalMidnight(endDate);
                if (targetDateOnly > endDateOnly) return false;
            }

            const interval = task.recurrence.interval || 1;

            if (task.recurrence.frequency === 'daily') {
                const diffTime = Math.abs(targetDateOnly.getTime() - startDateOnly.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                return diffDays % interval === 0;
            }

            if (task.recurrence.frequency === 'weekly') {
                const diffTime = Math.abs(targetDateOnly.getTime() - startDateOnly.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays % 7 === 0) {
                    const diffWeeks = diffDays / 7;
                    return diffWeeks % interval === 0;
                }
                return false;
            }

            if (task.recurrence.frequency === 'monthly') {
                if (targetDateOnly.getDate() === startDateOnly.getDate()) {
                    const diffMonths = (targetDateOnly.getFullYear() - startDateOnly.getFullYear()) * 12 + (targetDateOnly.getMonth() - startDateOnly.getMonth());
                    return diffMonths % interval === 0 && diffMonths >= 0;
                }
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
