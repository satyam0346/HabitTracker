import { getDaysArray, calcDailyProgress, calcWeeklyProgress } from '../utils/analytics';

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDayOfWeek(year, month, day) {
    return new Date(year, month - 1, day).getDay();
}

export default function ProgressSection({ trackingData, habits, year, month }) {
    const days = getDaysArray(year, month);
    const daily = calcDailyProgress(trackingData, habits, year, month);
    const weekly = calcWeeklyProgress(trackingData, habits, year, month);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

    return (
        <div className="space-y-6">
            {/* Daily Progress */}
            <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-khaki-800 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    📅 Daily Progress
                </h3>
                <div className="flex gap-0.5 overflow-x-auto pb-2">
                    {daily.map(({ day, percent }) => {
                        const isToday = isCurrentMonth && today.getDate() === day;
                        const dowIdx = getDayOfWeek(year, month, day);
                        return (
                            <div key={day} className="flex flex-col items-center gap-0.5" style={{ minWidth: '28px' }}>
                                <div className="text-xs text-khaki-500" style={{ fontSize: '9px' }}>
                                    {DAY_NAMES[dowIdx]}
                                </div>
                                <div className="relative w-5 h-20 flex flex-col justify-end">
                                    <div
                                        className={`w-full rounded-t-sm transition-all duration-500 ${isToday ? 'bg-khaki-400' : 'bg-sage-400'
                                            }`}
                                        style={{
                                            height: `${Math.max(4, percent)}%`,
                                            opacity: percent === 0 ? 0.2 : 1,
                                        }}
                                    />
                                </div>
                                <div className="text-center" style={{ fontSize: '9px' }}>
                                    <span className={`font-medium ${isToday ? 'text-khaki-700' : 'text-khaki-500'}`}>
                                        {day}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-khaki-800 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    📊 Weekly Summary
                </h3>
                <div className="space-y-3">
                    {weekly.map(w => (
                        <div key={w.label} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-khaki-700">
                                    {w.label} <span className="text-khaki-500 font-normal">(Day {w.start}–{w.end})</span>
                                </span>
                                <span className="font-semibold text-sage-600">{w.percent}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${w.percent}%` }} />
                            </div>
                            <div className="text-xs text-khaki-500">{w.done} / {w.max} completions</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
