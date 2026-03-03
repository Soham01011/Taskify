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
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
            break;
        case 'weekly':
            if (daysOfWeek && daysOfWeek.length > 0) {
                // Find next occurance in daysOfWeek
                let currentDay = nextDate.getUTCDay();
                let daysToWait = 1;
                while (daysToWait <= 7) {
                    let nextDay = (currentDay + daysToWait) % 7;
                    if (daysOfWeek.includes(nextDay)) {
                        break;
                    }
                    daysToWait++;
                }
                nextDate.setUTCDate(nextDate.getUTCDate() + daysToWait);
            } else {
                nextDate.setUTCDate(nextDate.getUTCDate() + 7);
            }
            break;
        case 'monthly':
            if (lastWeekend) {
                // Set to next month and find last weekend day
                nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
                nextDate = getLastWeekendOfSameMonth(nextDate);
            } else if (dayOfMonth) {
                nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
                // Handle months with fewer days
                const targetDay = dayOfMonth;
                nextDate.setUTCDate(1); 
                const daysInMonth = new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 0)).getUTCDate();
                nextDate.setUTCDate(Math.min(targetDay, daysInMonth));
            } else {
                nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
            }
            break;
        case 'six-months':
            nextDate.setUTCMonth(nextDate.getUTCMonth() + 6);
            break;
        case 'annually':
            nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
            break;
    }

    // Apply time of day if specified (HH:mm)
    if (timeOfDay && timeOfDay.includes(':')) {
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            nextDate.setUTCHours(hours, minutes, 0, 0);
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
            initialDate.setUTCHours(hours, minutes, 0, 0);
        }
    }

    switch (frequency) {
        case 'daily':
            // If the specified time has already passed today, set to tomorrow
            if (initialDate <= now) {
                initialDate.setUTCDate(initialDate.getUTCDate() + 1);
            }
            break;

        case 'weekly':
            if (daysOfWeek && daysOfWeek.length > 0) {
                // Find nearest occurance in daysOfWeek (could be today)
                let currentDay = initialDate.getUTCDay();
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
                initialDate.setUTCDate(initialDate.getUTCDate() + daysToWait);
            } else if (initialDate <= now) {
                initialDate.setUTCDate(initialDate.getUTCDate() + 7);
            }
            break;

        case 'monthly':
            if (lastWeekend) {
                initialDate = getLastWeekendOfSameMonth(initialDate);
                // If the last weekend of this month has already passed, set to next month's
                if (initialDate <= now) {
                   initialDate.setUTCMonth(initialDate.getUTCMonth() + 1);
                   initialDate = getLastWeekendOfSameMonth(initialDate);
                }
            } else if (dayOfMonth) {
                // Handle months with fewer days
                const targetDay = dayOfMonth;
                const daysInMonth = new Date(Date.UTC(initialDate.getUTCFullYear(), initialDate.getUTCMonth() + 1, 0)).getUTCDate();
                initialDate.setUTCDate(Math.min(targetDay, daysInMonth));
                
                // If it already passed this month, move to next
                if (initialDate <= now) {
                    initialDate.setUTCMonth(initialDate.getUTCMonth() + 1);
                    const daysInNextMonth = new Date(Date.UTC(initialDate.getUTCFullYear(), initialDate.getUTCMonth() + 1, 0)).getUTCDate();
                    initialDate.setUTCDate(Math.min(targetDay, daysInNextMonth));
                }
            } else if (initialDate <= now) {
                initialDate.setUTCMonth(initialDate.getUTCMonth() + 1);
            }
            break;
            
        case 'six-months':
            if (initialDate <= now) initialDate.setUTCMonth(initialDate.getUTCMonth() + 6);
            break;
            
        case 'annually':
            if (initialDate <= now) initialDate.setUTCFullYear(initialDate.getUTCFullYear() + 1);
            break;
    }

    return initialDate;
}

function getLastWeekendOfSameMonth(date) {
    let lastDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
    // Ensure we keep the hour/min/sec from the original date
    lastDate.setUTCHours(date.getUTCHours(), date.getUTCMinutes(), 0, 0);
    
    let day = lastDate.getUTCDay(); // 0: Sun, 1: Mon... 6: Sat
    if (day === 0 || day === 6) {
        return lastDate;
    }
    // If it's Monday-Friday, go back to the nearest Sunday
    lastDate.setUTCDate(lastDate.getUTCDate() - day);
    return lastDate;
}

module.exports = {
    calculateNextDueDate,
    calculateInitialDueDate
};
