import { Link, useLocation } from 'react-router-dom'
import Navbar from './Navbar'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/bikes', label: 'Bikes', icon: '🚴' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/bookings', label: 'Bookings', icon: '📋' },
]

export default function AdminLayout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-800 text-gray-300 flex-shrink-0">
          <nav className="p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Admin Panel
            </p>
            {adminLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
