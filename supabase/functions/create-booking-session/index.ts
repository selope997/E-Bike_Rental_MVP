import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bikeId, userId, durationWeeks, successUrl, cancelUrl } = await req.json()

    if (!bikeId || !userId || !durationWeeks) {
      throw new Error('Missing required fields: bikeId, userId, durationWeeks')
    }

    const weeks = parseInt(durationWeeks, 10)
    if (isNaN(weeks) || weeks < 1 || weeks > 12) {
      throw new Error('durationWeeks must be an integer between 1 and 12')
    }

    // Server-side price calculation — never trust the client-supplied total
    const ratePerWeek = weeks < 4 ? 95 : 70
    const totalCents = weeks * ratePerWeek * 100

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `E-Bike Rental — ${weeks} week${weeks > 1 ? 's' : ''}`,
            description: `$${ratePerWeek}/week × ${weeks} week${weeks > 1 ? 's' : ''}`,
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        bikeId,
        durationWeeks: String(weeks),
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
