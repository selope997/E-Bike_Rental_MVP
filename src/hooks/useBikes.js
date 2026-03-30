import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBikes({ stationId, status, dateRange } = {}) {
  const [bikes, setBikes] = useState([])
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBikes()
    fetchStations()
  }, [stationId, status, dateRange?.from, dateRange?.to])

  async function fetchBikes() {
    setLoading(true)

    let bookedIds = []
    if (dateRange?.from && dateRange?.to) {
      const { data: booked } = await supabase
        .from('bookings')
        .select('bike_id')
        .eq('status', 'active')
        .lt('start_time', dateRange.to)
        .gt('expected_return', dateRange.from)
      bookedIds = (booked || []).map(b => b.bike_id)
    }

    let query = supabase.from('bikes').select('*, stations(name, address)')

    if (dateRange?.from && dateRange?.to) {
      query = query.neq('status', 'maintenance')
    }
    if (stationId) query = query.eq('station_id', stationId)
    if (status) query = query.eq('status', status)
    if (bookedIds.length > 0) {
      query = query.not('id', 'in', `(${bookedIds.join(',')})`)
    }

    const { data } = await query.order('name')
    setBikes(data || [])
    setLoading(false)
  }

  async function fetchStations() {
    const { data } = await supabase.from('stations').select('*').order('name')
    setStations(data || [])
  }

  return { bikes, stations, loading, refresh: fetchBikes }
}
