import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Lazy load only protected components
const ChatLayout = lazy(() => import('./components/chat/ChatLayout'));
const Layout = lazy(() => import('./components/layout/Layout'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
    </div>
  </div>
);

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/chat"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute>
              <Layout>
                <ChatLayout />
              </Layout>
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/friends"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute>
              <Layout>
                <FriendsPage />
              </Layout>
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/notifications"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route path="/" element={<Navigate to="/chat" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      {/* 👉 Thêm Toaster ở đây */}
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
