import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';

// Layouts
import AppLayout from './components/AppLayout';

// Public pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SharedItineraryPage from './pages/SharedItineraryPage';
import LandingPage from './pages/LandingPage';

// Protected pages
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/MyTripsPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import ExplorePage from './pages/ExplorePage';
import BudgetPage from './pages/BudgetPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAF7F2]">
        <span className="material-symbols-outlined text-4xl text-[#4A2E18] animate-spin">progress_activity</span>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAF7F2]">
        <span className="material-symbols-outlined text-4xl text-[#4A2E18] animate-spin">progress_activity</span>
      </div>
    );
  }
  const isAdmin = user?.email === 'demo@safarsutra.com' || user?.email?.toLowerCase().includes('admin');
  return user && isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication & Shared Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/trips/:id/share" element={<SharedItineraryPage />} />
      <Route path="/share/:token" element={<SharedItineraryPage />} />
      <Route path="/itinerary/view" element={<SharedItineraryPage />} />


      {/* Protected App Routes under AppLayout */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/:id" element={<ItineraryViewPage />} />
        <Route path="/trips/:id/builder" element={<ItineraryBuilderPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      {/* Default route */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <AppRoutes />
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
