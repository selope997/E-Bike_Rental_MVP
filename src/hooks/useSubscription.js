import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
    if (user) fetchSubscription()
    else setLoading(false)
  }, [user])

  async function fetchPlans() {
    const { data } = await supabase.from('subscription_plans').select('*').order('price')
    setPlans(data || [])
  }

  async function fetchSubscription() {
    setLoading(true)
    const { data } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setSubscription(data)
    setLoading(false)
  }

  const isActive = subscription?.status === 'active' &&
    new Date(subscription?.period_end) > new Date()

  return { subscription, plans, loading, isActive, refresh: fetchSubscription }
}
