import { useMemo, useState } from 'react'
import { Calendar, MapPin, Search, Stethoscope, ChevronRight, BookOpenCheck } from 'lucide-react'
import { useQuery } from 'react-query'
import api from '../services/api'
import toast from 'react-hot-toast'
import DoctorCard from '../components/doctor/DoctorCard'
import DoctorBookingModal from '../components/doctor/DoctorBookingModal'
import { getAccessToken } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const DEFAULT_SPECIALTIES = [
  'General Physician',
  'Dermatology',
  'Cardiology',
  'Orthopedics',
  'ENT',
  'Neurology',
  'Gynecology',
  'Pediatrics',
  'Psychiatry',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology'
]

const DoctorAppointment = () => {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    specialty: '',
    date: today,
    location: '',
    search: ''
  })
  const [filters, setFilters] = useState({ date: today })
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const navigate = useNavigate()
  const hasToken = Boolean(getAccessToken())

  const { data: specialtiesData } = useQuery(
    ['doctor-specialties'],
    async () => {
      const response = await api.get('/doctors/specialties')
      return response.data?.data || []
    },
    { 
      staleTime: 5 * 60 * 1000,
      onError: (err) => {
        console.warn('Failed to fetch specialties', err)
        toast.error('Showing default specialties while we reconnect.')
      }
    }
  )

  const specialties = useMemo(() => {
    if (Array.isArray(specialtiesData) && specialtiesData.length > 0) {
      return specialtiesData
    }
    return DEFAULT_SPECIALTIES
  }, [specialtiesData])

  const {
    data: doctors,
    isLoading,
    isFetching
  } = useQuery(
    ['doctors', filters],
    async () => {
      const response = await api.get('/doctors', {
        params: {
          specialty: filters.specialty || undefined,
          city: filters.location || undefined,
          search: filters.search || undefined
        }
      })
      return response.data?.data || []
    },
    {
      keepPreviousData: true
    }
  )

  const { data: myAppointments } = useQuery(
    ['my-appointments'],
    async () => {
      const response = await api.get('/appointments/my')
      return response.data?.data || []
    },
    {
      enabled: hasToken
    }
  )

  const handleSpecialtySelect = (value) => {
    setForm((prev) => {
      const next = { ...prev, specialty: value }
      return next
    })
    setFilters((prev) => ({ ...prev, specialty: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFilters({ ...form })
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Find the right doctor for your ailments</h1>
            <p className="mt-2 text-white/90">Book online or in-clinic consultations with trusted specialists.</p>
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

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Browse by Specialties</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {specialties?.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSpecialtySelect(name)}
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

      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">Find a Doctor in 3 easy steps</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Specialty</label>
            <select
              value={form.specialty}
              onChange={(e) => handleSpecialtySelect(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200"
            >
              <option value="">Any</option>
              {specialties?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Date</label>
            <div className="relative">
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-3">
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
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Doctor / Symptom</label>
            <input
              type="text"
              value={form.search}
              onChange={(e) => setForm((f) => ({ ...f, search: e.target.value }))}
              placeholder="eg. Migraine"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-200"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold py-2.5 shadow-sm"
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Available Doctors</h3>
          {isFetching && <p className="text-sm text-gray-500">Refreshing...</p>}
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-medical-200 border-t-medical-600" />
          </div>
        ) : doctors?.length ? (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} onSelect={setSelectedDoctor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <BookOpenCheck className="mx-auto text-gray-300" size={40} />
            <p className="mt-3 text-lg font-semibold text-gray-900">No doctors match your filters</p>
            <p className="text-gray-600">Try changing the specialty or location to see more results.</p>
          </div>
        )}
      </section>

      {hasToken && myAppointments?.length ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Upcoming Consultations</h3>
          <div className="space-y-3">
            {myAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100 rounded-xl p-4"
              >
                <div>
                  <p className="text-sm text-gray-500">Dr. {appointment.doctor?.name}</p>
                  <p className="text-base font-semibold text-gray-900">{appointment.doctor?.specialty}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(appointment.date).toLocaleDateString()} • {appointment.slot} ({appointment.mode})
                  </p>
                </div>
                <span className="mt-2 md:mt-0 inline-flex items-center px-3 py-1 text-xs rounded-full bg-medical-50 text-medical-700 capitalize">
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold">Ask anything about your health.</h3>
            <p className="text-white/90 mt-1">Get trusted answers directly from doctors.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!hasToken) {
                navigate('/login?redirect=/doctor-appointment')
                return
              }
              toast.success('A care specialist will connect with you shortly.')
            }}
            className="rounded-xl bg-white text-purple-700 font-semibold px-4 py-2 hover:bg-white/90"
          >
            Ask Now
          </button>
        </div>
      </div>

      {selectedDoctor && (
        <DoctorBookingModal
          doctor={selectedDoctor}
          defaultDate={filters.date}
          onClose={() => setSelectedDoctor(null)}
          onSuccess={() => setFilters((prev) => ({ ...prev }))}
        />
      )}
    </div>
  )
}

export default DoctorAppointment






