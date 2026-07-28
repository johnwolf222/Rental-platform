import {
  Route,
  Routes,
} from 'react-router'
import ProtectedRoute from './components/auth/ProtectedRoute'
import BookingReviewPage from './pages/BookingReviewPage'
import ContactPage from './pages/ContactPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import NotificationsPage from './pages/NotificationsPage'
import PrivacyPage from './pages/PrivacyPage'
import ProfilePage from './pages/ProfilePage'
import PropertyPage from './pages/PropertyPage'
import SignupPage from './pages/SignupPage'
import TermsPage from './pages/TermsPage'
import WelcomePage from './pages/WelcomePage'

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route
        path="properties/:propertyId"
        element={<PropertyPage />}
      />
      <Route
        path="contact"
        element={<ContactPage />}
      />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="welcome"
          element={<WelcomePage />}
        />
        <Route
          path="notifications"
          element={<NotificationsPage />}
        />
        <Route
          path="favorites"
          element={<FavoritesPage />}
        />
        <Route
          path="profile"
          element={<ProfilePage />}
        />
        <Route
          path="booking/review"
          element={<BookingReviewPage />}
        />
      </Route>

      <Route
        path="manager"
        element={<ManagerDashboardPage />}
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
