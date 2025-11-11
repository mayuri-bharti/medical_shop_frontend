import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import PageCarousel from '../components/PageCarousel'
import MedicineCard from '../components/MedicineCard'
import { api } from '../services/api'

const AllMedicine = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [medicines, setMedicines] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 24, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  const currentPage = useMemo(() => {
    const pageParam = Number(searchParams.get('page') || 1)
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  }, [searchParams])

  const currentSearch = useMemo(() => searchParams.get('search') || '', [searchParams])

  const medicineBanners = useMemo(() => [
    {
      src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=400&fit=crop',
      alt: 'All Medicines Collection',
      title: 'Complete Medicine Catalogue',
      description: 'Browse our extensive collection of medicines and healthcare essentials'
    },
    {
      src: 'https://images.unsplash.com/photo-1573883431205-98b5f10f4e90?w=1200&h=400&fit=crop',
      alt: 'Trusted Medicines',
      title: 'Trusted & Verified Medicines',
      description: 'Every medicine is quality-checked to ensure safety and effectiveness'
    },
    {
      src: 'https://images.unsplash.com/photo-1550572017-edd951c093cc?w=1200&h=400&fit=crop',
      alt: 'Wellness Essentials',
      title: 'Wellness Essentials',
      description: 'Find products for every wellness routine in one place'
    }
  ], [])

  const fetchMedicines = useCallback(async (options = {}) => {
    const { searchValue = currentSearch, pageValue = currentPage } = options

    setIsFetching(true)
    if (isLoading) {
      setError(null)
    }

    try {
      const response = await api.get('/allmedecine', {
        params: {
          search: searchValue || undefined,
          page: pageValue,
          limit: pagination.limit
        },
        timeout: 60000,
        headers: {
          Accept: 'application/json'
        }
      })

      const responseData = response.data || {}
      setMedicines(responseData.medicines || [])
      setPagination((prev) => ({
        ...prev,
        ...(responseData.pagination || {}),
        limit: responseData.pagination?.limit || prev.limit || 24
      }))
      setError(null)
    } catch (err) {
      console.error('AllMedicine fetch error:', err)
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to load medicines. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [currentSearch, currentPage, isLoading, pagination.limit])

  useEffect(() => {
    fetchMedicines({ searchValue: currentSearch, pageValue: currentPage })
  }, [currentSearch, currentPage, fetchMedicines])

  useEffect(() => {
    setSearchTerm(currentSearch)
  }, [currentSearch])

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault()
    const params = new URLSearchParams(searchParams)

    if (searchTerm?.trim()) {
      params.set('search', searchTerm.trim())
      params.set('page', '1')
    } else {
      params.delete('search')
      params.set('page', '1')
    }

    setSearchParams(params, { replace: true })
  }, [searchParams, searchTerm, setSearchParams])

  const handlePageChange = useCallback((pageValue) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(pageValue))
    setSearchParams(params, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchParams, setSearchParams])

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const handleMedicineClick = useCallback((medicine) => {
    if (medicine?.productRef) {
      navigate(`/products-list?search=${encodeURIComponent(medicine.name || '')}&productId=${medicine.productRef}`)
      return
    }

    navigate(`/products?search=${encodeURIComponent(medicine?.name || '')}`)
  }, [navigate])

  const isEmptyState = !isLoading && !isFetching && medicines.length === 0

  return (
    <div className="space-y-6">
      <PageCarousel
        images={medicineBanners}
        autoSlide
        interval={4500}
        height="h-32 md:h-40 lg:h-48"
      />

      <div className="flex flex-col gap-4 md:flex-row">
        <form className="relative flex-1" onSubmit={handleSearchSubmit}>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            placeholder="Search medicines by name, category, or symptoms..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 md:w-auto">
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="rounded-lg bg-medical-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-medical-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-1"
          >
            Search Medicines
          </button>
          {(currentSearch || currentPage > 1) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-medical-200 px-4 py-2 text-sm font-medium text-medical-700 transition-colors duration-200 hover:bg-medical-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {currentSearch && (
        <div className="rounded-lg border border-medical-100 bg-medical-50 px-4 py-3 text-sm text-medical-700">
          Showing medicine results for <span className="font-semibold underline decoration-medical-400 decoration-2">{currentSearch}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Unable to load medicines</p>
          <p className="text-xs text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchMedicines({ searchValue: currentSearch, pageValue: currentPage })}
            className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-medical-600"></div>
        </div>
      ) : (
        <>
          {isFetching && !isEmptyState && (
            <div className="rounded-lg border border-medical-100 bg-white px-4 py-3 text-sm text-medical-700 shadow-sm">
              Updating results...
            </div>
          )}

          {isEmptyState ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
              <p className="text-lg font-semibold text-gray-800">No medicines found</p>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                We couldn&apos;t find any medicines matching your search. Try using different keywords or explore our{' '}
                <Link to="/products" className="text-medical-600 underline decoration-medical-400 decoration-2 hover:text-medical-700">
                  products catalogue
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {medicines.map((medicine) => (
                  <MedicineCard
                    key={medicine._id}
                    medicine={medicine}
                    onClick={handleMedicineClick}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="rounded-md border border-medical-200 px-3 py-1.5 text-sm font-medium text-medical-700 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-medical-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.pages }).map((_, index) => {
                    const pageNumber = index + 1
                    const isActive = pageNumber === pagination.page
                    const isEdge = pageNumber === 1 || pageNumber === pagination.pages
                    const isNearActive = Math.abs(pageNumber - pagination.page) <= 1

                    if (!isEdge && !isNearActive) {
                      if (pageNumber === pagination.page - 2 || pageNumber === pagination.page + 2) {
                        return (
                          <span key={pageNumber} className="px-2 text-sm text-gray-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-medical-600 text-white shadow-sm'
                            : 'border border-medical-200 text-medical-700 hover:bg-medical-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="rounded-md border border-medical-200 px-3 py-1.5 text-sm font-medium text-medical-700 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-medical-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AllMedicine

