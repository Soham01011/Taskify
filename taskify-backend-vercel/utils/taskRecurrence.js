/**
 * Calculates the next due date based on recurrence rules.
 * @param {Date} currentDueDate - The current due date of the task.
 * @param {Object} recurrence - Recurrence settings { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay }.
 * @returns {Date} The next due date.
 */
function calculateNextDueDate(currentDueDate, recurrence) {
    if (!recurrence || recurrence.frequency === 'none') {
        return null;
    }

    let nextDate = new Date(currentDueDate);
    const { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay } = recurrence;

    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            if (daysOfWeek && daysOfWeek.length > 0) {
                // Find next occurance in daysOfWeek
                let currentDay = nextDate.getDay();
                let daysToWait = 1;
                while (daysToWait <= 7) {
                    let nextDay = (currentDay + daysToWait) % 7;
                    if (daysOfWeek.includes(nextDay)) {
                        break;
                    }
                    daysToWait++;
                }
                nextDate.setDate(nextDate.getDate() + daysToWait);
            } else {
                nextDate.setDate(nextDate.getDate() + 7);
            }
            break;
        case 'monthly':
            if (lastWeekend) {
                // Set to next month and find last weekend day
                nextDate.setMonth(nextDate.getMonth() + 1);
                nextDate = getLastWeekendOfSameMonth(nextDate);
            } else if (dayOfMonth) {
                nextDate.setMonth(nextDate.getMonth() + 1);
                // Handle months with fewer days
                const targetDay = dayOfMonth;
                nextDate.setDate(1); 
                const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                nextDate.setDate(Math.min(targetDay, daysInMonth));
            } else {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            break;
        case 'six-months':
            nextDate.setMonth(nextDate.getMonth() + 6);
            break;
        case 'annually':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }

    // Apply time of day if specified (HH:mm)
    if (timeOfDay && timeOfDay.includes(':')) {
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            nextDate.setHours(hours, minutes, 0, 0);
        }
    }

    return nextDate;
}

/**
 * Calculates the initial due date based on recurrence rules.
 * @param {Object} recurrence - Recurrence settings { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay }.
 * @returns {Date} The initial due date.
 */
function calculateInitialDueDate(recurrence) {
    if (!recurrence || recurrence.frequency === 'none') {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
    }

    let now = new Date();
    let initialDate = new Date(now);
    const { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay } = recurrence;

    // Set time first if specified
    if (timeOfDay && timeOfDay.includes(':')) {
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            initialDate.setHours(hours, minutes, 0, 0);
        }
    }

    switch (frequency) {
        case 'daily':
            // If the specified time has already passed today, set to tomorrow
            if (initialDate <= now) {
                initialDate.setDate(initialDate.getDate() + 1);
            }
            break;

        case 'weekly':
            if (daysOfWeek && daysOfWeek.length > 0) {
                // Find nearest occurance in daysOfWeek (could be today)
                let currentDay = initialDate.getDay();
                let daysToWait = 0;
                while (daysToWait < 7) {
                    let nextDay = (currentDay + daysToWait) % 7;
                    if (daysOfWeek.includes(nextDay)) {
                        // If it's today but time passed, skip to next week's occurrence
                        if (daysToWait === 0 && initialDate <= now) {
                            daysToWait = 1;
                            continue;
                        }
                        break;
                    }
                    daysToWait++;
                }
                initialDate.setDate(initialDate.getDate() + daysToWait);
            } else if (initialDate <= now) {
                initialDate.setDate(initialDate.getDate() + 7);
            }
            break;

        case 'monthly':
            if (lastWeekend) {
                initialDate = getLastWeekendOfSameMonth(initialDate);
                // If the last weekend of this month has already passed, set to next month's
                if (initialDate <= now) {
                   initialDate.setMonth(initialDate.getMonth() + 1);
                   initialDate = getLastWeekendOfSameMonth(initialDate);
                }
            } else if (dayOfMonth) {
                // Handle months with fewer days
                const targetDay = dayOfMonth;
                const daysInMonth = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0).getDate();
                initialDate.setDate(Math.min(targetDay, daysInMonth));
                
                // If it already passed this month, move to next
                if (initialDate <= now) {
                    initialDate.setMonth(initialDate.getMonth() + 1);
                    const daysInNextMonth = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0).getDate();
                    initialDate.setDate(Math.min(targetDay, daysInNextMonth));
                }
            } else if (initialDate <= now) {
                initialDate.setMonth(initialDate.getMonth() + 1);
            }
            break;
            
        case 'six-months':
            if (initialDate <= now) initialDate.setMonth(initialDate.getMonth() + 6);
            break;
            
        case 'annually':
            if (initialDate <= now) initialDate.setFullYear(initialDate.getFullYear() + 1);
            break;
    }

    return initialDate;
}

function getLastWeekendOfSameMonth(date) {
    let lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    // Ensure we keep the hour/min/sec from the original date
    lastDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    
    let day = lastDate.getDay(); // 0: Sun, 1: Mon... 6: Sat
    if (day === 0 || day === 6) {
        return lastDate;
    }
    // If it's Monday-Friday, go back to the nearest Sunday
    lastDate.setDate(lastDate.getDate() - day);
    return lastDate;
}

module.exports = {
    calculateNextDueDate,
    calculateInitialDueDate
};
