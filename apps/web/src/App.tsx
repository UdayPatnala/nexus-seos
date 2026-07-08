import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import Workbench from './pages/Workbench';
import WorkspaceChat from './pages/WorkspaceChat';

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nexus-bg">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="workbench" element={<Workbench />} />
        <Route path="chat" element={<WorkspaceChat />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPageWrapper />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AuthPageWrapper() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

