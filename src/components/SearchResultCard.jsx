import { memo, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchResultCard = memo(({ result }) => {
  const navigate = useNavigate()

  const {
    id = '',
    name = '',
    price = '',
    image = '',
    category = '',
    manufacturer = '',
    pack_size: packSize = '',
    type = ''
  } = result || {}

  const displayPrice = useMemo(() => {
    if (typeof price === 'number' && Number.isFinite(price)) {
      return `₹${price.toLocaleString()}`
    }
    return price || ''
  }, [price])

  const fallbackImage = useMemo(
    () =>
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect width="320" height="200" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E',
    []
  )

  const imageSrc = image || fallbackImage

  const typeLabel = type === 'product' ? 'Product' : type === 'medicine' ? 'Medicine' : 'Item'
  const typeBadgeColor =
    type === 'product'
      ? 'bg-blue-100 text-blue-700'
      : type === 'medicine'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-gray-100 text-gray-600'

  const handleClick = useCallback(() => {
    const encodedName = encodeURIComponent(name)
    if (type === 'product') {
      navigate(`/products?search=${encodedName}`)
    } else if (type === 'medicine') {
      navigate(`/all-medicine?search=${encodedName}`)
    } else {
      navigate(`/products?search=${encodedName}`)
    }
  }, [name, navigate, type])

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-full flex-col rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-medical-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-t-lg bg-gray-50">
        <img
          src={imageSrc}
          alt={name || 'Search result item'}
          className="h-full w-full object-contain p-3"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = fallbackImage
          }}
        />
        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadgeColor}`}>
          {typeLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-xs font-medium uppercase text-medical-600 line-clamp-1">{category || 'Uncategorized'}</p>
          <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{name || 'Unnamed Item'}</h3>
        </div>

        <div className="flex flex-col gap-1 text-xs text-gray-600">
          {manufacturer && <p className="line-clamp-1"><span className="font-semibold text-gray-700">Manufacturer:</span> {manufacturer}</p>}
          {packSize && <p className="line-clamp-1"><span className="font-semibold text-gray-700">Pack Size:</span> {packSize}</p>}
        </div>

        <div className="mt-auto flex items-baseline justify-between">
          <span className="text-base font-bold text-gray-900">{displayPrice || 'Price on request'}</span>
          <span className="text-xs font-medium text-medical-600">View</span>
        </div>
      </div>
    </button>
  )
})

SearchResultCard.displayName = 'SearchResultCard'

export default SearchResultCard





