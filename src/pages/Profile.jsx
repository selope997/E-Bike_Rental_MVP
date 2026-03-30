import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Card, { CardHeader, CardBody } from '../components/ui/Card'

const platforms = [
  { value: 'doordash', label: 'DoorDash' },
  { value: 'ubereats', label: 'Uber Eats' },
  { value: 'other', label: 'Other / Independent' },
]

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    delivery_platform: profile?.delivery_platform || 'other',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    const { error: err } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', user.id)

    if (err) setError(err.message)
    else {
      setSuccess(true)
      refreshProfile()
    }
    setSaving(false)
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            returnUrl: window.location.href,
          }),
        }
      )
      const { url, error } = await response.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      setError(err.message)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Account Info</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 mb-4">{user?.email}</p>

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  Profile updated successfully.
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    name="full_name" value={form.full_name} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Platform</label>
                  <select
                    name="delivery_platform" value={form.delivery_platform} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {platforms.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" loading={saving}>Save Changes</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 mb-4">
                Manage your billing, view invoices, and update payment method via the Stripe Customer Portal.
              </p>
              <Button variant="secondary" loading={portalLoading} onClick={handlePortal}>
                Open Billing Portal
              </Button>
            </CardBody>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
