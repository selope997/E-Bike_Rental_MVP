import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Bookings are the only payment flow. Ignore anything else (e.g. a
        // legacy subscription session still in flight) rather than letting it
        // reach the booking handler, which requires bikeId metadata.
        if (session.mode === 'payment' && session.metadata?.bikeId) {
          await handleBookingCheckoutCompleted(session)
        } else {
          console.log('Ignoring non-booking checkout session', session.id)
        }
        break
      }
    }
  } catch (err) {
    console.error('Handler error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})

async function handleBookingCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, bikeId, durationWeeks: dStr, pickupDate } = session.metadata!
  const durationWeeks = parseInt(dStr, 10)

  if (!userId || !bikeId || isNaN(durationWeeks)) {
    console.error('Booking webhook: missing or invalid metadata', session.metadata)
    return
  }

  // Record what Stripe actually charged (server-authoritative, per-bike pricing
  // was computed in create-booking-session), so amount_paid can't drift.
  const amountPaid = ((session.amount_total ?? 0) / 100).toFixed(2)

  // Start from the chosen pickup date (noon UTC keeps the calendar day stable across
  // timezones); fall back to now for any in-flight session without the metadata.
  const startTime = pickupDate ? new Date(`${pickupDate}T12:00:00Z`) : new Date()
  const expectedReturn = new Date(startTime)
  expectedReturn.setDate(expectedReturn.getDate() + durationWeeks * 7)

  const { error: bookingError } = await supabase.from('bookings').insert({
    user_id: userId,
    bike_id: bikeId,
    duration_weeks: durationWeeks,
    amount_paid: amountPaid,
    stripe_payment_intent_id: session.payment_intent as string,
    start_time: startTime.toISOString(),
    expected_return: expectedReturn.toISOString(),
    status: 'active',
  })

  if (bookingError) {
    console.error('Failed to insert booking:', bookingError)
    throw new Error(bookingError.message)
  }

  const { error: bikeError } = await supabase
    .from('bikes')
    .update({ status: 'rented' })
    .eq('id', bikeId)

  if (bikeError) {
    console.error('Failed to update bike status:', bikeError)
  }
}
