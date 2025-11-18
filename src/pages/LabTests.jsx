import { useState } from 'react'
import { Calendar, MapPin, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TEST_CATEGORIES = [
  'Full Body Checkup',
  'Blood Test',
  'Diabetes Panel',
  'Thyroid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Lipid Profile',
  'Vitamin D & B12',
]

const LabTests = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    category: '',
    date: (() => {
      const d = new Date()
      return d.toISOString().slice(0, 10)
    })(),
    location: '',
    prescription: null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.category) params.set('category', form.category)
    if (form.date) params.set('date', form.date)
    if (form.location) params.set('location', form.location)
    navigate(`/lab-tests?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">Book Lab Tests</h1>
        <p className="mt-2 text-white/90">Home sample collection • Accurate reports</p>
      </div>

      {/* Quick Booking Form */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">Book your test</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Test Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select</option>
              {TEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Date</label>
            <div className="relative">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Location/Pincode</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-12">
            <label className="block text-xs font-medium text-gray-600 mb-1">Upload Prescription (optional)</label>
            <label className="flex items-center gap-2 w-full cursor-pointer rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-sm hover:border-sky-400">
              <Upload size={16} className="text-gray-500" />
              <span className="truncate">{form.prescription?.name || 'Choose file'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setForm((f) => ({ ...f, prescription: e.target.files?.[0] || null }))}
              />
            </label>
          </div>
          <div className="md:col-span-12 flex items-center justify-center">
            <button
              type="submit"
              className="w-60 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-red-700 text-white font-semibold py-2 shadow-sm"
            >
              Book Now
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default LabTests




