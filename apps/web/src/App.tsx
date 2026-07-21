import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import Workbench from './pages/Workbench';
import WorkspaceChat from './pages/WorkspaceChat';
import LandingPage from './pages/LandingPage';

function OpenRoutes() {
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={<OpenRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


