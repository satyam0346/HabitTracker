import { calcOverallStats } from '../utils/analytics';

export default function DonutChart({ trackingData, habits, year, month }) {
    const stats = calcOverallStats(trackingData, habits, year, month);
    const pct = Math.min(100, stats.percent);

    // SVG Donut params
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const filled = (pct / 100) * circumference;
    const offset = circumference - filled;

    // Color based on completion
    const color = pct >= 80 ? '#5c6950' : pct >= 50 ? '#c89a44' : '#d4a860';

    return (
        <div className="glass-card rounded-2xl p-5 text-center">
            <h3 className="text-sm font-semibold text-khaki-800 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                🎯 Monthly Overview
            </h3>

            {/* Donut */}
            <div className="donut-container mx-auto mb-5">
                <svg width="140" height="140" viewBox="0 0 140 140">
                    {/* Background ring */}
                    <circle
                        cx="70" cy="70" r={radius}
                        fill="none"
                        stroke="#e8d9b0"
                        strokeWidth="16"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="70" cy="70" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 70 70)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                    />
                    {/* Center text */}
                    <text x="70" y="65" textAnchor="middle" fill="#2d2416" fontSize="24" fontWeight="700" fontFamily="Outfit,sans-serif">
                        {pct}%
                    </text>
                    <text x="70" y="84" textAnchor="middle" fill="#a08060" fontSize="10" fontFamily="Inter,sans-serif">
                        completed
                    </text>
                </svg>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Goal', value: stats.goal, icon: '🎯', color: 'text-khaki-700' },
                    { label: 'Done', value: stats.completed, icon: '✅', color: 'text-sage-700' },
                    { label: 'Left', value: stats.left, icon: '⏳', color: 'text-warm-700' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="bg-khaki-50 rounded-xl p-3">
                        <div className="text-lg mb-1">{icon}</div>
                        <div className={`text-xl font-bold ${color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {value}
                        </div>
                        <div className="text-xs text-khaki-500">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
