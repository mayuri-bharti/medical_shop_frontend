import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = {
  _id: null,
  name: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  label: 'Home'
}

const labels = ['Home', 'Work', 'Other']

const AddressModal = ({
  open,
  onClose,
  initialData,
  onSave,
  loading = false
}) => {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : emptyForm)
    }
  }, [open, initialData])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave?.(form)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {form._id ? 'Edit Address' : 'Add New Address'}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {form._id ? 'Update delivery address' : 'Save delivery address'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                value={form.phoneNumber}
                onChange={(e) =>
                  handleChange('phoneNumber')({
                    target: { value: e.target.value.replace(/\D/g, '').slice(0, 10) }
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={handleChange('address')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={handleChange('city')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={handleChange('state')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) =>
                  handleChange('pincode')({
                    target: { value: e.target.value.replace(/\D/g, '').slice(0, 6) }
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Label
              </label>
              <div className="mt-2 flex gap-3">
                {labels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, label }))
                    }
                    className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
                      form.label === label
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-300 text-gray-600 hover:border-orange-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddressModal

