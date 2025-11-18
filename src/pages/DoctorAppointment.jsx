import { useMemo, useState } from 'react'
import { Calendar, MapPin, Search, Stethoscope, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SPECIALTIES = [
  'General Physician','Dermatology','Orthopedics','ENT','Neurology','Cardiology','Urology','Gastroenterology',
  'Psychiatry','Pediatrics','Pulmonology','Endocrinology','Nephrology','Neurosurgery','Rheumatology','Ophthalmology',
  'Surgical Gastroenterology','Infectious Disease','Laparoscopy','Psychology','Medical Oncology','Diabetology','Dentist'
]

const DoctorAppointment = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    specialty: '',
    date: (() => {
      const today = new Date()
      return today.toISOString().slice(0,10)
    })(),
    location: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now just navigate to a search results placeholder
    const params = new URLSearchParams()
    if (form.specialty) params.set('specialty', form.specialty)
    if (form.date) params.set('date', form.date)
    if (form.location) params.set('location', form.location)
    navigate(`/doctor-appointment?${params.toString()}`)
  }

  const topSpecialties = useMemo(() => SPECIALTIES, [])

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Find the right doctor for your ailments</h1>
            <p className="mt-2 text-white/90">Book online consultations with trusted specialists</p>
          </div>
          <div className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3">
            <Stethoscope className="text-white" />
            <div>
              <p className="text-sm">Need help booking?</p>
              <p className="font-semibold">Call +91-8040245807</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Grid */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Browse by Specialties</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {topSpecialties.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setForm((f) => ({ ...f, specialty: name }))}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left transition-all ${
                form.specialty === name
                  ? 'border-medical-500 bg-medical-50 text-medical-800'
                  : 'border-gray-200 bg-white hover:border-medical-300'
              }`}
            >
              <span className="truncate text-sm">{name}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </section>

      {/* Quick Search Form */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">Find a Doctor in 3 easy steps</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Specialty</label>
            <div className="relative">
              <select
                value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200"
              >
                <option value="">Any</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Date</label>
            <div className="relative">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Location/Pincode</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200"
              />
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold py-2.5 shadow-sm"
            >
              <Search size={16} />
              <span>Submit</span>
            </button>
          </div>
        </form>
      </section>

      {/* CTA Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold">Ask anything about your health.</h3>
            <p className="text-white/90 mt-1">Get trusted answers directly from doctors.</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-white text-purple-700 font-semibold px-4 py-2 hover:bg-white/90"
          >
            Ask Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointment





