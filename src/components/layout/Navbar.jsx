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
    <nav className="bg-volt-bg/85 backdrop-blur border-b border-volt-line sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-volt-text">
            <span className="w-8 h-8 rounded-lg bg-accent text-volt-bg grid place-items-center">⚡</span>
            <span>VOLTBIKE</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/bikes" className="text-volt-muted hover:text-accent text-sm font-medium transition-colors">
              Browse Bikes
            </Link>
            {user && (
              <Link to="/dashboard" className="text-volt-muted hover:text-accent text-sm font-medium transition-colors">
                Dashboard
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link to="/admin" className="text-volt-muted hover:text-accent text-sm font-medium transition-colors">
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
                  className="text-sm text-volt-muted hover:text-accent font-medium transition-colors"
                >
                  {profile?.full_name || user.email}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm bg-volt-surface border border-volt-stroke text-volt-text px-4 py-2 rounded-lg font-medium hover:bg-volt-border transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-volt-muted hover:text-accent font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-accent text-volt-bg hover:bg-accent-600 px-4 py-2 rounded-lg font-display font-bold transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
