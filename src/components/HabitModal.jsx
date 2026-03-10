import { useState, useEffect } from 'react';
import { X, Smile } from 'lucide-react';

const EMOJI_OPTIONS = [
    '🧘', '🏃', '💪', '📚', '💧', '🥗', '😴', '🎯',
    '✍️', '🎵', '🧠', '🌿', '🚴', '🏊', '🎨', '💻',
    '🙏', '🫁', '☀️', '🌙', '🥦', '🏋️', '🧘‍♀️', '🚶',
    '📝', '🎸', '🌸', '🍎', '☕', '🫖', '🧹', '💰',
];

export default function HabitModal({ habit, onSave, onClose }) {
    const isEditing = !!habit;
    const [form, setForm] = useState({
        name: '',
        emoji: '🎯',
        monthlyGoal: 20,
    });

    useEffect(() => {
        if (habit) {
            setForm({ name: habit.name, emoji: habit.emoji, monthlyGoal: habit.monthlyGoal || 20 });
        }
    }, [habit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSave(form);
    };

    return (
        <div
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(45, 36, 22, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-content glass-card rounded-2xl w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-khaki-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {isEditing ? '✏️ Edit Habit' : '✨ New Habit'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-khaki-100 text-khaki-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Emoji Picker */}
                    <div>
                        <label className="block text-sm font-medium text-khaki-700 mb-2.5">Choose Emoji</label>
                        <div className="grid grid-cols-8 gap-1.5 p-3 bg-khaki-50 rounded-xl border border-khaki-200 max-h-36 overflow-y-auto">
                            {EMOJI_OPTIONS.map(em => (
                                <button
                                    key={em}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, emoji: em }))}
                                    className={`
                    text-xl p-1.5 rounded-lg transition-all hover:scale-110
                    ${form.emoji === em
                                            ? 'bg-khaki-400 shadow-md scale-110'
                                            : 'hover:bg-khaki-200'}
                  `}
                                >
                                    {em}
                                </button>
                            ))}
                        </div>
                        {/* Current selection */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl">{form.emoji}</span>
                            <span className="text-sm text-khaki-600">Selected</span>
                        </div>
                    </div>

                    {/* Habit Name */}
                    <div>
                        <label className="block text-sm font-medium text-khaki-700 mb-1.5">Habit Name</label>
                        <input
                            className="input-base"
                            type="text"
                            placeholder="e.g. Morning Meditation"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                            maxLength={50}
                            autoFocus
                        />
                    </div>

                    {/* Monthly Goal */}
                    <div>
                        <label className="block text-sm font-medium text-khaki-700 mb-1.5">
                            Monthly Goal
                            <span className="ml-2 text-khaki-500 font-normal">(days per month)</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                className="input-base"
                                type="range"
                                min={1}
                                max={31}
                                value={form.monthlyGoal}
                                onChange={e => setForm(f => ({ ...f, monthlyGoal: Number(e.target.value) }))}
                                style={{ accentColor: '#c89a44' }}
                            />
                            <span className="text-2xl font-bold text-khaki-600 min-w-[3ch] text-center">
                                {form.monthlyGoal}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-khaki-400 mt-1">
                            <span>1 day</span>
                            <span>31 days</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {isEditing ? 'Save Changes' : 'Add Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
