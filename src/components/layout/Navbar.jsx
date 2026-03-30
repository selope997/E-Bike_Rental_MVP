import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <span>🚴</span>
            <span>E-Bike Rentals</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/bikes" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">
              Browse Bikes
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">
                Dashboard
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  {profile?.full_name || user.email}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
