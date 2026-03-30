import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const steps = [
  { icon: '📝', title: 'Register', desc: 'Create your account and select your delivery platform.' },
  { icon: '💳', title: 'Subscribe', desc: 'Pick a weekly or monthly plan via Stripe.' },
  { icon: '🚴', title: 'Ride', desc: 'Pick up your e-bike from a nearby station and start delivering.' },
  { icon: '🔄', title: 'Return', desc: 'Return the bike to any station when you\'re done.' },
]

const plans = [
  { name: 'Weekly', price: 95, desc: 'Perfect for trying out. 7 days of unlimited riding.' },
  { name: 'Monthly', price: 280, desc: 'Best value. 30 days, priority bike selection.' },
]

export default function Home() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(tomorrow)

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/bikes?from=${fromDate}&to=${toDate}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            E-Bikes for Delivery Drivers
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Affordable weekly and monthly e-bike subscriptions designed for DoorDash, Uber Eats,
            and independent delivery workers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors text-lg"
            >
              Get Started
            </Link>
            <Link
              to="/bikes"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Browse Bikes
            </Link>
          </div>
        </div>
      </section>

      {/* Date Range Search */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Check Availability</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">No account needed — pick your dates and see available bikes.</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end justify-center">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">From</label>
              <input
                type="date"
                value={fromDate}
                min={today}
                onChange={e => {
                  setFromDate(e.target.value)
                  if (toDate < e.target.value) setToDate(e.target.value)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">To</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              Search Available Bikes
            </button>
          </form>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-5xl font-extrabold text-primary-600 mb-2">
                  ${plan.price}
                </div>
                <p className="text-gray-500 mb-6 text-sm">{plan.desc}</p>
                <Link
                  to="/register"
                  className="block w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Start Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
