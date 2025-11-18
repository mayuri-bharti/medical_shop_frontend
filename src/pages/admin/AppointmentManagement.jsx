import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { CalendarDays, CheckCircle2, Clock3, User } from 'lucide-react'

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-50 text-red-600'
}

const AppointmentManagement = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin-appointments', statusFilter],
    async () => {
      const response = await api.get('/admin/appointments', {
        params: statusFilter === 'all' ? {} : { status: statusFilter }
      })
      return response.data?.data || []
    }
  )

  const updateMutation = useMutation(
    ({ id, status }) => api.patch(`/admin/appointments/${id}/status`, { status }),
    {
      onSuccess: () => {
        toast.success('Appointment updated')
        queryClient.invalidateQueries(['admin-appointments'])
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update appointment')
      }
    }
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Consultation Requests</h2>
            <p className="text-sm text-gray-500">Track and manage doctor appointments</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-medical-200 border-t-medical-600" />
          </div>
        ) : data?.length ? (
          <div className="space-y-4">
            {data.map((appointment) => (
              <div key={appointment._id} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Dr. {appointment?.doctor?.name}</p>
                    <p className="text-base font-semibold text-gray-900">{appointment?.doctor?.specialty}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarDays size={14} />
                      {new Date(appointment.date).toLocaleDateString()} • {appointment.slot}
                    </p>
                  </div>
                  <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    {appointment.user?.name} • {appointment.user?.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} />
                    Mode: {appointment.mode}
                  </div>
                  {appointment.reason && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Reason: {appointment.reason}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateMutation.mutate({ id: appointment._id, status })}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        appointment.status === status
                          ? 'border-medical-600 bg-medical-50 text-medical-700'
                          : 'border-gray-200 text-gray-600 hover:border-medical-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">No appointments found for this filter.</div>
        )}
      </div>
    </div>
  )
}

export default AppointmentManagement

