import { memo, useMemo, useCallback } from 'react'
import { ArrowRight } from 'lucide-react'

const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="220"%3E%3Crect width="400" height="220" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif" font-size="18"%3EMedicine%3C/text%3E%3C/svg%3E'

const MedicineCard = memo(({ medicine, onClick }) => {
  const imageSrc = useMemo(() => {
    if (medicine?.images?.length) {
      return medicine.images[0]
    }
    if (medicine?.image) {
      return medicine.image
    }
    return fallbackImage
  }, [medicine?.images, medicine?.image])

  const handleClick = useCallback(() => {
    if (typeof onClick === 'function') {
      onClick(medicine)
    }
  }, [medicine, onClick])

  const price = useMemo(() => {
    const value = Number(medicine?.price ?? 0)
    return Number.isFinite(value) ? value : 0
  }, [medicine?.price])

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-medical-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gray-50">
        <img
          src={imageSrc}
          alt={medicine?.name || 'Medicine'}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = fallbackImage
          }}
        />
        {medicine?.tags?.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {medicine.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-medical-100 px-2 py-0.5 text-[10px] font-medium text-medical-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-medical-600">
          {medicine?.category || 'Medicine'}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">
          {medicine?.name || 'Unnamed Medicine'}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs text-gray-600">
          {medicine?.description || 'No description available for this medicine.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              ₹{price.toLocaleString()}
            </span>
            {medicine?.mrp && medicine.mrp > price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(medicine.mrp).toLocaleString()}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-medical-600 transition-colors duration-200 group-hover:text-medical-700">
            View Details
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  )
})

MedicineCard.displayName = 'MedicineCard'

export default MedicineCard



