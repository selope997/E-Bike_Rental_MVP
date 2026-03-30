import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Badge, { statusBadge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const emptyForm = { name: '', type: '', status: 'available', station_id: '', image_url: '' }

export default function AdminBikes() {
  const [bikes, setBikes] = useState([])
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [bikesRes, stationsRes] = await Promise.all([
      supabase.from('bikes').select('*, stations(name)').order('name'),
      supabase.from('stations').select('*').order('name'),
    ])
    setBikes(bikesRes.data || [])
    setStations(stationsRes.data || [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditId(null)
    setModal(true)
  }

  function openEdit(bike) {
    setForm({
      name: bike.name,
      type: bike.type || '',
      status: bike.status,
      station_id: bike.station_id || '',
      image_url: bike.image_url || '',
    })
    setEditId(bike.id)
    setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, station_id: form.station_id || null }
    if (editId) {
      await supabase.from('bikes').update(payload).eq('id', editId)
    } else {
      await supabase.from('bikes').insert(payload)
    }
    setSaving(false)
    setModal(false)
    fetchAll()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this bike?')) return
    await supabase.from('bikes').delete().eq('id', id)
    fetchAll()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bikes</h1>
        <Button onClick={openCreate}>+ Add Bike</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Station</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bikes.map(bike => {
                const b = statusBadge(bike.status)
                return (
                  <tr key={bike.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{bike.name}</td>
                    <td className="px-4 py-3 text-gray-600">{bike.type}</td>
                    <td className="px-4 py-3 text-gray-600">{bike.stations?.name || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={b.variant}>{b.label}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(bike)} className="text-primary-600 hover:underline text-xs font-medium mr-3">Edit</button>
                      <button onClick={() => handleDelete(bike.id)} className="text-red-600 hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Bike' : 'Add Bike'}>
        <div className="space-y-3">
          {[['name', 'Name'], ['type', 'Type (e.g. Electric Mountain)'], ['image_url', 'Image URL']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
            <select
              value={form.station_id}
              onChange={e => setForm(f => ({ ...f, station_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No station</option>
              {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving}>Save</Button>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
