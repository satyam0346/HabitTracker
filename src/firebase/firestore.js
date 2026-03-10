import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Habits CRUD ───────────────────────────────────────────────────────────────

export const addHabit = async (uid, habitData) => {
    const ref = collection(db, 'users', uid, 'habits');
    const snap = await getDocs(ref);
    const order = snap.size;
    const docRef = await addDoc(ref, {
        ...habitData,
        order,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateHabit = async (uid, habitId, data) => {
    const ref = doc(db, 'users', uid, 'habits', habitId);
    await updateDoc(ref, data);
};

export const deleteHabit = async (uid, habitId) => {
    const ref = doc(db, 'users', uid, 'habits', habitId);
    await deleteDoc(ref);
};

export const listenToHabits = (uid, callback) => {
    const ref = collection(db, 'users', uid, 'habits');
    const q = query(ref, orderBy('order', 'asc'));
    return onSnapshot(q, snap => {
        const habits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(habits);
    });
};

// ─── Tracking Data ─────────────────────────────────────────────────────────────

export const getMonthDocRef = (uid, monthKey) =>
    doc(db, 'users', uid, 'tracking_data', monthKey);

export const listenToMonthData = (uid, monthKey, callback) => {
    const ref = getMonthDocRef(uid, monthKey);
    return onSnapshot(ref, snap => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            callback({ month: monthKey, habits: {}, mentalState: {} });
        }
    });
};

export const toggleHabitDay = async (uid, monthKey, habitId, day, currentValue) => {
    const ref = getMonthDocRef(uid, monthKey);
    const snap = await getDoc(ref);

    const dayStr = String(day).padStart(2, '0');
    const fieldPath = `habits.${habitId}.${dayStr}`;

    if (!snap.exists()) {
        await setDoc(ref, {
            month: monthKey,
            habits: { [habitId]: { [dayStr]: !currentValue } },
            mentalState: {},
        });
    } else {
        await updateDoc(ref, { [fieldPath]: !currentValue });
    }
};

export const updateMentalState = async (uid, monthKey, day, field, value) => {
    const ref = getMonthDocRef(uid, monthKey);
    const snap = await getDoc(ref);
    const dayStr = String(day).padStart(2, '0');
    const fieldPath = `mentalState.${dayStr}.${field}`;

    if (!snap.exists()) {
        await setDoc(ref, {
            month: monthKey,
            habits: {},
            mentalState: { [dayStr]: { [field]: value } },
        });
    } else {
        await updateDoc(ref, { [fieldPath]: value });
    }
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export const createUserProfile = async (uid, data) => {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, { ...data, createdAt: serverTimestamp() }, { merge: true });
};

export const getUserProfile = async (uid) => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
};
