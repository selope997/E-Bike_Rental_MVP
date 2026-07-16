import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'

export default function ResetPassword() {
  const { user, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Supabase parses the recovery token from the URL and establishes a temporary
  // session asynchronously. Wait for it to settle before deciding the link is valid.
  useEffect(() => {
    if (user) {
      setReady(true)
      return
    }
    const t = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(t)
  }, [user])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(form.password)
      await signOut()
      navigate('/login?reset=success')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-volt-bg">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-volt-surface border border-volt-border rounded-[18px] p-8">
          {!ready ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
            </div>
          ) : !user ? (
            <>
              <h1 className="font-display font-bold text-[26px] mb-2">Link invalid or expired</h1>
              <p className="text-volt-dim text-sm mb-6">
                This password reset link is invalid or has expired. Request a new one to continue.
              </p>
              <Link to="/forgot-password">
                <Button size="lg" className="w-full">Request a new link</Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-[26px] mb-2">Set a new password</h1>
              <p className="text-volt-dim text-sm mb-6">Choose a new password for your account.</p>

              {error && (
                <div className="mb-4 p-3 bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">New password</label>
                  <input
                    type="password" name="password" value={form.password} onChange={handleChange} required
                    className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Confirm password</label>
                  <input
                    type="password" name="confirm" value={form.confirm} onChange={handleChange} required
                    className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Re-enter your password"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Update password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
