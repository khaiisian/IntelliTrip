// scheduling.service.js

const { calculateTravelMinutes } = require('../utils/travelTime');
const { addMinutes, formatTime, parseTime } = require('../utils/time');

/**
 * Validate that required parameters exist
 */
function validateInputs(schedule, systemConfig, tripDays) {
    if (!schedule) throw new Error('Schedule is required');
    if (!systemConfig) throw new Error('System configuration is required');
    if (!tripDays || tripDays < 1) throw new Error('Valid trip days required');

    if (!schedule.day_start_time) throw new Error('Day start time is required');
    if (!schedule.day_end_time) throw new Error('Day end time is required');
}

/**
 * Check if attraction can be visited at given time
 */
function canVisitAttraction(attraction, arrivalTime) {
    const openTime = parseTime(attraction.open_time);
    const closeTime = parseTime(attraction.close_time);
    const visitEnd = addMinutes(arrivalTime, attraction.duration_minutes);

    const withinOpen = arrivalTime >= openTime && arrivalTime <= closeTime;
    const finishesBeforeClose = visitEnd <= closeTime;

    return withinOpen && finishesBeforeClose;
}

/**
 * Try to schedule a single attraction
 * @returns {Object|null} Scheduled item or null if can't schedule
 */
function tryScheduleAttraction(attraction, currentTime, dayStart, dayEnd, systemConfig) {
    console.log(`\n--- TRYING ${attraction.attraction_name} ---`);

    const travelMinutes = calculateTravelMinutes(
        attraction.distance_from_previous,
        systemConfig.travel_speed_kmh
    );
    console.log(`travelMinutes: ${travelMinutes}`);

    let arrivalTime = addMinutes(currentTime, travelMinutes);
    console.log(`arrivalTime: ${arrivalTime.toISOString()}`);

    // Get open/close times - they could be Date objects or strings
    let openHour, openMinute, closeHour, closeMinute;

    // Handle open_time
    if (attraction.open_time instanceof Date) {
        console.log('open_time is Date object');
        openHour = attraction.open_time.getUTCHours();
        openMinute = attraction.open_time.getUTCMinutes();
    } else {
        console.log('open_time is string');
        const [hour, minute] = attraction.open_time.split(':').map(Number);
        openHour = hour;
        openMinute = minute;
    }

    // Handle close_time
    if (attraction.close_time instanceof Date) {
        console.log('close_time is Date object');
        closeHour = attraction.close_time.getUTCHours();
        closeMinute = attraction.close_time.getUTCMinutes();
    } else {
        console.log('close_time is string');
        const [hour, minute] = attraction.close_time.split(':').map(Number);
        closeHour = hour;
        closeMinute = minute;
    }

    console.log(`openTime: ${openHour}:${openMinute}, closeTime: ${closeHour}:${closeMinute}`);

    // Create Date objects for open/close on the SAME DAY as arrival
    const openTime = new Date(arrivalTime);
    openTime.setUTCHours(openHour, openMinute, 0, 0);

    const closeTime = new Date(arrivalTime);
    closeTime.setUTCHours(closeHour, closeMinute, 0, 0);

    console.log(`openTime on visit day: ${openTime.toISOString()}`);
    console.log(`closeTime on visit day: ${closeTime.toISOString()}`);

    // Wait until attraction opens if arriving early
    if (arrivalTime < openTime) {
        console.log(`Arriving before open, waiting until ${openTime.toISOString()}`);
        arrivalTime = openTime;
    }

    const visitStart = new Date(arrivalTime);
    const visitEnd = addMinutes(visitStart, attraction.duration_minutes);
    console.log(`visitStart: ${visitStart.toISOString()}`);
    console.log(`visitEnd: ${visitEnd.toISOString()}`);
    console.log(`duration: ${attraction.duration_minutes} minutes`);

    // Check if attraction is open during visit
    const withinOpen = arrivalTime >= openTime && arrivalTime <= closeTime;
    const finishesBeforeClose = visitEnd <= closeTime;

    console.log(`withinOpen? ${withinOpen} (${arrivalTime.toISOString()} between ${openTime.toISOString()} and ${closeTime.toISOString()})`);
    console.log(`finishesBeforeClose? ${finishesBeforeClose} (${visitEnd.toISOString()} <= ${closeTime.toISOString()})`);

    if (!withinOpen || !finishesBeforeClose) {
        console.log(`❌ FAILED: Attraction closed during visit`);
        return null;
    }

    // Check if visit fits within day
    const withinDay = visitEnd <= dayEnd;
    console.log(`withinDay? ${withinDay} (${visitEnd.toISOString()} <= ${dayEnd.toISOString()})`);

    if (!withinDay) {
        console.log(`❌ FAILED: Exceeds day end by ${(visitEnd - dayEnd) / 60000} minutes`);
        return null;
    }

    console.log(`✅ SUCCESS! Can visit`);
    return {
        attraction,
        visitStart,
        visitEnd,
        travelMinutes
    };
}

/**
 * Main scheduling function
 */
