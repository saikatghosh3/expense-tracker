import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import AppShell from './components/Layout/AppShell';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import Dashboard from './components/pages/Dashboard';
import AddExpense from './components/pages/AddExpense';
import ExpensesList from './components/pages/ExpensesList';
import Budget from './components/pages/Budget';
import Settings from './components/pages/Settings';
import ProfileView from './components/Profile/ProfileView';
import AdminPanel from './components/Admin/AdminPanel';
import NotFound from './components/pages/NotFound';
import { FullScreenLoader, Spinner } from './components/ui/Primitives';

// The charting library is large and only needed on this one route.
const Analytics = lazy(() => import('./components/pages/Analytics'));

const App: React.FC = () => {
  const { user, loading } = useAuth();

  // Wait for the stored session to resolve before deciding what to render.
  if (loading) return <FullScreenLoader />;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/expenses" element={<ExpensesList />} />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<Spinner label="Loading charts..." className="py-16" />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route path="/budget" element={<Budget />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;