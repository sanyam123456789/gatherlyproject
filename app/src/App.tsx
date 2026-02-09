import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import Events from '@/pages/Events';
import EventChat from '@/pages/EventChat';
import Blogs from '@/pages/Blogs';
import Profile from '@/pages/Profile';
import PenguinCompanion from '@/components/PenguinCompanion';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/events" /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/events" /> : <Signup />}
          />

          {/* Protected Routes */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/chat"
            element={
              <ProtectedRoute>
                <EventChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId?"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/events" : "/login"} />}
          />

          {/* 404 - Redirect to home */}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Routes>

        {/* Penguin Companion - shows when user is authenticated */}
        {isAuthenticated && <PenguinCompanion />}
      </Router>
    </ErrorBoundary>
  );
}

export default App;
