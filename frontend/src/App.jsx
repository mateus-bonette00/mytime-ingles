import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/auth';
import api from './services/api';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SetPassword from './pages/SetPassword';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentPending from './pages/PaymentPending';
import PaymentFailure from './pages/PaymentFailure';
import StudentDashboard from './pages/StudentDashboard';
import LessonPage from './pages/LessonPage';
import MyCoursesPage from './pages/MyCoursesPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route - verifies auth with backend on mount
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setStatus('unauthenticated');
      return;
    }

    // Verify token with backend
    authService.verifyAuth()
      .then(() => setStatus('authenticated'))
      .catch(() => {
        authService.logout();
      });
  }, []);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Navigate to="/login" />;
  return children;
};

// Admin Route - requires admin role, verified with backend
const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setStatus('unauthenticated');
      return;
    }

    if (!authService.isAdmin()) {
      setStatus('forbidden');
      return;
    }

    // Verify token with backend
    authService.verifyAuth()
      .then(() => setStatus('authenticated'))
      .catch(() => {
        authService.logout();
      });
  }, []);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Navigate to="/login" />;
  if (status === 'forbidden') return <Navigate to="/meus-cursos" />;
  return children;
};

// Student Route - requires auth + active purchase
const StudentRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setStatus('unauthenticated');
      return;
    }

    // Admin bypass
    if (authService.isAdmin()) {
      setStatus('authenticated');
      return;
    }

    // Verify access (auth + purchase)
    api.get('/users/verify-access')
      .then(() => setStatus('authenticated'))
      .catch((err) => {
        if (err.response?.status === 401) {
          authService.logout();
        } else if (err.response?.data?.code === 'NO_ACTIVE_PURCHASE') {
          setStatus('no_purchase');
        } else {
          setStatus('authenticated'); // Fallback: allow if server error
        }
      });
  }, []);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Navigate to="/login" />;
  if (status === 'no_purchase') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/definir-senha" element={<SetPassword />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
        <Route path="/pagamento/pendente" element={<PaymentPending />} />
        <Route path="/pagamento/falha" element={<PaymentFailure />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/:section" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Student Routes (require auth + active purchase) */}
        <Route
          path="/meus-cursos"
          element={<StudentRoute><MyCoursesPage /></StudentRoute>}
        />
        <Route
          path="/dashboard"
          element={<StudentRoute><StudentDashboard /></StudentRoute>}
        />
        <Route
          path="/lessons/:phraseNumber"
          element={<StudentRoute><LessonPage /></StudentRoute>}
        />

        {/* Protected Routes (auth only, no purchase check) */}
        <Route
          path="/configuracoes"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
