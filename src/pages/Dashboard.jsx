import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, LogOut, Settings, RefreshCw, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    listenToHabits,
    listenToMonthData,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    updateMentalState,
} from '../firebase/firestore';
import {
    guestGetHabits,
    guestSaveHabits,
    guestGetMonthData,
    guestToggleDay,
    guestUpdateMentalState,
} from '../utils/guestStorage';
import { getDaysArray, getMonthKey } from '../utils/analytics';
import HabitRow from '../components/HabitRow';
import HabitModal from '../components/HabitModal';
import DonutChart from '../components/DonutChart';
import ProgressSection from '../components/ProgressSection';
import MentalStateTracker from '../components/MentalStateTracker';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayName(year, month, day) {
    return DAY_NAMES[new Date(year, month - 1, day).getDay()];
}

export default function Dashboard() {
    const { user, logout, guestMode, exitGuestMode } = useAuth();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [habits, setHabits] = useState([]);
    const [trackingData, setTrackingData] = useState({ habits: {}, mentalState: {} });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const monthKey = getMonthKey(year, month);
    const days = getDaysArray(year, month);
    const uid = user?.uid || 'guest';

    // ─── Data Loading ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!guestMode && !user) return;

        setLoading(true);
        if (guestMode) {
            try {
                const gHabits = guestGetHabits();
                const gData = guestGetMonthData(monthKey);
                setHabits(gHabits);
                setTrackingData(gData);
            } catch (err) {
                console.error('Failed to load guest data:', err);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!user) {
            setLoading(false);
            return;
        }

        // Use a counter or specific booleans to ensure both are loaded
        let habitsLoaded = false;
        let monthDataLoaded = false;

        const checkLoaded = () => {
            if (habitsLoaded && monthDataLoaded) {
                setLoading(false);
            }
        };

        // Listen to habits
        const unsubHabits = listenToHabits(uid, (h) => {
            setHabits(h);
            habitsLoaded = true;
            checkLoaded();
        }, (err) => {
            console.error('Habits listener error:', err);
            setLoading(false);
        });

        // Listen to monthly data
        const unsubMonth = listenToMonthData(uid, monthKey, (data) => {
            setTrackingData(data);
            monthDataLoaded = true;
            checkLoaded();
        }, (err) => {
            console.error('Month data listener error:', err);
            setLoading(false); // Set loading to false even on error
        });

        return () => {
            unsubHabits();
            unsubMonth();
        };
    }, [uid, monthKey, guestMode, user]);

    // ─── Habit CRUD ──────────────────────────────────────────────────────────────

    const handleSaveHabit = async (formData) => {
        if (editingHabit) {
            if (guestMode) {
                const updated = habits.map(h =>
                    h.id === editingHabit.id ? { ...h, ...formData } : h
                );
                setHabits(updated);
                guestSaveHabits(updated);
            } else {
                await updateHabit(uid, editingHabit.id, formData);
            }
        } else {
            if (guestMode) {
                const newHabit = { id: Date.now().toString(), ...formData, order: habits.length };
                const updated = [...habits, newHabit];
                setHabits(updated);
                guestSaveHabits(updated);
            } else {
                await addHabit(uid, formData);
            }
        }
        setShowModal(false);
        setEditingHabit(null);
    };

    const handleDeleteHabit = async (habit) => {
        if (guestMode) {
            const updated = habits.filter(h => h.id !== habit.id);
            setHabits(updated);
            guestSaveHabits(updated);
        } else {
            await deleteHabit(uid, habit.id);
        }
        setDeleteConfirm(null);
    };

    // ─── Toggle Day ───────────────────────────────────────────────────────────────

    const handleToggle = useCallback(async (habitId, day, currentValue) => {
        const dayStr = String(day).padStart(2, '0');
        // Optimistic update
        setTrackingData(prev => ({
            ...prev,
            habits: {
                ...prev.habits,
                [habitId]: {
                    ...prev.habits?.[habitId],
                    [dayStr]: !currentValue,
                },
            },
        }));
        // Persist
        if (guestMode) {
            const result = guestToggleDay(monthKey, habitId, day, currentValue);
            setTrackingData(result);
        } else {
            await toggleHabitDay(uid, monthKey, habitId, day, currentValue);
        }
    }, [uid, monthKey, guestMode]);

    // ─── Mental State ─────────────────────────────────────────────────────────────

    const handleMentalUpdate = useCallback(async (day, field, value) => {
        const dayStr = String(day).padStart(2, '0');
        // Optimistic
        setTrackingData(prev => ({
            ...prev,
            mentalState: {
                ...prev.mentalState,
                [dayStr]: { ...prev.mentalState?.[dayStr], [field]: value },
            },
        }));
        if (guestMode) {
            guestUpdateMentalState(monthKey, day, field, value);
        } else {
            await updateMentalState(uid, monthKey, day, field, value);
        }
    }, [uid, monthKey, guestMode]);

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="glass-card sticky top-0 z-40 border-b border-khaki-200 px-4 py-3">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-khaki-400 to-sage-500 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-lg">✅</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-khaki-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                HabitVault
                            </h1>
                            {guestMode && (
                                <span className="text-xs text-warm-600 font-medium">Guest Mode</span>
                            )}
                        </div>
                    </div>

                    {/* Month/Year Selectors */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={month}
                                onChange={e => setMonth(Number(e.target.value))}
                                className="appearance-none bg-khaki-50 border border-khaki-200 text-khaki-800 text-sm font-medium rounded-lg px-3 py-1.5 pr-7 cursor-pointer hover:border-khaki-400 transition-colors focus:outline-none focus:border-khaki-500"
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-khaki-500 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                className="appearance-none bg-khaki-50 border border-khaki-200 text-khaki-800 text-sm font-medium rounded-lg px-3 py-1.5 pr-7 cursor-pointer hover:border-khaki-400 transition-colors focus:outline-none focus:border-khaki-500"
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-khaki-500 pointer-events-none" />
                        </div>

                        {/* Today button */}
                        <button
                            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); }}
                            className="px-3 py-1.5 text-xs font-medium bg-khaki-100 text-khaki-700 rounded-lg hover:bg-khaki-200 transition-colors border border-khaki-200"
                        >
                            Today
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(s => !s)}
                            className="flex items-center gap-2 p-2 rounded-xl hover:bg-khaki-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-khaki-300 to-sage-400 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-white">
                                    {(user?.displayName?.[0] || 'G').toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-medium text-khaki-800 leading-none">
                                    {user?.displayName || 'Guest'}
                                </div>
                                <div className="text-xs text-khaki-500 leading-none mt-0.5">
                                    {guestMode ? 'Local Storage' : user?.email}
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-khaki-500" />
                        </button>

                        {showUserMenu && (
                            <div
                                className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl py-1 shadow-xl z-50 animate-fade-in"
                                onClick={e => e.stopPropagation()}
                            >
                                {guestMode ? (
                                    <button
                                        onClick={() => { setShowUserMenu(false); exitGuestMode(); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-khaki-700 hover:bg-khaki-100 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign In / Sign Up
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            setShowUserMenu(false);
                                            try { await logout(); } catch (e) { console.error('Sign out failed:', e); }
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

                {/* Left: Main Grid + Mental State */}
                <div className="space-y-6 min-w-0">

                    {/* Grid Card */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Grid Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-khaki-200">
                            <div>
                                <h2 className="text-lg font-bold text-khaki-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                    {MONTHS[month - 1]} {year}
                                </h2>
                                <p className="text-xs text-khaki-500 mt-0.5">{habits.length} habit{habits.length !== 1 ? 's' : ''} tracked</p>
                            </div>
                            <button
                                onClick={() => { setEditingHabit(null); setShowModal(true); }}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Habit
                            </button>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <SkeletonGrid />
                        ) : habits.length === 0 ? (
                            <EmptyState onAdd={() => setShowModal(true)} />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse" style={{ minWidth: `${days.length * 32 + 380}px` }}>
                                    <thead>
                                        <tr className="bg-khaki-50">
                                            <th className="sticky-col px-3 py-3 text-left text-xs font-semibold text-khaki-600 border-r border-b border-khaki-200 min-w-[180px]">
                                                MY HABITS
                                            </th>
                                            {days.map(day => {
                                                const isToday = new Date().getDate() === day &&
                                                    new Date().getMonth() + 1 === month &&
                                                    new Date().getFullYear() === year;
                                                const dayName = getDayName(year, month, day);
                                                return (
                                                    <th
                                                        key={day}
                                                        className={`px-1 py-2 text-center border-r border-b border-khaki-200 text-xs font-medium ${isToday ? 'bg-khaki-100 text-khaki-800' : 'text-khaki-500'
                                                            }`}
                                                        style={{ minWidth: '32px' }}
                                                    >
                                                        <div>{dayName[0]}</div>
                                                        <div className={`font-bold mt-0.5 ${isToday ? 'text-khaki-700' : ''}`}>{day}</div>
                                                    </th>
                                                );
                                            })}
                                            <th className="px-2 py-3 text-center text-xs font-semibold text-khaki-600 border-r border-b border-khaki-200 min-w-[50px]">DONE</th>
                                            <th className="px-2 py-3 text-center text-xs font-semibold text-khaki-600 border-r border-b border-khaki-200 min-w-[50px]">LEFT</th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-khaki-600 border-r border-b border-khaki-200 min-w-[100px]">PROGRESS</th>
                                            <th className="px-2 py-3 text-center text-xs font-semibold text-khaki-600 border-b border-khaki-200 min-w-[45px]">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {habits.map(habit => (
                                            <HabitRow
                                                key={habit.id}
                                                habit={habit}
                                                days={days}
                                                trackingData={trackingData}
                                                year={year}
                                                month={month}
                                                onToggle={handleToggle}
                                                onEdit={(h) => { setEditingHabit(h); setShowModal(true); }}
                                                onDelete={(h) => setDeleteConfirm(h)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Mental State Tracker */}
                    <MentalStateTracker
                        trackingData={trackingData}
                        year={year}
                        month={month}
                        onUpdate={handleMentalUpdate}
                    />
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <DonutChart
                        trackingData={trackingData}
                        habits={habits}
                        year={year}
                        month={month}
                    />
                    <ProgressSection
                        trackingData={trackingData}
                        habits={habits}
                        year={year}
                        month={month}
                    />
                </div>
            </div>

            {/* Habit Modal */}
            {showModal && (
                <HabitModal
                    habit={editingHabit}
                    onSave={handleSaveHabit}
                    onClose={() => { setShowModal(false); setEditingHabit(null); }}
                />
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div
                    className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(45, 36, 22, 0.5)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="modal-content glass-card rounded-2xl p-6 w-full max-w-sm text-center">
                        <div className="text-4xl mb-4">🗑️</div>
                        <h3 className="text-lg font-bold text-khaki-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Delete "{deleteConfirm.name}"?
                        </h3>
                        <p className="text-sm text-khaki-600 mb-6">
                            This will permanently delete this habit and all its tracking data. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteHabit(deleteConfirm)}
                                className="flex-1 bg-red-500 text-white border-none rounded-xl py-2.5 px-4 font-semibold text-sm cursor-pointer hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User menu backdrop */}
            {showUserMenu && (
                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
            )}
        </div>
    );
}

function EmptyState({ onAdd }) {
    return (
        <div className="text-center py-20 px-8">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-khaki-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                No Habits Yet
            </h3>
            <p className="text-khaki-600 mb-6 text-sm max-w-xs mx-auto">
                Start tracking your daily habits to build consistency and achieve your goals.
            </p>
            <button onClick={onAdd} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Habit
            </button>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="p-5 space-y-3 animate-fade-in">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                    <div
                        className="h-8 rounded-lg shimmer flex-shrink-0"
                        style={{ width: '180px', background: '#e8d9b0', backgroundSize: '200% 100%' }}
                    />
                    {Array.from({ length: 15 }).map((_, j) => (
                        <div
                            key={j}
                            className="h-6 w-6 rounded shimmer flex-shrink-0"
                            style={{ background: '#e8d9b0', backgroundSize: '200% 100%' }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

