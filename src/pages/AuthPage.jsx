import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, CheckSquare } from 'lucide-react';

export default function AuthPage() {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login, signup, loginWithGoogle, enterGuestMode } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                if (!form.name) return setError('Please enter your name.');
                await signup(form.email, form.password, form.name);
            }
        } catch (err) {
            setError(getErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError(getErrorMessage(err.code));
        } finally {
            setGoogleLoading(false);
        }
    };

    const switchMode = () => {
        setMode(m => m === 'login' ? 'signup' : 'login');
        setError('');
        setForm({ name: '', email: '', password: '' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-khaki-300 rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-sage-300 rounded-full opacity-15 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-warm-200 rounded-full opacity-10 blur-3xl" />
            </div>

            <div className="auth-card rounded-2xl p-8 w-full max-w-md relative z-10 modal-content">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-khaki-400 to-sage-500 rounded-2xl mb-4 shadow-lg">
                        <CheckSquare className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-khaki-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        HabitVault
                    </h1>
                    <p className="text-sm text-khaki-600 mt-1">
                        {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Start your habit journey today.'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                        {error}
                    </div>
                )}

                {/* ── Google Button (top, primary CTA) ── */}
                <button
                    id="google-auth-btn"
                    onClick={handleGoogle}
                    disabled={googleLoading || loading}
                    className="btn-secondary w-full flex items-center justify-center gap-3 mb-5 py-3"
                >
                    {googleLoading ? (
                        <div className="w-4 h-4 border-2 border-khaki-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    <span className="font-medium">
                        {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                    </span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-khaki-200" />
                    <span className="text-xs text-khaki-400 font-medium">or use email</span>
                    <div className="flex-1 h-px bg-khaki-200" />
                </div>

                {/* ── Email / Password Form ── */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-khaki-700 mb-1.5">Your Name</label>
                            <input
                                id="signup-name"
                                className="input-base"
                                type="text"
                                placeholder="e.g. Alex Johnson"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                required
                                autoComplete="name"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-khaki-700 mb-1.5">Email</label>
                        <input
                            id="auth-email"
                            className="input-base"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-khaki-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                id="auth-password"
                                className="input-base pr-10"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                                minLength={6}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-khaki-500 hover:text-khaki-700 transition-colors"
                                onClick={() => setShowPassword(s => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        id="email-auth-btn"
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Toggle Sign In / Sign Up */}
                <p className="text-center text-sm text-khaki-600 mt-3">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        id="toggle-auth-mode-btn"
                        className="font-semibold text-khaki-800 hover:text-khaki-600 transition-colors underline underline-offset-2"
                        onClick={switchMode}
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>

                {/* Guest Mode */}
                <div className="mt-8 pt-6 border-t border-khaki-100 text-center">
                    <p className="text-xs text-khaki-500 mb-3 uppercase tracking-wider font-bold">New here? Try first!</p>
                    <button
                        onClick={enterGuestMode}
                        className="text-sm font-semibold text-khaki-600 hover:text-khaki-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <span>Continue as Guest</span>
                        <span className="text-[10px] bg-khaki-100 px-1.5 py-0.5 rounded text-khaki-600">Offline Only</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function getErrorMessage(code) {
    const map = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Try again.',
        'auth/invalid-credential': 'Incorrect email or password. Try again.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email. Try signing in with email & password instead.',
        'auth/popup-blocked': 'Google sign-in popup was blocked. Please allow popups for this site and try again.',
        'auth/network-request-failed': 'Network error. Please check your connection and try again.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact support.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}
