import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUnifiedTasks } from '../store/slices/taskSlice';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getShortDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const useAnalytics = () => {
    const rawTasks = useSelector(selectUnifiedTasks);
    const tasks = rawTasks || [];

    return useMemo(() => {
        const now = new Date();
        const todayStr = getLocalDateString(now);
        
        // --- 1. Quick Stats ---
        const totalCompleted = tasks.filter((t: any) => t.completed).length;

        // Calculate Late Completions
        const lateCompleted = tasks.filter((t: any) => {
            if (!t.completed || !t.dueDate || !t.updated_at) return false;
            const dueTime = new Date(t.dueDate).getTime();
            const updateTime = new Date(t.updated_at).getTime();
            // late if completed more than 30 minutes after due date
            return (updateTime - dueTime) > 30 * 60 * 1000;
        }).length;

        // Calculate Current Streak (consecutive days with at least 1 completed task)
        let currentStreak = 0;
        let checkDate = new Date(now);
        while (true) {
            const dateStr = getLocalDateString(checkDate);
            const hasCompletedThatDay = tasks.some((t: any) => 
                t.completed && t.dueDate && getLocalDateString(new Date(t.dueDate)) === dateStr
            );
            if (hasCompletedThatDay) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1); // move back 1 day
            } else {
                // If checking today and no completed tasks yet, check yesterday to keep streak alive
                if (currentStreak === 0 && dateStr === todayStr) {
                     checkDate.setDate(checkDate.getDate() - 1);
                     const ydayStr = getLocalDateString(checkDate);
                     const hasCompletedYday = tasks.some((t: any) => 
                         t.completed && t.dueDate && getLocalDateString(new Date(t.dueDate)) === ydayStr
                     );
                     if (hasCompletedYday) {
                         currentStreak++;
                         checkDate.setDate(checkDate.getDate() - 1);
                         continue;
                     }
                }
                break; // streak broken
            }
        }

        // --- 2. Weekly Productivity (Last 7 Days) ---
        const weeklyProductivity = [];
        let completedLast7Days = 0;
        let totalLast7Days = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = getLocalDateString(d);
            const label = i === 0 ? 'Today' : getShortDayName(d);

            const dayTasks = tasks.filter((t: any) => t.dueDate && getLocalDateString(new Date(t.dueDate)) === dateStr);
            const completedTasks = dayTasks.filter((t: any) => t.completed);
            
            const lateCount = completedTasks.filter((t: any) => {
                if (!t.updated_at) return false;
                const dueTime = new Date(t.dueDate).getTime();
                const updateTime = new Date(t.updated_at).getTime();
                return (updateTime - dueTime) > 30 * 60 * 1000;
            }).length;
            
            const onTimeCount = completedTasks.length - lateCount;
            
            totalLast7Days += dayTasks.length;
            completedLast7Days += completedTasks.length;

            weeklyProductivity.push({
                label,
                value: completedTasks.length, // Used for maxValue calculation
                stacks: [
                    { value: onTimeCount, color: i === 0 ? '#00AEEF' : '#00AEEF80' },
                    { value: lateCount, color: '#FF3B30', marginBottom: 2 } // small gap if desired
                ]
            });
        }

        // --- 3. Weekly Score (Completion Rate) ---
        const completionPercentage = totalLast7Days === 0 ? 0 : Math.round((completedLast7Days / totalLast7Days) * 100);

        // --- 4. Upcoming Workload (Next 7 Days) ---
        const upcomingWorkload = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const dateStr = getLocalDateString(d);
            const label = getShortDayName(d);

            const pendingCount = tasks.filter((t: any) => 
                !t.completed && t.dueDate && getLocalDateString(new Date(t.dueDate)) === dateStr
            ).length;

            upcomingWorkload.push({
                label,
                value: pendingCount,
            });
        }

        return {
            stats: {
                totalCompleted,
                currentStreak,
                lateCompleted,
            },
            weeklyProductivity,
            completionRate: {
                percentage: completionPercentage,
                completed: completedLast7Days,
                total: totalLast7Days
            },
            upcomingWorkload,
        };
    }, [tasks]);
};
