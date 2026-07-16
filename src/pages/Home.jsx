import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const steps = [
  { num: '01', title: 'Register', desc: 'Create your account and select your delivery platform.' },
  { num: '02', title: 'Subscribe', desc: 'Pick a weekly or monthly plan via Stripe.' },
  { num: '03', title: 'Ride', desc: 'Pick up your e-bike from a nearby station and start delivering.' },
  { num: '04', title: 'Return', desc: 'Return the bike to any station when you\'re done.' },
]

const plans = [
  { name: 'Weekly', price: 95, unit: '/week', desc: 'Perfect for trying out. 7 days of unlimited riding.' },
  { name: 'Monthly', price: 280, unit: '/month', desc: 'Best value. 30 days, priority bike selection.' },
]

const stats = [
  { value: '$95/wk', label: 'Starting rate' },
  { value: '60mi', label: 'Range per charge' },
  { value: '24/7', label: 'Roadside swap' },
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
    <div className="min-h-screen flex flex-col bg-volt-bg">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">

          {/* Hero */}
          <section className="grid md:grid-cols-[1.05fr_.95fr] gap-12 items-center py-16 md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 bg-volt-surface border border-volt-stroke text-[#c7ffbe] text-xs font-semibold rounded-full px-3.5 py-1.5">
                <span className="w-[7px] h-[7px] rounded-full bg-accent" />
                200+ bikes live across 6 stations
              </span>
              <h1 className="font-display font-bold text-[44px] sm:text-[56px] md:text-[66px] leading-[.98] tracking-[-.03em] mt-6">
                Power up every <span className="text-accent">delivery</span> shift.
              </h1>
              <p className="text-[17px] md:text-[19px] leading-relaxed text-volt-muted max-w-[460px] mt-5">
                Affordable weekly and monthly e-bike subscriptions built for DoorDash, Uber Eats,
                and independent delivery drivers.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to="/register"
                  className="bg-accent text-volt-bg hover:bg-accent-600 font-display font-bold px-7 py-[15px] rounded-xl transition-colors"
                >
                  Get started →
                </Link>
                <Link
                  to="/bikes"
                  className="border border-volt-outline text-volt-text hover:bg-volt-surface font-medium px-7 py-[15px] rounded-xl transition-colors"
                >
                  Browse bikes
                </Link>
              </div>
              <div className="flex gap-9 mt-10">
                {stats.map(s => (
                  <div key={s.label}>
                    <div className="font-display font-bold text-[30px] leading-none">{s.value}</div>
                    <div className="text-[13px] text-volt-faint mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image (drop a photo at public/hero.jpg; emoji panel shows until then) */}
            <div className="relative h-[320px] md:h-[440px] rounded-[20px] border border-volt-border overflow-hidden bg-volt-surface">
              {/* Fallback layer — sits behind the photo, revealed only if the image fails */}
              <div className="absolute inset-0 grid place-items-center text-8xl bg-gradient-to-br from-volt-surface to-volt-bg">
                🚴
              </div>
              <img
                src="/hero.jpg"
                alt="Delivery rider on an e-bike"
                className="relative z-10 w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          </section>

          {/* Availability */}
          <section className="pb-16">
            <div className="bg-volt-surface border border-volt-border rounded-[18px] p-7">
              <h2 className="font-display font-semibold text-xl">Check availability</h2>
              <p className="text-volt-dim text-sm mt-1 mb-5">No account needed — pick your dates.</p>
              <form onSubmit={handleSearch} className="grid sm:grid-cols-[1fr_1fr_auto] gap-[22px] items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-volt-muted">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    min={today}
                    onChange={e => {
                      setFromDate(e.target.value)
                      if (toDate < e.target.value) setToDate(e.target.value)
                    }}
                    className="bg-volt-bg border border-volt-stroke rounded-[10px] px-4 py-3 text-sm text-volt-text [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-volt-muted">To</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={e => setToDate(e.target.value)}
                    className="bg-volt-bg border border-volt-stroke rounded-[10px] px-4 py-3 text-sm text-volt-text [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-accent text-volt-bg hover:bg-accent-600 font-display font-bold px-6 py-3 rounded-[10px] transition-colors"
                >
                  Search bikes
                </button>
              </form>
            </div>
          </section>

          {/* How it works */}
          <section className="py-16">
            <h2 className="font-display font-bold text-[28px] md:text-[34px] mb-10">Rolling in four steps</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(step => (
                <div key={step.num} className="bg-volt-surface border border-volt-border rounded-2xl p-6">
                  <div className="font-display font-bold text-accent text-[26px]">{step.num}</div>
                  <h3 className="font-display font-semibold text-lg mt-3 mb-2">{step.title}</h3>
                  <p className="text-volt-dim text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="py-16">
            <h2 className="font-display font-bold text-[28px] md:text-[34px] mb-10">Simple pricing</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly — surface */}
              <div className="bg-volt-surface border border-volt-border rounded-2xl p-8 flex flex-col">
                <h3 className="font-display font-semibold text-xl">{plans[0].name}</h3>
                <div className="font-display font-bold text-[44px] mt-3">
                  ${plans[0].price}<span className="text-lg text-volt-dim font-sans font-normal">{plans[0].unit}</span>
                </div>
                <p className="text-volt-dim text-sm mt-2 mb-8">{plans[0].desc}</p>
                <Link
                  to="/register"
                  className="mt-auto block text-center border border-volt-outline text-volt-text hover:bg-volt-border font-medium py-3 rounded-xl transition-colors"
                >
                  Start now
                </Link>
              </div>

              {/* Monthly — lime gradient */}
              <div
                className="rounded-2xl p-8 flex flex-col text-volt-bg"
                style={{ background: 'linear-gradient(160deg,#d4ff3f,#a8e600)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-xl">{plans[1].name}</h3>
                  <span className="bg-volt-bg text-accent text-xs font-bold rounded-full px-3 py-1">BEST VALUE</span>
                </div>
                <div className="font-display font-bold text-[44px] mt-3">
                  ${plans[1].price}<span className="text-lg font-sans font-normal opacity-70">{plans[1].unit}</span>
                </div>
                <p className="text-sm mt-2 mb-8 opacity-80">{plans[1].desc}</p>
                <Link
                  to="/register"
                  className="mt-auto block text-center bg-volt-bg text-accent hover:bg-black font-display font-bold py-3 rounded-xl transition-colors"
                >
                  Start now
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
