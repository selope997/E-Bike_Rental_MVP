import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge, { statusBadge } from '../../components/ui/Badge'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('*, subscriptions(status, period_end, subscription_plans(name))')
        .order('full_name')
      setUsers(data || [])
      setLoading(false)
    }
    fetchUsers()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Platform</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sub Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => {
                const activeSub = user.subscriptions?.find(s => s.status === 'active')
                const badge = activeSub ? statusBadge(activeSub.status) : null
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.full_name || '—'}</p>
                      <p className="text-gray-400 text-xs">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{user.delivery_platform || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'blue' : 'gray'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{activeSub?.subscription_plans?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {badge ? (
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">No subscription</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
