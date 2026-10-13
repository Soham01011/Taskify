/**
 * Parses time string (e.g., '17:00', '5 PM', '5:00 PM', '5:30 PM', '9 AM') into hours and minutes.
 * @param {string} timeStr 
 * @returns {{ hours: number, minutes: number }}
 */
function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return { hours: 0, minutes: 0 };
    }
    const str = timeStr.trim().toUpperCase();
    const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
    if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
        const ampm = ampmMatch[3];
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
    }
    const parts = str.split(':').map(Number);
    if (!isNaN(parts[0])) {
        return { hours: parts[0], minutes: parts[1] || 0 };
    }
    return { hours: 0, minutes: 0 };
}

/**
 * Generates an array of Date objects for each day between startDate and endDate (inclusive)
 * with the specified time applied.
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @param {string} [timeStr] 
 * @returns {Date[]}
 */
function generateScheduleDates(startDate, endDate, timeStr) {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid startDate or endDate');
    }

    const startMidnight = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endMidnight = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

    if (endMidnight < startMidnight) {
        throw new Error('endDate cannot be before startDate');
    }

    let hours = 0;
    let minutes = 0;
    if (timeStr) {
        const parsed = parseTime(timeStr);
        hours = parsed.hours;
        minutes = parsed.minutes;
    } else {
        hours = start.getUTCHours();
        minutes = start.getUTCMinutes();
    }

    const dates = [];
    let current = startMidnight;
    while (current <= endMidnight) {
        const d = new Date(current);
        d.setUTCHours(hours, minutes, 0, 0);
        dates.push(d);
        current += 86400000; // Next calendar day
    }

    return dates;
}

/**
 * Calculates the next due date based on recurrence rules.
 * @param {Date} currentDueDate - The current due date of the task.
 * @param {Object} recurrence - Recurrence settings { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay, startDate, endDate, time }.
 * @returns {Date} The next due date.
 */
function calculateNextDueDate(currentDueDate, recurrence) {
    if (!recurrence || recurrence.frequency === 'none') {
        return null;
    }

    let nextDate = new Date(currentDueDate);
    const { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay, time } = recurrence;

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
        case 'schedule':
        case 'scheduled':
            // Schedule tasks are all created upfront; completing an occurrence does not create extras.
            return null;
    }

    // Apply time of day if specified (HH:mm or 12h format)
    const activeTime = time || timeOfDay;
    if (activeTime) {
        const { hours, minutes } = parseTime(activeTime);
        nextDate.setUTCHours(hours, minutes, 0, 0);
    }

    return nextDate;
}

/**
 * Calculates the initial due date based on recurrence rules.
 * @param {Object} recurrence - Recurrence settings { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay, startDate, endDate, time }.
 * @returns {Date} The initial due date.
 */
function calculateInitialDueDate(recurrence) {
    if (!recurrence || recurrence.frequency === 'none') {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
    }

    let now = new Date();
    let initialDate = new Date(now);
    const { frequency, daysOfWeek, dayOfMonth, lastWeekend, timeOfDay, startDate, time } = recurrence;

    // Set time first if specified
    const activeTime = time || timeOfDay;
    if (activeTime) {
        const { hours, minutes } = parseTime(activeTime);
        initialDate.setUTCHours(hours, minutes, 0, 0);
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

        case 'schedule':
        case 'scheduled':
            if (startDate) {
                initialDate = new Date(startDate);
            }
            if (activeTime) {
                const { hours, minutes } = parseTime(activeTime);
                initialDate.setUTCHours(hours, minutes, 0, 0);
            }
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
    parseTime,
    generateScheduleDates,
    calculateNextDueDate,
    calculateInitialDueDate
};

