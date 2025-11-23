import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'

const HeroSection = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative w-full bg-gradient-to-br from-apollo-700 via-apollo-600 to-apollo-500 overflow-visible">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Decorative Elements - Hidden on smaller screens */}
      <div className="absolute left-0 top-0 w-1/3 h-full opacity-10 hidden md:block">
        <img 
          src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80&auto=format&fit=crop"
          alt="Medicine illustration"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 hidden md:block">
        <img 
          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop"
          alt="Healthcare illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Title */}
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-lg">
            {t('home.buyMedicines')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xs md:text-sm text-white/90 mb-3 max-w-2xl mx-auto drop-shadow-md line-clamp-2">
            {t('home.trustedPharmacy')}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-3">
            <SearchBar placeholder={t('home.searchPlaceholder')} />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Link
              to="/products"
              className="bg-white text-apollo-700 hover:bg-gray-50 font-semibold py-1.5 px-3 rounded-full transition-all duration-200 flex items-center space-x-1.5 shadow-md hover:shadow-lg text-xs"
            >
              <span>{t('home.shopNow')}</span>
              <ArrowRight size={16} />
            </Link>
            
            <Link
              to="/prescriptions"
              className="bg-white/90 backdrop-blur-sm text-apollo-700 hover:bg-white font-semibold py-1.5 px-3 rounded-full transition-all duration-200 flex items-center space-x-1.5 shadow-md hover:shadow-lg text-xs border border-white/50"
            >
              <span>{t('home.uploadPrescription')}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

