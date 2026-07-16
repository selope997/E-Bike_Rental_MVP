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

  // Highlight the most expensive plan (the "best value" lime-gradient card)
  const highlightId = plans.length
    ? plans.reduce((max, p) => (Number(p.price) > Number(max.price) ? p : max), plans[0]).id
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="font-display font-bold text-[34px] mb-2">Choose your plan</h1>
        <p className="text-volt-dim mb-8">Unlock unlimited bike access with a subscription.</p>

        {isActive && (
          <div className="mb-6 bg-accent/10 border border-accent/25 text-accent rounded-xl px-[18px] py-3.5 text-sm">
            You already have an active <strong>{subscription?.subscription_plans?.name}</strong> subscription
            valid until{' '}
            <strong>{new Date(subscription?.period_end).toLocaleDateString()}</strong>.{' '}
            <button onClick={() => navigate('/dashboard')} className="underline font-medium">
              Go to Dashboard
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg text-sm">
            {error}
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-16 text-volt-faint">
            No plans available yet. Add plans in the Supabase database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => {
              const highlighted = plan.id === highlightId
              return highlighted ? (
                <div
                  key={plan.id}
                  className="rounded-2xl p-8 flex flex-col text-volt-bg"
                  style={{ background: 'linear-gradient(160deg,#d4ff3f,#a8e600)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display font-semibold text-2xl">{plan.name}</h2>
                    <span className="bg-volt-bg text-accent text-xs font-bold rounded-full px-3 py-1">BEST VALUE</span>
                  </div>
                  <div className="font-display font-bold text-[44px]">${plan.price}</div>
                  <p className="text-sm opacity-80 mb-8">{plan.duration_days} days</p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="mt-auto !bg-volt-bg !text-accent !border-transparent hover:!bg-black"
                    loading={loading === plan.id}
                    disabled={!!loading || isActive}
                    onClick={() => handleSelect(plan)}
                  >
                    {isActive ? 'Already subscribed' : 'Subscribe with Stripe'}
                  </Button>
                </div>
              ) : (
                <div key={plan.id} className="bg-volt-surface border border-volt-border rounded-2xl p-8 flex flex-col">
                  <h2 className="font-display font-semibold text-2xl mb-1">{plan.name}</h2>
                  <div className="font-display font-bold text-[44px]">${plan.price}</div>
                  <p className="text-sm text-volt-dim mb-8">{plan.duration_days} days</p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="mt-auto"
                    loading={loading === plan.id}
                    disabled={!!loading || isActive}
                    onClick={() => handleSelect(plan)}
                  >
                    {isActive ? 'Already subscribed' : 'Subscribe with Stripe'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
