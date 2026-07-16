import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'

const platforms = [
  { value: 'doordash', label: 'DoorDash' },
  { value: 'ubereats', label: 'Uber Eats' },
  { value: 'other', label: 'Other / Independent' },
]

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '', deliveryPlatform: 'doordash',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(form)
      navigate('/subscribe')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-volt-bg">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-volt-surface border border-volt-border rounded-[18px] p-8">
          <h1 className="font-display font-bold text-[26px] mb-2">Create account</h1>
          <p className="text-volt-dim text-sm mb-6">Start your e-bike subscription today.</p>

          {error && (
            <div className="mb-4 p-3 bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Full name</label>
              <input
                name="fullName" value={form.fullName} onChange={handleChange} required
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Phone</label>
              <input
                name="phone" value={form.phone} onChange={handleChange}
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Delivery platform</label>
              <select
                name="deliveryPlatform" value={form.deliveryPlatform} onChange={handleChange}
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {platforms.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-volt-dim">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
