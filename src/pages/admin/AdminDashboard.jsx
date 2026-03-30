import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

function KPICard({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeRentals: 0,
    availableBikes: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [subs, bookings, bikes, profiles] = await Promise.all([
        supabase.from('subscriptions').select('subscription_plans(price)').eq('status', 'active'),
        supabase.from('bookings').select('id').eq('status', 'active'),
        supabase.from('bikes').select('id, status'),
        supabase.from('profiles').select('id'),
      ])

      const revenue = (subs.data || []).reduce((sum, s) => sum + (s.subscription_plans?.price || 0), 0)
      const availableBikes = (bikes.data || []).filter(b => b.status === 'available').length

      setStats({
        totalRevenue: revenue,
        activeRentals: bookings.data?.length || 0,
        availableBikes,
        totalUsers: profiles.data?.length || 0,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard icon="💰" label="Active MRR" value={`$${stats.totalRevenue}`} sub="From active subscriptions" />
          <KPICard icon="🔑" label="Active Rentals" value={stats.activeRentals} sub="Bikes currently rented" />
          <KPICard icon="🚴" label="Available Bikes" value={stats.availableBikes} sub="Ready to rent" />
          <KPICard icon="👥" label="Total Users" value={stats.totalUsers} sub="Registered accounts" />
        </div>
      )}
    </AdminLayout>
  )
}
