import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { redirectToBookingCheckout } from '../lib/stripe'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Badge, { statusBadge } from '../components/ui/Badge'

export default function BikeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bike, setBike] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(1)

  // Derived pricing
  const rate = durationWeeks < 4 ? 95 : 70
  const totalCost = rate * durationWeeks
  const savingsIfBulk = (95 - 70) * durationWeeks

  useEffect(() => {
    async function fetchBike() {
      const { data } = await supabase
        .from('bikes')
        .select('*, stations(name, address)')
        .eq('id', id)
        .single()
      setBike(data)
      setLoading(false)
    }
    fetchBike()
  }, [id])

  async function handleBook() {
    if (!user) return navigate('/login')

    setBooking(true)
    setError('')

    try {
      await redirectToBookingCheckout({
        bikeId: bike.id,
        userId: user.id,
        durationWeeks,
        successUrl: `${window.location.origin}/dashboard?booked=true`,
        cancelUrl: window.location.href,
      })
    } catch (err) {
      setError(err.message)
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </div>
    )
  }

  if (!bike) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-volt-dim">Bike not found.</div>
      </div>
    )
  }

  const badge = statusBadge(bike.status)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link to="/bikes" className="text-sm text-accent font-semibold hover:underline mb-6 inline-block">
          ← Back to bikes
        </Link>
        <div className="bg-volt-surface border border-volt-border rounded-[20px] overflow-hidden">
          {bike.image_url ? (
            <img src={bike.image_url} alt={bike.name} className="w-full h-[300px] object-cover" />
          ) : (
            <div className="w-full h-[300px] bg-volt-bg flex items-center justify-center text-8xl">🚴</div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display font-bold text-[34px]">{bike.name}</h1>
                <p className="text-volt-dim mt-1">{bike.type}</p>
              </div>
              <Badge variant={badge.variant} className="text-sm px-3 py-1">{badge.label}</Badge>
            </div>

            {bike.stations && (
              <div className="flex items-center gap-2 text-volt-muted mb-6">
                <span>📍</span>
                <span>{bike.stations.name} — {bike.stations.address}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg text-sm">
                {error}
              </div>
            )}

            {bike.status === 'available' ? (
              <div>
                {!user && (
                  <p className="text-volt-dim text-sm mb-4">
                    <Link to="/login" className="text-accent hover:underline">Sign in</Link> to book this bike.
                  </p>
                )}

                {/* Duration selector */}
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-volt-muted mb-2">
                    Rental duration (weeks)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDurationWeeks(w => Math.max(1, w - 1))}
                      className="w-10 h-10 rounded-[10px] border border-volt-outline text-lg font-bold text-volt-muted hover:bg-volt-border flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="font-display font-bold text-[26px] w-8 text-center">{durationWeeks}</span>
                    <button
                      type="button"
                      onClick={() => setDurationWeeks(w => Math.min(12, w + 1))}
                      className="w-10 h-10 rounded-[10px] border border-volt-outline text-lg font-bold text-volt-muted hover:bg-volt-border flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-sm text-volt-faint ml-1">max 12 weeks</span>
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="mb-5 p-[18px] rounded-[14px] bg-volt-bg border border-volt-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-volt-muted">
                      {durationWeeks} week{durationWeeks > 1 ? 's' : ''} × ${rate}/week
                    </span>
                    <span className="font-display font-bold text-[22px]">${totalCost}</span>
                  </div>
                  {durationWeeks < 4 ? (
                    <p className="text-[13px] text-accent mt-2">
                      Tip: book 4+ weeks to drop to $70/week — save ${savingsIfBulk} total.
                    </p>
                  ) : (
                    <p className="text-[13px] text-accent mt-2">
                      Bulk rate applied — $70/week.
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBook}
                  loading={booking}
                  disabled={!user}
                >
                  Book now — ${totalCost}
                </Button>
              </div>
            ) : (
              <p className="text-volt-dim text-sm">This bike is currently not available.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
