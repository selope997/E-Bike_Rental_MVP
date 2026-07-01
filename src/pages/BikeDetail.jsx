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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </div>
    )
  }

  if (!bike) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-500">Bike not found.</div>
      </div>
    )
  }

  const badge = statusBadge(bike.status)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link to="/bikes" className="text-sm text-primary-600 hover:underline mb-6 inline-block">
          ← Back to bikes
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {bike.image_url ? (
            <img src={bike.image_url} alt={bike.name} className="w-full h-72 object-cover" />
          ) : (
            <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-8xl">🚴</div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{bike.name}</h1>
                <p className="text-gray-500 mt-1">{bike.type}</p>
              </div>
              <Badge variant={badge.variant} className="text-sm px-3 py-1">{badge.label}</Badge>
            </div>

            {bike.stations && (
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <span>📍</span>
                <span>{bike.stations.name} — {bike.stations.address}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {bike.status === 'available' ? (
              <div>
                {!user && (
                  <p className="text-gray-500 text-sm mb-4">
                    <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to book this bike.
                  </p>
                )}

                {/* Duration selector */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Duration (weeks)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDurationWeeks(w => Math.max(1, w - 1))}
                      className="w-9 h-9 rounded-lg border border-gray-300 text-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-8 text-center">{durationWeeks}</span>
                    <button
                      type="button"
                      onClick={() => setDurationWeeks(w => Math.min(12, w + 1))}
                      className="w-9 h-9 rounded-lg border border-gray-300 text-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-400 ml-1">max 12 weeks</span>
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {durationWeeks} week{durationWeeks > 1 ? 's' : ''} × ${rate}/week
                    </span>
                    <span className="text-lg font-bold text-gray-900">${totalCost}</span>
                  </div>
                  {durationWeeks < 4 ? (
                    <p className="text-xs text-primary-600 mt-2">
                      Tip: book 4+ weeks to drop to $70/week — save ${savingsIfBulk} total.
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-2">
                      Bulk rate applied — $70/week.
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={handleBook}
                  loading={booking}
                  disabled={!user}
                >
                  Book Now — ${totalCost}
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">This bike is currently not available.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
