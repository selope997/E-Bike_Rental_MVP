import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Missing Stripe publishable key. Check your .env file.')
}

export const stripePromise = loadStripe(stripePublishableKey || 'pk_test_placeholder')

/**
 * Redirect to Stripe Checkout for a given price ID.
 * The Edge Function creates the session and returns the URL.
 */
export async function redirectToCheckout({ priceId, userId, successUrl, cancelUrl }) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ priceId, userId, successUrl, cancelUrl }),
    }
  )

  const { url, error } = await response.json()
  if (error) throw new Error(error)
  window.location.href = url
}

/**
 * Redirect to Stripe Checkout for a per-booking one-time payment.
 * Pricing is calculated server-side: <4 weeks = $95/wk, >=4 weeks = $70/wk.
 */
export async function redirectToBookingCheckout({ bikeId, userId, durationWeeks, successUrl, cancelUrl }) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ bikeId, userId, durationWeeks, successUrl, cancelUrl }),
    }
  )

  const { url, error } = await response.json()
  if (error) throw new Error(error)
  window.location.href = url
}
