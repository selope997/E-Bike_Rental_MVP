import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
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
          <h1 className="font-display font-bold text-[26px] mb-2">Reset your password</h1>
          <p className="text-volt-dim text-sm mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="p-4 bg-accent/10 border border-accent/25 rounded-lg text-sm text-accent">
              If an account exists for <strong>{email}</strong>, we've sent a reset link. Check your inbox.
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-volt-muted mb-1.5">Email</label>
                  <input
                    type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 text-sm text-volt-text placeholder:text-volt-faint focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          )}

          <p className="mt-4 text-center text-sm text-volt-dim">
            Remember your password?{' '}
            <Link to="/login" className="text-accent hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
