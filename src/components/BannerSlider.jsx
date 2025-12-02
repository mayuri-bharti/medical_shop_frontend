import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { api } from '../services/api'

const BannerSlider = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery(
    'banners',
    async () => {
      const response = await api.get('/banners')
      if (response.data?.success) {
        return response.data.data || []
      }
      return []
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds for auto-refresh
      staleTime: 10000,
      cacheTime: 60000
    }
  )

  const banners = data || []

  // Show loading state
  if (isLoading) {
    return (
      <section className="bg-[#F4F8F7] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-56">
            <div className="animate-pulse text-gray-400">Loading banners...</div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    console.error('Banner fetch error:', error)
    return (
      <section className="bg-[#F4F8F7] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-56 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 text-sm text-center px-4">
              Error loading banners: {error.message || 'Unknown error'}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Hide slider if no banners
  if (!banners || banners.length === 0) {
    return null
  }

  const handleBannerClick = (link) => {
    if (!link) return
    
    // Check if it's an internal route (starts with /) or external URL
    if (link.startsWith('/')) {
      // Internal route - use React Router navigation
      navigate(link)
    } else {
      // External URL - open in new tab
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="bg-[#F4F8F7] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            loop={banners.length > 1}
            spaceBetween={16}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            navigation={{
              nextEl: '.banner-swiper-button-next',
              prevEl: '.banner-swiper-button-prev'
            }}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 }
            }}
            className="banner-swiper"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id || banner._id}>
                <div
                  onClick={() => handleBannerClick(banner.link)}
                  className="block w-full h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleBannerClick(banner.link)
                    }
                  }}
                  aria-label={`Banner: ${banner.title}`}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x224?text=Banner+Image'
                    }}
                  />
                  {/* Offer Text Overlay */}
                  {banner.offerText && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {banner.offerText}
                    </div>
                  )}
                  {/* Title & Subtitle Overlay */}
                  {(banner.title || banner.subtitle) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {banner.title && (
                        <h3 className="text-white font-semibold text-sm mb-1">{banner.title}</h3>
                      )}
                      {banner.subtitle && (
                        <p className="text-white text-xs">{banner.subtitle}</p>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                className="banner-swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous banner"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <button
                className="banner-swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next banner"
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default BannerSlider

