import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, MapPin, Phone } from 'lucide-react'

const HealthInsurance = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    city: '',
    coverage: '500000',
    phone: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    Object.entries(form).forEach(([k, v]) => v && params.set(k, v))
    navigate(`/health-insurance?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-white" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Health Insurance</h1>
            <p className="mt-1 text-white/90">Compare plans • Cashless claims • 24x7 assistance</p>
          </div>
        </div>
      </div>

      {/* Quick Quote Form */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">Get a quick quote</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Your name"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
            <input
              type="number"
              min="1"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="Age"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
            <div className="relative">
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Enter city"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                required
              />
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Coverage Amount</label>
            <select
              value={form.coverage}
              onChange={(e) => setForm((f) => ({ ...f, coverage: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="300000">₹3 Lakh</option>
              <option value="500000">₹5 Lakh</option>
              <option value="700000">₹7 Lakh</option>
              <option value="1000000">₹10 Lakh</option>
              <option value="2000000">₹20 Lakh</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <div className="relative">
              <input
                type="tel"
                pattern="[0-9]{10}"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit number"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                required
              />
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-12 flex items-center justify-center">
            <button
              type="submit"
              className="w-60 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 shadow-sm"
            >
              Compare Plans
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default HealthInsurance








