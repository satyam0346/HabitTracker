import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getDaysArray } from '../utils/analytics';

// ─── Option Definitions ──────────────────────────────────────────────────────

const MOOD_OPTIONS = [
    { value: 'happy', label: 'Happy', emoji: '😊', score: 4, color: '#5c6950', bg: '#d4e6c3' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', score: 3, color: '#c89a44', bg: '#f5e6c0' },
    { value: 'sad', label: 'Sad', emoji: '😢', score: 2, color: '#7a8fa6', bg: '#d0dce8' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😤', score: 1, color: '#c0614a', bg: '#f0d0c8' },
];

const MOTIVATION_OPTIONS = [
    { value: 'high', label: 'High', emoji: '🔥', score: 3, color: '#c87a2a', bg: '#f5dfc0' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', score: 2, color: '#c89a44', bg: '#f5e6c0' },
    { value: 'sucks', label: 'Sucks', emoji: '💀', score: 1, color: '#888', bg: '#e0e0e0' },
];

const METRICS = [
    { key: 'mood', label: '😊 Mood', options: MOOD_OPTIONS },
    { key: 'motivation', label: '⚡ Motivation', options: MOTIVATION_OPTIONS },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const getOption = (options, value) => options.find(o => o.value === value) || null;
const getScore = (options, value) => getOption(options, value)?.score ?? null;

// ─── Portal Picker Popup ──────────────────────────────────────────────────────
// Renders into document.body via portal so it's never clipped by overflow ancestors.

const PICKER_GAP = 6;   // px gap between button and popup
const PICKER_MARGIN = 8; // min distance from viewport edges

function OptionPicker({ options, onSelect, onClose, anchorRef }) {
    const pickerRef = useRef(null);
    const [style, setStyle] = useState({ opacity: 0, pointerEvents: 'none' });

    // Calculate fixed position after mount so we know the picker's own dimensions
    useEffect(() => {
        if (!anchorRef.current || !pickerRef.current) return;

        const btn = anchorRef.current.getBoundingClientRect();
        const picker = pickerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Prefer opening ABOVE the button; fall back to below
        const spaceAbove = btn.top;
        const spaceBelow = vh - btn.bottom;
        const openAbove = spaceAbove >= picker.height + PICKER_GAP || spaceAbove > spaceBelow;

        let top;
        if (openAbove) {
            top = btn.top - picker.height - PICKER_GAP;
        } else {
            top = btn.bottom + PICKER_GAP;
        }

        // Horizontally: centre on the button, then clamp to viewport
        let left = btn.left + btn.width / 2 - picker.width / 2;
        left = Math.max(PICKER_MARGIN, Math.min(left, vw - picker.width - PICKER_MARGIN));

        setStyle({ position: 'fixed', top, left, zIndex: 9999, opacity: 1, pointerEvents: 'auto' });
    }, [anchorRef]);

    // Close on outside click or scroll
    useEffect(() => {
        const handleDown = (e) => {
            if (
                pickerRef.current && !pickerRef.current.contains(e.target) &&
                anchorRef.current && !anchorRef.current.contains(e.target)
            ) onClose();
        };
        const handleScroll = () => onClose();
        document.addEventListener('mousedown', handleDown);
        document.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleDown);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose, anchorRef]);

    const popup = (
        <div
            ref={pickerRef}
            style={{
                ...style,
                background: 'rgba(250,249,240,0.98)',
                border: '1.5px solid #ddd0b0',
                borderRadius: '12px',
                boxShadow: '0 8px 28px rgba(45,36,22,0.18)',
                padding: '8px',
                display: 'flex',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.12s ease',
            }}
        >
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => { onSelect(opt.value); onClose(); }}
                    title={opt.label}
                    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                    style={{
                        background: opt.bg,
                        border: `1.5px solid ${opt.color}30`,
                        cursor: 'pointer',
                        minWidth: '44px',
                    }}
                >
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>{opt.emoji}</span>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: opt.color, fontFamily: 'Inter,sans-serif' }}>
                        {opt.label}
                    </span>
                </button>
            ))}
            {/* Clear */}
            <button
                onClick={() => { onSelect(null); onClose(); }}
                title="Clear"
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{ background: '#f5f0dc', border: '1.5px solid #ddd0b0', cursor: 'pointer', minWidth: '36px' }}
            >
                <span style={{ fontSize: '14px', lineHeight: 1, color: '#a08060' }}>✕</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#a08060', fontFamily: 'Inter,sans-serif' }}>Clear</span>
            </button>
        </div>
    );

    return createPortal(popup, document.body);
}

// ─── Individual Cell ──────────────────────────────────────────────────────────

