import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const [form, setForm] = useState({ email: '', password: '' })
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
      await signIn(form)
      navigate('/dashboard')
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
          <h1 className="font-display font-bold text-[26px] mb-2">Welcome back</h1>
          <p className="text-volt-dim text-sm mb-6">Sign in to your account.</p>

          {resetSuccess && (
            <div className="mb-4 p-3 bg-accent/10 border border-accent/25 rounded-lg text-sm text-accent">
              Password updated. Sign in with your new password.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-volt-muted">Password</label>
                <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" name="password" value={form.password} onChange={handleChange} required
                className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Your password"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-volt-dim">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
