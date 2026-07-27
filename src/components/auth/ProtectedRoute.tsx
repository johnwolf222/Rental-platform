import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router'
import {
  useAuth,
  type MemberRole,
} from '../../context/AuthContext'

type ProtectedRouteProps = {
  requiredRole?: MemberRole
}

function ProtectedRoute({
  requiredRole,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { user } = useAuth()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
