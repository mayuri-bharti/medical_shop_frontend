import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const HomepageBanner = ({ bannerType = 'banner1', defaultBanner = null }) => {
  const { data, isLoading, error } = useQuery(
    ['homepage-banner', bannerType],
    async () => {
      const response = await api.get('/home-banner', { params: { bannerType } })
      if (response.data?.success) {
        return response.data.data
      }
      return null
    },
    {
      refetchInterval: 60000, // Refetch every 60 seconds
      staleTime: 30000,
      cacheTime: 120000
    }
  )

  const banner = data

  // Default banners if no active banner is set
  const defaultBanners = {
    banner1: {
      bannerImage: 'https://asset22.ckassets.com/resources/image/staticpage_images/Brand-Himalaya-Desktop-08-12-2017.jpg',
      title: 'Himalaya Products - Ayurvedic Wellness',
      subtitle: '',
      description: '',
      ctaLink: '/products?brand=Himalaya',
      cashbackPartnerLogos: []
    },
    banner2: {
      bannerImage: 'https://cdn.shopify.com/s/files/1/0481/5621/3409/files/Nivea_Soft_Banner__1___1.jpg?v=1664357408',
      title: 'Nivea Soft - Personal Care',
      subtitle: '',
      description: '',
      ctaLink: '/products?brand=Nivea',
      cashbackPartnerLogos: []
    }
  }

  // Use banner data if available, otherwise use default
  const displayBanner = banner || defaultBanner || defaultBanners[bannerType]

  if (isLoading) {
    return (
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-48 md:h-56 lg:h-64 bg-gray-200 animate-pulse rounded-xl"></div>
        </div>
      </section>
    )
  }

  if (error) {
    console.error('Homepage banner fetch error:', error)
    // Show default banner on error
  }

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={displayBanner.ctaLink || '/'}
          target={displayBanner.ctaLink?.startsWith('http') ? '_blank' : undefined}
          rel={displayBanner.ctaLink?.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="block w-full overflow-hidden rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative group"
        >
          {/* Banner Image */}
          <div className="relative w-full h-48 md:h-56 lg:h-64 overflow-hidden rounded-xl">
            <img
              src={displayBanner.bannerImage}
              alt={displayBanner.title || 'Promotional Banner'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x300?text=Promotional+Banner'
              }}
            />
            
            {/* Overlay Content */}
            {(displayBanner.title || displayBanner.subtitle || displayBanner.description) && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/20 to-transparent flex items-end">
                <div className="px-8 md:px-8 lg:px-12 pb-6 md:pb-8 max-w-2xl">
                  {displayBanner.subtitle && (
                    <p className="text-white text-sm md:text-base font-semibold mb-2 opacity-90">
                      {displayBanner.subtitle}
                    </p>
                  )}
                  {displayBanner.title && (
                    <h2 className="text-white text-xl md:text-2xl lg:text-2xl font-bold mb-1">
                      {displayBanner.title}
                    </h2>
                  )}
                  {displayBanner.description && (
                    <p className="text-white text-sm md:text-base opacity-90 line-clamp-2">
                      {displayBanner.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cashback Partner Logos */}
            {displayBanner.cashbackPartnerLogos && displayBanner.cashbackPartnerLogos.length > 0 && (
              <div className="absolute bottom-4 right-4 flex gap-2 flex-wrap justify-end">
                {displayBanner.cashbackPartnerLogos.map((logo, index) => (
                  <img
                    key={index}
                    src={logo}
                    alt={`Partner ${index + 1}`}
                    className="h-8 md:h-10 w-auto bg-white/90 rounded px-2 py-1 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  )
}

export default HomepageBanner

