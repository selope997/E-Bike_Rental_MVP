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
  const justBooked = searchParams.get('booked') === 'true'

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
        <h1 className="font-display font-bold text-[34px] mb-8">My dashboard</h1>

        {justSubscribed && (
          <div className="mb-6 bg-accent/10 border border-accent/25 text-accent rounded-xl px-[18px] py-3.5 text-sm font-medium">
            🎉 Subscription activated! You can now book a bike.
          </div>
        )}

        {justBooked && (
          <div className="mb-6 bg-accent/10 border border-accent/25 text-accent rounded-xl px-[18px] py-3.5 text-sm font-medium">
            Booking confirmed! Your bike is ready for pickup.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg">Subscription</h2>
            </CardHeader>
            <CardBody>
              {subLoading ? (
                <div className="animate-pulse h-16 bg-volt-bg rounded" />
              ) : isActive ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="green">Active</Badge>
                    <span className="font-display font-semibold text-volt-text">{subscription?.subscription_plans?.name}</span>
                  </div>
                  <p className="text-sm text-volt-dim">
                    Valid until{' '}
                    <strong className="text-volt-text">{new Date(subscription?.period_end).toLocaleDateString()}</strong>
                  </p>
                  <Link to="/profile" className="text-sm text-accent hover:underline mt-2 inline-block">
                    Manage subscription →
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-volt-dim text-sm mb-3">No active subscription.</p>
                  <Link to="/subscribe">
                    <Button size="sm">Subscribe now</Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Booking Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg">Current rental</h2>
            </CardHeader>
            <CardBody>
              {bookingLoading ? (
                <div className="animate-pulse h-16 bg-volt-bg rounded" />
              ) : booking ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-[11px] bg-volt-bg border border-volt-border grid place-items-center text-2xl">🚴</div>
                    <div>
                      <p className="font-display font-semibold text-volt-text">{booking.bikes?.name}</p>
                      <p className="text-sm text-volt-dim">{booking.bikes?.type}</p>
                      {booking.bikes?.stations && (
                        <p className="text-[13px] text-volt-faint">📍 {booking.bikes.stations.name}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[13px] text-volt-dim leading-relaxed mb-4">
                    Started: {new Date(booking.start_time).toLocaleString()}<br />
                    Return by: {new Date(booking.expected_return).toLocaleString()}<br />
                    Duration: {booking.duration_weeks} week{booking.duration_weeks > 1 ? 's' : ''}<br />
                    Paid: ${booking.amount_paid ? Number(booking.amount_paid).toFixed(2) : '—'}
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={returning}
                    onClick={handleReturn}
                  >
                    Return bike
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-volt-dim text-sm mb-3">No active rental.</p>
                  <Link to="/bikes">
                    <Button size="sm">Find a bike</Button>
                  </Link>
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
