import { format, getDaysInMonth, startOfMonth, getDay, eachWeekOfInterval, endOfMonth, parseISO } from 'date-fns';

// Get the number of days in a given month
export const getDaysArray = (year, month) => {
    const count = getDaysInMonth(new Date(year, month - 1));
    return Array.from({ length: count }, (_, i) => i + 1);
};

// Format month key
export const getMonthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

// Calculate habit completion stats for a month
export const calcHabitStats = (trackingData, habitId, year, month) => {
    const days = getDaysArray(year, month);
    const habitDays = trackingData?.habits?.[habitId] || {};
    const completedDays = days.filter(d => habitDays[String(d).padStart(2, '0')] === true);
    return {
        completed: completedDays.length,
        total: days.length,
    };
};

// Calculate daily progress (percentage of habits done per day)
export const calcDailyProgress = (trackingData, habits, year, month) => {
    const days = getDaysArray(year, month);
    return days.map(d => {
        const dayStr = String(d).padStart(2, '0');
        if (!habits.length) return { day: d, percent: 0 };
        const done = habits.filter(h => trackingData?.habits?.[h.id]?.[dayStr] === true).length;
        return { day: d, percent: Math.round((done / habits.length) * 100) };
    });
};

// Group days into weeks and sum progress
export const calcWeeklyProgress = (trackingData, habits, year, month) => {
    const days = getDaysArray(year, month);
    const weeks = [];
    let current = [];
    days.forEach(d => {
        current.push(d);
        if (current.length === 7 || d === days[days.length - 1]) {
            const weekDone = current.reduce((acc, day) => {
                const dayStr = String(day).padStart(2, '0');
                const done = habits.filter(h => trackingData?.habits?.[h.id]?.[dayStr] === true).length;
                return acc + done;
            }, 0);
            const weekMax = current.length * habits.length;
            weeks.push({
                label: `W${weeks.length + 1}`,
                start: current[0],
                end: current[current.length - 1],
                percent: weekMax > 0 ? Math.round((weekDone / weekMax) * 100) : 0,
                done: weekDone,
                max: weekMax,
            });
            current = [];
        }
    });
    return weeks;
};

// Calculate overall monthly stats
export const calcOverallStats = (trackingData, habits, year, month) => {
    const totalGoal = habits.reduce((acc, h) => acc + (h.monthlyGoal || 0), 0);
    let totalCompleted = 0;
    habits.forEach(h => {
        const { completed } = calcHabitStats(trackingData, h.id, year, month);
        totalCompleted += completed;
    });
    return {
        goal: totalGoal,
        completed: totalCompleted,
        left: Math.max(0, totalGoal - totalCompleted),
        percent: totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0,
    };
};

// Mental state chart data
export const getMentalChartData = (trackingData, year, month) => {
    const days = getDaysArray(year, month);
    return days.map(d => {
        const dayStr = String(d).padStart(2, '0');
        const ms = trackingData?.mentalState?.[dayStr] || {};
        return {
            day: d,
            mood: ms.mood || null,
            motivation: ms.motivation || null,
        };
    });
};

export const getWeekLabel = (day) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day % 7];
};
