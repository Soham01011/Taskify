import { Task } from '../api/tasks';

export const getTasksForDate = (date: Date, tasks: Task[]): Task[] => {
    const targetDateStr = date.toISOString().split('T')[0];
    const targetTime = date.getTime();

    return tasks.filter(task => {
        if (!task.dueDate) return false;
        
        const taskDate = new Date(task.dueDate);
        const taskDateStr = taskDate.toISOString().split('T')[0];

        // 1. Exact match
        if (taskDateStr === targetDateStr) return true;

        // 2. Check recurrence
        if (task.recurrence && task.recurrence.frequency !== 'none') {
            const startDate = new Date(task.dueDate);
            // Ignore if target date is before the start date
            if (date < new Date(startDate.toISOString().split('T')[0])) return false;

            // Check end date if exists
            if (task.recurrence.endDate) {
                const endDate = new Date(task.recurrence.endDate);
                if (date > endDate) return false;
            }

            const interval = task.recurrence.interval || 1;

            if (task.recurrence.frequency === 'daily') {
                const diffTime = Math.abs(date.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return diffDays % interval === 0;
            }

            if (task.recurrence.frequency === 'weekly') {
                const diffTime = Math.abs(date.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays % 7 === 0) {
                    const diffWeeks = diffDays / 7;
                    return diffWeeks % interval === 0;
                }
                return false;
            }

            if (task.recurrence.frequency === 'monthly') {
                if (date.getDate() === startDate.getDate()) {
                    const diffMonths = (date.getFullYear() - startDate.getFullYear()) * 12 + (date.getMonth() - startDate.getMonth());
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
