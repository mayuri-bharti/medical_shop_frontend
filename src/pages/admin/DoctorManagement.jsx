import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Plus, ShieldCheck, Stethoscope, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const blankDoctor = {
  name: '',
  specialty: '',
  consultationFee: 500,
  experienceYears: 5,
  languages: ['English'],
  modes: ['in-person'],
  availability: [],
  locations: []
}

const DoctorManagement = () => {
  const [form, setForm] = useState(blankDoctor)
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 1,
    slots: '10:00,11:00,12:00',
    mode: 'in-person',
    locationLabel: 'Primary Clinic'
  })
  const queryClient = useQueryClient()

  const { data: doctors, isLoading } = useQuery(['admin-doctors'], async () => {
    const response = await api.get('/admin/doctors')
    return response.data?.data || []
  })

  const createMutation = useMutation(
    async (payload) => api.post('/admin/doctors', payload),
    {
      onSuccess: () => {
        toast.success('Doctor profile created')
        setForm(blankDoctor)
        setAvailabilityForm({
          dayOfWeek: 1,
          slots: '10:00,11:00,12:00',
          mode: 'in-person',
          locationLabel: 'Primary Clinic'
        })
        queryClient.invalidateQueries(['admin-doctors'])
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create doctor')
      }
    }
  )

  const statusMutation = useMutation(
    ({ id, isActive }) => api.patch(`/admin/doctors/${id}/status`, { isActive }),
    {
      onSuccess: () => {
        toast.success('Doctor status updated')
        queryClient.invalidateQueries(['admin-doctors'])
      },
      onError: () => toast.error('Failed to update status')
    }
  )

  const handleAddAvailability = () => {
    if (!availabilityForm.slots.trim()) {
      toast.error('Add at least one slot')
      return
    }
    setForm((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        {
          dayOfWeek: Number(availabilityForm.dayOfWeek),
          slots: availabilityForm.slots.split(',').map((slot) => slot.trim()),
          mode: availabilityForm.mode,
          locationLabel: availabilityForm.locationLabel
        }
      ]
    }))
    toast.success('Schedule added')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.specialty || !form.availability.length) {
      toast.error('Name, specialty and availability are required')
      return
    }
    const payload = {
      ...form,
      languages: form.languages.filter(Boolean),
      locations: form.locations.length
        ? form.locations
        : [{ label: 'Clinic', city: 'Bengaluru', address: 'HSR Layout' }]
    }
    createMutation.mutate(payload)
  }

  const days = useMemo(
    () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    []
  )

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Doctor</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Specialty *</label>
            <input
              type="text"
              value={form.specialty}
              onChange={(e) => setForm((prev) => ({ ...prev, specialty: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Experience (years)</label>
            <input
              type="number"
              min="0"
              value={form.experienceYears}
              onChange={(e) => setForm((prev) => ({ ...prev, experienceYears: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Consultation Fee</label>
            <input
              type="number"
              min="0"
              value={form.consultationFee}
              onChange={(e) => setForm((prev) => ({ ...prev, consultationFee: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600">Languages (comma separated)</label>
            <input
              type="text"
              value={form.languages.join(', ')}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, languages: e.target.value.split(',').map((s) => s.trim()) }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Stethoscope size={18} />
              Availability
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500">Day</label>
                <select
                  value={availabilityForm.dayOfWeek}
                  onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm"
                >
                  {days.map((day, index) => (
                    <option value={index} key={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Slots (comma separated)</label>
                <input
                  type="text"
                  value={availabilityForm.slots}
                  onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, slots: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Mode</label>
                <select
                  value={availabilityForm.mode}
                  onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, mode: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm"
                >
                  <option value="in-person">In-person</option>
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Location Label</label>
                <input
                  type="text"
                  value={availabilityForm.locationLabel}
                  onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, locationLabel: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddAvailability}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-medical-600 shadow-sm"
            >
              <Plus size={16} /> Add to schedule
            </button>
            {form.availability.length > 0 && (
              <div className="text-xs text-gray-600">
                {form.availability.length} slot group(s) added
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-medical-600 px-6 py-2 text-white font-semibold hover:bg-medical-700 disabled:opacity-60"
            >
              {createMutation.isLoading && <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />}
              Create Doctor
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Doctor Directory</h2>
          <span className="text-sm text-gray-500">{doctors?.length || 0} doctors</span>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-medical-200 border-t-medical-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {doctors?.map((doctor) => (
              <div
                key={doctor._id}
                className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{doctor.name}</p>
                  <p className="text-xs text-gray-500">{doctor.specialty}</p>
                  <p className="text-xs text-gray-500">{doctor.availability?.length || 0} schedule blocks</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-800">₹{doctor.consultationFee}</span>
                  <button
                    onClick={() => statusMutation.mutate({ id: doctor._id, isActive: !doctor.isActive })}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    {doctor.isActive ? (
                      <>
                        <ToggleRight size={16} className="text-green-500" /> Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} className="text-gray-400" /> Disabled
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {(!doctors || doctors.length === 0) && (
              <div className="text-center text-gray-500 py-6">
                <ShieldCheck className="mx-auto text-gray-300" size={32} />
                <p className="mt-2 text-sm">No doctors added yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorManagement

