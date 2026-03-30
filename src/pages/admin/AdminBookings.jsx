import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Badge, { statusBadge } from '../../components/ui/Badge'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*, bikes(name), profiles(full_name)')
      .order('start_time', { ascending: false })
      .limit(100)
    setBookings(data || [])
    setLoading(false)
  }

  async function handleReturn(booking) {
    setReturning(booking.id)
    await supabase.from('bookings').update({
      status: 'completed',
      actual_return: new Date().toISOString(),
    }).eq('id', booking.id)
    await supabase.from('bikes').update({ status: 'available' }).eq('id', booking.bike_id)
    setReturning(null)
    fetchBookings()
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Bike</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Start</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expected Return</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => {
                const badge = statusBadge(b.status)
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.profiles?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.bikes?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.start_time).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.expected_return).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {b.status === 'active' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={returning === b.id}
                          onClick={() => handleReturn(b)}
                        >
                          Mark Returned
                        </Button>
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
