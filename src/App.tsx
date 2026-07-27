import { Route, Routes } from 'react-router'
import ContactPage from './pages/ContactPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import PropertyPage from './pages/PropertyPage'
import SignupPage from './pages/SignupPage'

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="properties/:propertyId" element={<PropertyPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="favorites" element={<FavoritesPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="manager" element={<ManagerDashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
