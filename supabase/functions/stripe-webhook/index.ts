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
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(sub)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') return

  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)

  // Find matching plan by stripe_price_id
  const priceId = stripeSub.items.data[0]?.price.id
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id, duration_days')
    .eq('stripe_price_id', priceId)
    .single()

  const periodStart = new Date(stripeSub.current_period_start * 1000).toISOString()
  const periodEnd = plan
    ? new Date(Date.now() + plan.duration_days * 86400000).toISOString()
    : new Date(stripeSub.current_period_end * 1000).toISOString()

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan_id: plan?.id ?? null,
    stripe_subscription_id: stripeSub.id,
    stripe_customer_id: session.customer as string,
    status: 'active',
    period_start: periodStart,
    period_end: periodEnd,
  }, { onConflict: 'stripe_subscription_id' })
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const status = sub.status === 'active' ? 'active'
    : sub.status === 'past_due' ? 'past_due'
    : sub.status === 'canceled' ? 'canceled'
    : 'unpaid'

  await supabase.from('subscriptions').update({
    status,
    period_start: new Date(sub.current_period_start * 1000).toISOString(),
    period_end: new Date(sub.current_period_end * 1000).toISOString(),
  }).eq('stripe_subscription_id', sub.id)
}
