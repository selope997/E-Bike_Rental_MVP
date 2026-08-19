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

    // Server-side price calculation — read the bike's prices from the DB,
    // never trust any client-supplied total.
    const { data: bike, error: bikeError } = await supabase
      .from('bikes')
      .select('price_per_week, price_per_week_bulk')
      .eq('id', bikeId)
      .single()

    if (bikeError || !bike) {
      throw new Error('Bike not found')
    }

    const ratePerWeek = weeks < 4 ? Number(bike.price_per_week) : Number(bike.price_per_week_bulk)
    const totalCents = Math.round(weeks * ratePerWeek * 100)

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