function MoodCell({ options, value, onSelect, isToday }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const selected = getOption(options, value);

    const handleClose = useCallback(() => setOpen(false), []);

    return (
        // No longer needs `position:relative` — popup goes into a portal
        <div className="flex items-center justify-center">
            <button
                ref={btnRef}
                onClick={() => setOpen(o => !o)}
                className={`
                    w-7 h-7 rounded-lg flex items-center justify-center transition-all
                    hover:scale-110 active:scale-95
                    ${isToday ? 'ring-2 ring-khaki-400 ring-offset-1' : ''}
                `}
                style={{
                    background: selected ? selected.bg : 'rgba(200,154,68,0.08)',
                    border: selected ? `1.5px solid ${selected.color}50` : '1.5px dashed #ddd0b0',
                    cursor: 'pointer',
                }}
                title={selected ? selected.label : 'Click to set'}
            >
                {selected
                    ? <span style={{ fontSize: '14px', lineHeight: 1 }}>{selected.emoji}</span>
                    : <span style={{ fontSize: '12px', color: '#c4b08a' }}>·</span>
                }
            </button>

            {open && (
                <OptionPicker
                    options={options}
                    anchorRef={btnRef}
                    onSelect={onSelect}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function MentalLineChart({ chartData, totalDays }) {
    const W = 500, H = 80;
    const moodPoints = chartData.filter(d => d.mood !== null);
    const motivPoints = chartData.filter(d => d.motivation !== null);
    const maxMood = 4; // happy score
    const maxMotiv = 3; // high score

    const toX = (day) => ((day - 1) / Math.max(totalDays - 1, 1)) * W;
    const toY = (score, max) => H - 10 - ((score / max) * (H - 20));

    const moodPath = moodPoints.length > 1
        ? `M ${moodPoints.map(d => `${toX(d.day)},${toY(d.moodScore, maxMood)}`).join(' L ')}`
        : null;
    const motivPath = motivPoints.length > 1
        ? `M ${motivPoints.map(d => `${toX(d.day)},${toY(d.motivScore, maxMotiv)}`).join(' L ')}`
        : null;

    // Y-axis labels for mood
    const moodLabels = [
        { score: 4, label: '😊' },
        { score: 3, label: '😐' },
        { score: 2, label: '😢' },
        { score: 1, label: '😤' },
    ];

    if (!moodPath && !motivPath) return null;

    return (
        <div className="mb-4">
            <div className="flex items-start gap-1">
                {/* Y-axis */}
                <svg width="22" height={H} style={{ flexShrink: 0 }}>
                    {moodLabels.map(({ score, label }) => (
                        <text
                            key={score}
                            x="20" y={toY(score, maxMood) + 4}
                            textAnchor="end"
                            fontSize="10"
                            fontFamily="Inter,sans-serif"
                        >
                            {label}
                        </text>
                    ))}
                </svg>

                {/* Chart */}
                <div className="overflow-x-auto flex-1">
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                        {/* Grid lines */}
                        {[1, 2, 3, 4].map(v => (
                            <line
                                key={v}
                                x1="0" x2={W}
                                y1={toY(v, maxMood)} y2={toY(v, maxMood)}
                                stroke="#e8d9b0" strokeWidth="1"
                            />
                        ))}

                        {/* Mood line */}
                        {moodPath && (
                            <>
                                <path d={moodPath} fill="none" stroke="#c89a44" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round" />
                                {moodPoints.map(d => {
                                    const opt = getOption(MOOD_OPTIONS, d.mood);
                                    return (
                                        <g key={`m${d.day}`}>
                                            <circle cx={toX(d.day)} cy={toY(d.moodScore, maxMood)} r="5" fill={opt?.color || '#c89a44'} />
                                            <text x={toX(d.day)} y={toY(d.moodScore, maxMood) + 4}
                                                textAnchor="middle" fontSize="8" fill="white" fontWeight="700">
                                                {/* tiny emoji alternative - just dot */}
                                            </text>
                                        </g>
                                    );
                                })}
                            </>
                        )}

                        {/* Motivation line */}
                        {motivPath && (
                            <>
                                <path d={motivPath} fill="none" stroke="#5c6950" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />
                                {motivPoints.map(d => (
                                    <circle key={`mv${d.day}`}
                                        cx={toX(d.day)} cy={toY(d.motivScore, maxMotiv)}
                                        r="4" fill="#5c6950" />
                                ))}
                            </>
                        )}
                    </svg>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 rounded" style={{ background: '#c89a44' }} />
                    <span className="text-khaki-600">Mood</span>
                    <span className="text-khaki-400 text-xs ml-1">
                        {MOOD_OPTIONS.map(o => `${o.emoji}=${o.label}`).join(' · ')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 rounded" style={{ background: '#5c6950', backgroundImage: 'repeating-linear-gradient(90deg,#5c6950 0,#5c6950 6px,transparent 6px,transparent 9px)' }} />
                    <span className="text-khaki-600">Motivation</span>
                    <span className="text-khaki-400 text-xs ml-1">
                        {MOTIVATION_OPTIONS.map(o => `${o.emoji}=${o.label}`).join(' · ')}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MentalStateTracker({ trackingData, year, month, onUpdate }) {
    const days = getDaysArray(year, month);
    const today = new Date();

    // Build chart data with scores
    const chartData = days.map(d => {
        const dayStr = String(d).padStart(2, '0');
        const ms = trackingData?.mentalState?.[dayStr] || {};
        return {
            day: d,
            mood: ms.mood || null,
            motivation: ms.motivation || null,
            moodScore: getScore(MOOD_OPTIONS, ms.mood),
            motivScore: getScore(MOTIVATION_OPTIONS, ms.motivation),
        };
    });

    const handleSelect = (day, field, value) => {
        onUpdate(day, field, value);
    };

    // Summary counts
    const moodSummary = MOOD_OPTIONS.map(opt => ({
        ...opt,
        count: chartData.filter(d => d.mood === opt.value).length,
    }));
    const motivSummary = MOTIVATION_OPTIONS.map(opt => ({
        ...opt,
        count: chartData.filter(d => d.motivation === opt.value).length,
    }));

    return (
        <div className="glass-card rounded-2xl p-5">
            {/* Title + Summary Pills */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-khaki-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        🧠 Mental State Tracker
                    </h3>
                    <p className="text-xs text-khaki-500 mt-0.5">Click a cell to log your daily mood & motivation</p>
                </div>

                {/* Quick summary */}
                <div className="flex flex-wrap gap-2">
                    {[...moodSummary, ...motivSummary].filter(s => s.count > 0).map(s => (
                        <div
                            key={`${s.value}-${s.count}`}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}
                        >
                            <span>{s.emoji}</span>
                            <span>{s.count}d</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Line Chart */}
            <MentalLineChart chartData={chartData} totalDays={days.length} />

            {/* Grid */}
            <div className="overflow-x-auto">
                <table className="border-collapse" style={{ minWidth: `${days.length * 32 + 120}px`, width: '100%' }}>
                    <thead>
                        <tr>
                            <th
                                className="text-xs text-left font-medium text-khaki-600 pb-2 pr-3"
                                style={{ minWidth: '110px', position: 'sticky', left: 0, background: 'rgba(250,249,240,0.95)', zIndex: 2 }}
                            >
                                Metric
                            </th>
                            {days.map(d => (
                                <th key={d} className="text-xs font-medium text-khaki-500 pb-2 text-center" style={{ minWidth: '32px' }}>
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {METRICS.map(({ key, label, options }) => (
                            <tr key={key}>
                                {/* Metric Label */}
                                <td
                                    className="text-xs font-semibold text-khaki-700 pr-3 py-1"
                                    style={{ position: 'sticky', left: 0, background: 'rgba(250,249,240,0.95)', zIndex: 2 }}
                                >
                                    <div className="flex flex-col">
                                        <span>{label}</span>
                                        <span className="text-khaki-400 font-normal mt-0.5" style={{ fontSize: '9px' }}>
                                            {options.map(o => o.emoji).join('  ')}
                                        </span>
                                    </div>
                                </td>

                                {/* Day Cells */}
                                {days.map(day => {
                                    const dayStr = String(day).padStart(2, '0');
                                    const value = trackingData?.mentalState?.[dayStr]?.[key] || null;
                                    const isToday = today.getDate() === day &&
                                        today.getMonth() + 1 === month &&
                                        today.getFullYear() === year;

                                    return (
                                        <td key={day} className="p-0.5 text-center">
                                            <MoodCell
                                                options={options}
                                                value={value}
                                                isToday={isToday}
                                                onSelect={(val) => handleSelect(day, key, val)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Option Key */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-khaki-200">
                <div>
                    <div className="text-xs font-semibold text-khaki-700 mb-2">Mood</div>
                    <div className="flex flex-wrap gap-1.5">
                        {MOOD_OPTIONS.map(opt => (
                            <div
                                key={opt.value}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                style={{ background: opt.bg, color: opt.color, border: `1px solid ${opt.color}25` }}
                            >
                                <span>{opt.emoji}</span>
                                <span>{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-xs font-semibold text-khaki-700 mb-2">Motivation</div>
                    <div className="flex flex-wrap gap-1.5">
                        {MOTIVATION_OPTIONS.map(opt => (
                            <div
                                key={opt.value}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                style={{ background: opt.bg, color: opt.color, border: `1px solid ${opt.color}25` }}
                            >
                                <span>{opt.emoji}</span>
                                <span>{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
