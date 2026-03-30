import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Badge, { statusBadge } from '../components/ui/Badge'
import { useBikes } from '../hooks/useBikes'

export default function Bikes() {
  const [selectedStation, setSelectedStation] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  const { bikes, stations, loading } = useBikes({
    stationId: selectedStation || undefined,
    dateRange: fromDate && toDate ? { from: fromDate, to: toDate } : undefined,
  })

  function clearDateFilter() {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Browse Bikes</h1>
          <select
            value={selectedStation}
            onChange={e => setSelectedStation(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Stations</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {fromDate && toDate && (
          <div className="flex items-center gap-3 mb-6 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-sm text-primary-800 w-fit">
            <span>Showing availability from <strong>{fromDate}</strong> to <strong>{toDate}</strong></span>
            <button
              onClick={clearDateFilter}
              className="text-primary-600 hover:text-primary-800 font-medium underline"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : bikes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {fromDate && toDate
              ? 'No bikes available for the selected dates.'
              : 'No bikes found at this station.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.map(bike => {
              const badge = statusBadge(bike.status)
              return (
                <Link key={bike.id} to={`/bikes/${bike.id}`} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {bike.image_url ? (
                      <img src={bike.image_url} alt={bike.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-6xl">
                        🚴
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {bike.name}
                        </h3>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{bike.type}</p>
                      {bike.stations && (
                        <p className="text-xs text-gray-400 mt-1">📍 {bike.stations.name}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
