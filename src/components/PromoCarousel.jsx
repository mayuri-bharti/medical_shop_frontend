import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/navigation'

/**
 * PromoCarousel - Apollo Pharmacy Style
 * Promotional cards carousel with multiple slides
 */
const PromoCarousel = () => {
  // Promotional Cards
  const promoSlides = [
    {
      id: 1,
      title: 'Glowing Skin Products',
      subtitle: 'Transform your skin with our premium skincare range',
      discount: 'Up to 70% OFF',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop&q=80',
      link: '/products?category=Personal Care&subcategory=skincare'
    },
    {
      id: 2,
      title: 'Diabetes Care Essentials',
      subtitle: 'Complete diabetes management solutions at your doorstep',
      discount: 'Save Big',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop&q=80',
      link: '/products?category=Health Supplements&condition=diabetes'
    },
    {
      id: 3,
      title: 'Vitamins & Supplements',
      subtitle: 'Boost your health with quality nutritional supplements',
      discount: 'Up to 50% OFF',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop&q=80',
      link: '/products?category=Health Supplements'
    },
    {
      id: 4,
      title: 'Immunity Boosters',
      subtitle: 'Strengthen your immunity with natural supplements',
      discount: 'Special Price',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop&q=80',
      link: '/products?category=Health Supplements&type=immunity'
    },
    {
      id: 5,
      title: 'Healthcare Devices',
      subtitle: 'Essential medical devices for home healthcare',
      discount: 'Up to 40% OFF',
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop&q=80',
      link: '/products?category=Medical Devices'
    },
    {
      id: 6,
      title: 'Baby Care Products',
      subtitle: 'Safe and gentle products for your little ones',
      discount: 'Up to 35% OFF',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop&q=80',
      link: '/products?category=Baby Care'
    }
  ]

  return (
    <div className="w-full max-w-3xl ml-0 lg:ml-4 px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 md:gap-4">
        {/* Left Side - Promotional Cards Carousel (70% on desktop) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={600}
              className="promo-carousel-left"
            >
              {promoSlides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <Link to={slide.link} className="block group h-full">
                    <div className="relative h-40 md:h-44 lg:h-48 overflow-hidden rounded-lg">
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Dark Overlay for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                      </div>

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-4 md:p-5 lg:p-6">
                        {/* Discount Badge */}
                        <div className="flex justify-end">
                          <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            {slide.discount}
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-2">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg leading-tight">
                            {slide.title}
                          </h3>
                          <p className="text-xs md:text-sm text-white/90 drop-shadow-md max-w-md line-clamp-2">
                            {slide.subtitle}
                          </p>
                          
                          {/* Shop Now Button */}
                          <div className="pt-1">
                            <span className="inline-flex items-center space-x-1.5 bg-apollo-500 hover:bg-apollo-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs md:text-sm">
                              <span>Shop Now</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="lg:col-span-3">
          <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-40 md:h-44 lg:h-48">
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.1_uzEPLAr2o4NW4nwQl_cgHaNK?cb=ucfimg2&pid=ImgDet&ucfimg=1&w=184&h=325&c=7&dpr=1.3&o=7&rm=3"
              alt="HealthPlus - Trusted Pharmacy"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=1000&fit=crop&q=80'
              }}
            />
            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-apollo-700/40 via-apollo-600/20 to-transparent" />
            
            {/* Medicine Products Overlay (Floating) */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 flex-wrap justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md transform hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-apollo-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg md:text-xl">💊</span>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md transform hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-apollo-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg md:text-xl">💉</span>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md transform hover:scale-110 transition-transform duration-300">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-apollo-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg md:text-xl">🩺</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .promo-carousel-left .swiper-button-next,
        .promo-carousel-left .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .promo-carousel-left .swiper-button-next:after,
        .promo-carousel-left .swiper-button-prev:after {
          font-size: 14px;
        }
        .promo-carousel-left .swiper-button-next:hover,
        .promo-carousel-left .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  )
}

export default PromoCarousel