exports.scheduleRoute = (route, schedule, systemConfig, tripDays, tripStartDate) => {
    // Validate inputs
    validateInputs(schedule, systemConfig, tripDays);
    if (!tripStartDate) throw new Error('Trip start date is required');

    const results = [];
    let currentDay = 1;

    // Parse the trip start date
    const tripStart = new Date(tripStartDate);
    console.log(`Trip starts on: ${tripStart.toISOString()}`);

    // Parse day boundaries (just the time portions)
    const dayStartTime = parseTime(schedule.day_start_time);
    const dayEndTime = parseTime(schedule.day_end_time);

    // Function to get actual DateTime for a specific day
    const getDayStart = (day) => {
        // Create date in UTC
        const date = new Date(Date.UTC(
            tripStart.getUTCFullYear(),
            tripStart.getUTCMonth(),
            tripStart.getUTCDate() + (day - 1),
            dayStartTime.getUTCHours(),
            dayStartTime.getUTCMinutes(),
            0,
            0
        ));
        return date;
    };

    const getDayEnd = (day) => {
        // Create date in UTC
        const date = new Date(Date.UTC(
            tripStart.getUTCFullYear(),
            tripStart.getUTCMonth(),
            tripStart.getUTCDate() + (day - 1),
            dayEndTime.getUTCHours(),
            dayEndTime.getUTCMinutes(),
            0,
            0
        ));
        return date;
    };

    // Start at beginning of day 1
    let currentTime = getDayStart(1);
    console.log(`Day 1 starts at: ${currentTime.toISOString()}`);

    for (const attraction of route) {
        if (currentDay > tripDays) {
            console.log(`Reached max days (${tripDays}), stopping schedule`);
            break;
        }

        // Get boundaries for CURRENT day
        const currentDayStart = getDayStart(currentDay);
        const currentDayEnd = getDayEnd(currentDay);

        console.log(`\nTesting: Scheduling attraction ${attraction.attraction_name} in day ${currentDay}`);
        console.log(`Testing Current time: ${currentTime.toISOString()}`);
        console.log(`Testing Day ${currentDay} ends at: ${currentDayEnd.toISOString()}`);

        // Try to schedule in current day
        let scheduled = tryScheduleAttraction(
            attraction,
            currentTime,
            currentDayStart,
            currentDayEnd,
            systemConfig
        );

        console.log(`\nTesting Result: ${scheduled}`)

        // If can't schedule in current day, try next day(s)
        let daysTried = 0;
        while (!scheduled) {
            daysTried++;
            const targetDay = currentDay + daysTried;

            if (targetDay > tripDays) {
                console.log(`No more days available (trip has ${tripDays} days)`);
                break;
            }

            console.log(`Attraction doesn't fit in day ${currentDay}, trying day ${targetDay}`);

            // Get boundaries for TARGET day
            const targetDayStart = getDayStart(targetDay);
            const targetDayEnd = getDayEnd(targetDay);

            console.log(`Day ${targetDay} starts at: ${targetDayStart.toISOString()}`);
            console.log(`Day ${targetDay} ends at: ${targetDayEnd.toISOString()}`);

            scheduled = tryScheduleAttraction(
                attraction,
                targetDayStart,
                targetDayStart,
                targetDayEnd,
                systemConfig
            );

            if (scheduled) {
                currentDay = targetDay;
                currentTime = getDayStart(currentDay);
                console.log(`✓ Scheduled in day ${currentDay}`);
            }
        }

        // If still can't schedule after trying all days, skip this attraction
        if (!scheduled) {
            console.log(`✗ Could not schedule attraction ${attraction.attraction_name} in any day`);
            continue;
        }

        // Add to results
        results.push({
            day_number: currentDay,
            attraction_id: attraction.attraction_id,
            attraction_name: attraction.attraction_name,
            visit_start_time: formatTime(scheduled.visitStart),
            visit_end_time: formatTime(scheduled.visitEnd),
            distance_from_previous: attraction.distance_from_previous,
            travel_minutes: scheduled.travelMinutes,
            final_score: attraction.experience_score,
            is_best_time: attraction.is_best_time || false
        });

        console.log(`Added: Day ${currentDay} ${attraction.attraction_name} ${formatTime(scheduled.visitStart)}-${formatTime(scheduled.visitEnd)}`);

        // Update current time for next attraction (add break)
        currentTime = addMinutes(scheduled.visitEnd, systemConfig.break_minutes);
    }

    // Log summary
    const daysUsed = [...new Set(results.map(r => r.day_number))];
    console.log(`\n=== SCHEDULING SUMMARY ===`);
    console.log(`Scheduled ${results.length} attractions across days ${daysUsed.join(', ')}`);

    // Group by day for easy reading
    const byDay = results.reduce((acc, item) => {
        if (!acc[item.day_number]) acc[item.day_number] = [];
        acc[item.day_number].push(item);
        return acc;
    }, {});

    Object.keys(byDay).sort().forEach(day => {
        console.log(`Day ${day}: ${byDay[day].length} attractions`);
    });

    return results;
};

/**
 * Get schedule statistics
 */
exports.getScheduleStats = (scheduledItems) => {
    const days = {};

    for (const item of scheduledItems) {
        if (!days[item.day_number]) {
            days[item.day_number] = {
                day: item.day_number,
                attractions: [],
                total_visit_time: 0,
                total_travel_time: 0
            };
        }

        days[item.day_number].attractions.push(item);
        days[item.day_number].total_visit_time += 30; // You'd calculate actual times
        days[item.day_number].total_travel_time += item.travel_minutes || 0;
    }

    return Object.values(days);
};