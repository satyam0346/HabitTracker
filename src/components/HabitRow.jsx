import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { calcHabitStats } from '../utils/analytics';

export default function HabitRow({
    habit,
    days,
    trackingData,
    year,
    month,
    onToggle,
    onEdit,
    onDelete,
}) {
    const [hoverDay, setHoverDay] = useState(null);
    const [animatingDay, setAnimatingDay] = useState(null);
    const stats = calcHabitStats(trackingData, habit.id, year, month);
    const percent = habit.monthlyGoal
        ? Math.round((stats.completed / habit.monthlyGoal) * 100)
        : Math.round((stats.completed / stats.total) * 100);

    const handleToggle = (day) => {
        const dayStr = String(day).padStart(2, '0');
        const current = trackingData?.habits?.[habit.id]?.[dayStr] === true;
        onToggle(habit.id, day, current);
        setAnimatingDay(day);
        setTimeout(() => setAnimatingDay(null), 300);
    };

    return (
        <tr className="group border-b border-khaki-200 hover:bg-khaki-50/50 transition-colors">
            {/* Habit Name Cell */}
            <td className="sticky-col px-3 py-2 min-w-[180px] border-r border-khaki-200">
                <div className="flex items-center gap-2">
                    <span className="text-lg flex-shrink-0">{habit.emoji}</span>
                    <span className="text-sm font-medium text-khaki-800 truncate flex-1">{habit.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(habit)}
                            className="p-1 rounded hover:bg-khaki-200 text-khaki-500 hover:text-khaki-700 transition-colors"
                            title="Edit habit"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onDelete(habit)}
                            className="p-1 rounded hover:bg-red-100 text-khaki-500 hover:text-red-600 transition-colors"
                            title="Delete habit"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </td>

            {/* Day Cells */}
            {days.map(day => {
                const dayStr = String(day).padStart(2, '0');
                const checked = trackingData?.habits?.[habit.id]?.[dayStr] === true;
                const isToday = new Date().getDate() === day &&
                    new Date().getMonth() + 1 === month &&
                    new Date().getFullYear() === year;

                return (
                    <td
                        key={day}
                        className="p-1 text-center border-r border-khaki-100"
                        style={{ minWidth: '32px' }}
                    >
                        <button
                            onClick={() => handleToggle(day)}
                            onMouseEnter={() => setHoverDay(day)}
                            onMouseLeave={() => setHoverDay(null)}
                            className={`
                habit-cell w-6 h-6 rounded-md mx-auto flex items-center justify-center text-xs font-bold transition-all
                ${checked
                                    ? 'bg-sage-500 text-white shadow-sm'
                                    : 'bg-khaki-100 text-khaki-300 hover:bg-khaki-200'}
                ${isToday ? 'ring-2 ring-khaki-400 ring-offset-1' : ''}
                ${animatingDay === day && checked ? 'checked' : ''}
              `}
                        >
                            {checked ? '✓' : ''}
                        </button>
                    </td>
                );
            })}

            {/* Stats */}
            <td className="px-2 py-2 text-center text-sm font-semibold text-sage-600 border-r border-khaki-200 min-w-[50px]">
                {stats.completed}
            </td>
            <td className="px-2 py-2 text-center text-sm text-khaki-600 border-r border-khaki-200 min-w-[50px]">
                {Math.max(0, (habit.monthlyGoal || stats.total) - stats.completed)}
            </td>
            <td className="px-3 py-2 min-w-[100px] border-r border-khaki-200">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${Math.min(100, percent)}%` }}
                    />
                </div>
            </td>
            <td className="px-2 py-2 text-center text-xs font-bold border-khaki-200 min-w-[45px]">
                <span
                    className={`
            px-1.5 py-0.5 rounded-full text-xs
            ${percent >= 100 ? 'bg-sage-100 text-sage-700' :
                            percent >= 70 ? 'bg-khaki-100 text-khaki-700' :
                                'bg-red-50 text-red-600'}
          `}
                >
                    {Math.min(100, percent)}%
                </span>
            </td>
        </tr>
    );
}
