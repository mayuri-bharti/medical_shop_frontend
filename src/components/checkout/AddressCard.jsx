import { memo } from 'react'
import { CheckCircle2 } from 'lucide-react'

const LABEL_COLORS = {
  home: 'bg-blue-50 text-blue-700 border-blue-200',
  work: 'bg-purple-50 text-purple-700 border-purple-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200'
}

const AddressCard = ({
  address,
  selected = false,
  onSelect,
  onDeliver,
  onEdit,
  onDelete
}) => {
  const labelKey = (address.label || 'other').toLowerCase()

  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        selected ? 'border-orange-500 bg-orange-50/40' : 'border-gray-200'
      }`}
    >
      <div className="p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="delivery-address"
            checked={selected}
            onChange={() => onSelect?.(address)}
            className="mt-1 h-5 w-5 text-orange-500 focus:ring-orange-500"
          />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {address.name}
              </span>
              <span className="text-sm text-gray-600">
                {address.phoneNumber || address.phone}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${LABEL_COLORS[labelKey]}`}
              >
                {(address.label || 'Other').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {address.address}
              <br />
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
          {selected && (
            <CheckCircle2 className="text-orange-500" size={20} />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pl-8 md:pl-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(address)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              EDIT
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(address)}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              DELETE
            </button>
          </div>
          <button
            type="button"
            onClick={() => onDeliver?.(address)}
            className="ml-auto rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition-colors"
          >
            DELIVER HERE
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(AddressCard)

