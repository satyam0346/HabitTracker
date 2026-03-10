// Guest mode data management using localStorage
const STORAGE_KEY = 'habit_tracker_guest';

const loadData = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { habits: [], tracking: {} };
    } catch {
        return { habits: [], tracking: {} };
    }
};

const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const guestGetHabits = () => loadData().habits;
export const guestSaveHabits = (habits) => {
    const d = loadData();
    d.habits = habits;
    saveData(d);
};

export const guestGetMonthData = (monthKey) => {
    const d = loadData();
    return d.tracking[monthKey] || { month: monthKey, habits: {}, mentalState: {} };
};

export const guestToggleDay = (monthKey, habitId, day, currentValue) => {
    const d = loadData();
    if (!d.tracking[monthKey]) {
        d.tracking[monthKey] = { month: monthKey, habits: {}, mentalState: {} };
    }
    const dayStr = String(day).padStart(2, '0');
    if (!d.tracking[monthKey].habits[habitId]) {
        d.tracking[monthKey].habits[habitId] = {};
    }
    d.tracking[monthKey].habits[habitId][dayStr] = !currentValue;
    saveData(d);
    return d.tracking[monthKey];
};

export const guestUpdateMentalState = (monthKey, day, field, value) => {
    const d = loadData();
    if (!d.tracking[monthKey]) {
        d.tracking[monthKey] = { month: monthKey, habits: {}, mentalState: {} };
    }
    const dayStr = String(day).padStart(2, '0');
    if (!d.tracking[monthKey].mentalState[dayStr]) {
        d.tracking[monthKey].mentalState[dayStr] = {};
    }
    d.tracking[monthKey].mentalState[dayStr][field] = value;
    saveData(d);
    return d.tracking[monthKey];
};
