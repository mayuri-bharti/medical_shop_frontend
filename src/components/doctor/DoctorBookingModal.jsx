import { useEffect, useState } from 'react'
import { Calendar, Loader2, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getAccessToken } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const formatDateForInput = (date) => date.toISOString().slice(0, 10)

const DoctorBookingModal = ({ doctor, defaultDate, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(defaultDate || formatDateForInput(new Date()))
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedMode, setSelectedMode] = useState(doctor?.modes?.[0] || 'in-person')
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    setSelectedSlot('')
    setSelectedMode(doctor?.modes?.[0] || 'in-person')
  }, [doctor, selectedDate])

  const { data: slotData, isFetching } = useQuery(
    ['doctor-slots', doctor?._id, selectedDate],
    async () => {
      const response = await api.get(`/doctors/${doctor._id}/slots`, {
        params: { date: selectedDate }
      })
      return response.data?.data || []
    },
    { enabled: Boolean(doctor?._id && selectedDate) }
  )

  const handleBooking = () => {
    if (!getAccessToken()) {
      toast.error('Please login to book an appointment')
      navigate('/login?redirect=/doctor-appointment')
      return
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    mutation.mutate()
  }

  const mutation = useMutation(
    async () => {
      if (!getAccessToken()) {
        throw new Error('LOGIN_REQUIRED')
      }
      
      const payload = {
        doctorId: doctor._id,
        date: selectedDate,
        slot: selectedSlot,
        mode: selectedMode
      }
      
      if (reason) {
        payload.reason = reason
      }

      const response = await api.post('/appointments', payload)
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success('Appointment booked successfully!')
        queryClient.invalidateQueries(['my-appointments'])
        queryClient.invalidateQueries(['doctor-slots', doctor._id, selectedDate])
        queryClient.invalidateQueries(['doctors'])
        onSuccess?.()
        onClose()
      },
      onError: (err) => {
        console.error('Booking error:', err)
        if (err.message === 'LOGIN_REQUIRED' || err.response?.status === 401) {
          toast.error('Please login to book an appointment')
          navigate('/login?redirect=/doctor-appointment')
          return
        }
        const errorMessage = err.response?.data?.message || err.message || 'Failed to book appointment'
        toast.error(errorMessage)
      }
    }
  )

  if (!doctor) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Booking with</p>
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-500">Select Date</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={selectedDate}
                  min={formatDateForInput(new Date())}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-100"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-500">Consultation Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-100"
              >
                {doctor.modes?.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-500">Reason for visit</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Skin allergy"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-medical-500 focus:ring-2 focus:ring-medical-100"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Available Slots</p>
            {isFetching ? (
              <div className="flex items-center gap-2 text-medical-600">
                <Loader2 className="animate-spin" size={18} />
                Fetching slots...
              </div>
            ) : slotData?.length ? (
              slotData.map((entry) => (
                <div key={`${entry.mode}-${entry.locationLabel}`} className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{entry.mode.toUpperCase()}</span>
                    <span>{entry.locationLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.slots.length ? (
                      entry.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedSlot === slot
                              ? 'border-medical-500 bg-medical-50 text-medical-700 shadow-sm'
                              : 'border-gray-200 text-gray-700 hover:border-medical-300 hover:bg-gray-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No slots left</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">
                  Doctor is not available on this day. Please select a different date.
                </p>
              </div>
            )}
            {selectedSlot && (
              <div className="mt-3 p-3 bg-medical-50 border border-medical-200 rounded-lg">
                <p className="text-sm text-medical-700">
                  <span className="font-semibold">Selected slot:</span> {selectedSlot}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <p className="text-xl font-bold text-gray-900">₹{doctor.consultationFee}</p>
          </div>
          <button
            disabled={!selectedSlot || mutation.isLoading}
            onClick={handleBooking}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-medical-600 px-6 py-2.5 text-white font-semibold hover:bg-medical-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {mutation.isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorBookingModal

