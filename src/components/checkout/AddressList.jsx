import AddressCard from './AddressCard'
import { Loader2 } from 'lucide-react'

const AddressList = ({
  addresses = [],
  selectedId,
  loading = false,
  onSelect,
  onDeliver,
  onEdit,
  onDelete,
  onAddNew
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-6 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        Loading addresses...
      </div>
    )
  }

  if (!addresses.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          No saved addresses yet. Add one to continue.
        </p>
        <button
          type="button"
          onClick={onAddNew}
          className="mt-4 rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
        >
          + Add New Address
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          selected={address._id === selectedId}
          onSelect={onSelect}
          onDeliver={onDeliver}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <button
        type="button"
        onClick={onAddNew}
        className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-orange-400 hover:text-orange-600"
      >
        + ADD NEW ADDRESS
      </button>
    </div>
  )
}

export default AddressList

