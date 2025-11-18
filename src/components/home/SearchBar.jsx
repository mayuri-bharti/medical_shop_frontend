import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { api } from '../../services/api'

const SearchBar = ({ onSearch, placeholder = "Search for medicines, health products..." }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const abortRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        navigate(`/products?search=${encodeURIComponent(query.trim())}`)
      }
      setOpen(false)
    }
  }

  // Debounced query
  const debouncedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([])
      setOpen(false)
      return
    }
    // Cancel previous request if any
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller
    const fetchSuggestions = async () => {
      try {
        // Fetch merged suggestions from both medicines and products
        const { data } = await api.get('/search', {
          params: { q: debouncedQuery, limit: 10 },
          signal: controller.signal
        })
        const items = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
        setSuggestions(items || [])
        setOpen((items || []).length > 0)
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setSuggestions([])
          setOpen(false)
        }
      }
    }
    // small debounce
    const t = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(t)
  }, [debouncedQuery])

  const handlePick = (item) => {
    setOpen(false)
    const id = item?._id || item?.id
    if (id && item?.type === 'medicine') {
      navigate(`/medicine/${id}`)
    } else if (id) {
      navigate(`/product/${id}`)
    } else if (item?.name) {
      navigate(`/products?search=${encodeURIComponent(item.name)}`)
    } else if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length && setOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-2 rounded-full border-0 bg-white text-sm text-gray-900 shadow-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-apollo-500/20 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-apollo-700 hover:bg-apollo-800 text-white px-3 py-1.5 rounded-full font-semibold text-xs transition-colors shadow-sm hover:shadow-md"
          >
            Search
          </button>
        </div>
      </form>
      {open && suggestions.length > 0 && (
        <div className="absolute z-[2000] mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto scrollbar-hide">
          {suggestions.map((s) => (
            <button
              key={s._id || s.id || s.name}
              type="button"
              onClick={() => handlePick(s)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
            >
              <img
                src={s.image || s.images?.[0] || s.thumbnail || '/placeholder-medicine.jpg'}
                alt={s.name}
                className="w-7 h-7 object-contain rounded"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {s.type ? (s.type === 'medicine' ? 'Medicine' : 'Product') : (s.brand || s.category || '')}
                  {' '}
                  {typeof s.price === 'number' ? `• ₹${s.price}` : ''}
                </p>
              </div>
            </button>
          ))}
          <div className="px-3 py-1.5 text-xs text-gray-500 border-t bg-gray-50">
            Press Enter to search “{query}”
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar

