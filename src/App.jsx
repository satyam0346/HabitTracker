import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user, loading, guestMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-khaki-300 border-t-khaki-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-khaki-600 text-sm font-medium">Loading HabitVault...</p>
        </div>
      </div>
    );
  }

  if (!user && !guestMode) {
    return <AuthPage />;
  }

  return <Dashboard />;
}

export default function App() {
  return <AppContent />;
}
