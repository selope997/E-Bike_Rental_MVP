import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Badge, { statusBadge } from '../components/ui/Badge'
import Card, { CardHeader, CardBody } from '../components/ui/Card'

export default function Dashboard() {
  const { user } = useAuth()
  const { subscription, isActive, loading: subLoading, refresh: refreshSub } = useSubscription()
  const [searchParams] = useSearchParams()
  const [booking, setBooking] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(true)
  const [returning, setReturning] = useState(false)

  const justSubscribed = searchParams.get('subscribed') === 'true'

  useEffect(() => {
    if (user) fetchActiveBooking()
  }, [user])

  async function fetchActiveBooking() {
    setBookingLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*, bikes(name, type, image_url, stations(name))')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle()
    setBooking(data)
    setBookingLoading(false)
  }

  async function handleReturn() {
    if (!booking) return
    setReturning(true)

    await supabase.from('bookings').update({
      status: 'completed',
      actual_return: new Date().toISOString(),
    }).eq('id', booking.id)

    await supabase.from('bikes').update({ status: 'available' }).eq('id', booking.bike_id)

    setBooking(null)
    setReturning(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        {justSubscribed && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
            🎉 Subscription activated! You can now book a bike.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
            </CardHeader>
            <CardBody>
              {subLoading ? (
                <div className="animate-pulse h-16 bg-gray-100 rounded" />
              ) : isActive ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="green">Active</Badge>
                    <span className="font-semibold text-gray-900">{subscription?.subscription_plans?.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Valid until{' '}
                    <strong>{new Date(subscription?.period_end).toLocaleDateString()}</strong>
                  </p>
                  <Link to="/profile" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                    Manage subscription →
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">No active subscription.</p>
                  <Link to="/subscribe">
                    <Button size="sm">Subscribe Now</Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Booking Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Current Rental</h2>
            </CardHeader>
            <CardBody>
              {bookingLoading ? (
                <div className="animate-pulse h-16 bg-gray-100 rounded" />
              ) : booking ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">🚴</div>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.bikes?.name}</p>
                      <p className="text-sm text-gray-500">{booking.bikes?.type}</p>
                      {booking.bikes?.stations && (
                        <p className="text-xs text-gray-400">📍 {booking.bikes.stations.name}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Started: {new Date(booking.start_time).toLocaleString()}<br />
                    Return by: {new Date(booking.expected_return).toLocaleString()}
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={returning}
                    onClick={handleReturn}
                  >
                    Return Bike
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">No active rental.</p>
                  {isActive && (
                    <Link to="/bikes">
                      <Button size="sm">Find a Bike</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
