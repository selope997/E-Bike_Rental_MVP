import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { redirectToCheckout } from '../lib/stripe'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

export default function Subscribe() {
  const { user } = useAuth()
  const { plans, isActive, subscription } = useSubscription()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  async function handleSelect(plan) {
    if (!plan.stripe_price_id) {
      setError('Plan not yet configured. Add the Stripe price ID in your database.')
      return
    }
    setError('')
    setLoading(plan.id)
    try {
      await redirectToCheckout({
        priceId: plan.stripe_price_id,
        userId: user.id,
        successUrl: `${window.location.origin}/dashboard?subscribed=true`,
        cancelUrl: `${window.location.origin}/subscribe`,
      })
    } catch (err) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-500 mb-8">Unlock unlimited bike access with a subscription.</p>

        {isActive && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            You already have an active <strong>{subscription?.subscription_plans?.name}</strong> subscription
            valid until{' '}
            <strong>{new Date(subscription?.period_end).toLocaleDateString()}</strong>.{' '}
            <button onClick={() => navigate('/dashboard')} className="underline font-medium">
              Go to Dashboard
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No plans available yet. Add plans in the Supabase database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <div className="text-4xl font-extrabold text-primary-600 mb-1">
                  ${plan.price}
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.duration_days} days</p>
                <Button
                  size="lg"
                  className="mt-auto"
                  loading={loading === plan.id}
                  disabled={!!loading || isActive}
                  onClick={() => handleSelect(plan)}
                >
                  {isActive ? 'Already Subscribed' : 'Subscribe with Stripe'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
