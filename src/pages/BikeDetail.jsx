import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Badge, { statusBadge } from '../components/ui/Badge'

export default function BikeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isActive, subscription } = useSubscription()
  const [bike, setBike] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

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
    if (!isActive) return navigate('/subscribe')

    setBooking(true)
    setError('')

    const expectedReturn = new Date()
    expectedReturn.setDate(expectedReturn.getDate() + 1)

    const { error: bookErr } = await supabase.from('bookings').insert({
      user_id: user.id,
      bike_id: bike.id,
      subscription_id: subscription.id,
      start_time: new Date().toISOString(),
      expected_return: expectedReturn.toISOString(),
      status: 'active',
    })

    if (bookErr) {
      setError(bookErr.message)
      setBooking(false)
      return
    }

    // Update bike status
    await supabase.from('bikes').update({ status: 'rented' }).eq('id', bike.id)
    navigate('/dashboard')
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
                  <p className="text-gray-500 text-sm mb-3">
                    <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to book this bike.
                  </p>
                )}
                {user && !isActive && (
                  <p className="text-gray-500 text-sm mb-3">
                    You need an <Link to="/subscribe" className="text-primary-600 hover:underline">active subscription</Link> to book.
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={handleBook}
                  loading={booking}
                  disabled={!user || !isActive}
                >
                  Book Now
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
