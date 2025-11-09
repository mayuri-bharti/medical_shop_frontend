import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Link } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

/**
 * PromoBannerCarousel - PharmEasy Style
 * A responsive horizontal banner carousel with multiple slides
 */
const PromoBannerCarousel = () => {
  // 8 Promotional Slides with Links
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=400&fit=crop&q=80',
      title: ' Whisper Ultra Go Tension Free',
      description: 'Premium feminine hygiene products for your comfort',
      discount: 'Up to 45% OFF',
      bgColor: 'from-purple-100 to-pink-100',
      link: '/products?category=Personal Care'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&h=400&fit=crop',
      title: 'BP Monitor',
      description: 'Stay ahead of hypertension with accurate readings',
      discount: 'Special Offer',
      bgColor: 'from-teal-100 to-green-100',
      link: '/products?category=Medical Devices'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=400&fit=crop',
      title: 'Glowing Skin Products',
      description: 'Transform your skin with our premium skincare range',
      discount: 'Up to 70% OFF',
      bgColor: 'from-orange-100 to-yellow-100',
      link: '/products?category=Personal Care&subcategory=skincare'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=400&fit=crop',
      title: 'Diabetes Care Essentials',
      description: 'Complete diabetes management solutions at your doorstep',
      discount: 'Save Big',
      bgColor: 'from-blue-100 to-cyan-100',
      link: '/products?category=Health Supplements&condition=diabetes'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=400&fit=crop',
      title: 'Vitamins & Supplements',
      description: 'Boost your health with quality nutritional supplements',
      discount: 'Up to 50% OFF',
      bgColor: 'from-green-100 to-emerald-100',
      link: '/products?category=Health Supplements'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=400&fit=crop',
      title: 'Healthcare Devices Sale',
      description: 'Essential medical devices for home healthcare',
      discount: 'Up to 40% OFF',
      bgColor: 'from-indigo-100 to-purple-100',
      link: '/products?category=Medical Devices&sale=true'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=400&fit=crop',
      title: 'Immunity Boosters',
      description: 'Strengthen your immunity with natural supplements',
      discount: 'Special Price',
      bgColor: 'from-amber-100 to-orange-100',
      link: '/products?category=Health Supplements&type=immunity'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1550831107-1553da8c0785?w=800&h=400&fit=crop',
      title: 'Daily Wellness Products',
      description: 'Everything you need for daily health and wellness',
      discount: 'Up to 60% OFF',
      bgColor: 'from-rose-100 to-pink-100',
      link: '/products?category=Wellness Products'
    }
  ]

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        className="promotional-carousel"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-48 md:h-52 group">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor}`} />
              
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                {/* Discount Badge */}
                <div className="flex justify-end">
                  <span className="inline-block bg-red-500 text-white text-xs md:text-sm font-bold px-3 py-1 md:px-4 md:py-2 rounded-full shadow-lg animate-pulse">
                    {slide.discount}
                  </span>
                </div>

                {/* Text Content */}
                <div className="space-y-3 md:space-y-4">
                  <Link
                    to={slide.link}
                    className="block text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight drop-shadow-md transition-transform duration-200 hover:translate-x-1"
                  >
                    {slide.title}
                  </Link>
                  
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-md drop-shadow-sm">
                    {slide.description}
                  </p>

                  <Link
                    to={slide.link}
                    className="inline-flex items-center text-sm font-semibold text-medical-700 transition-colors hover:text-medical-800"
                  >
                    Shop now →
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows */}
        <div className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>

        <div className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Swiper>

      {/* Custom Pagination Styles */}
      <style jsx>{`
        .promotional-carousel {
          padding-bottom: 50px;
        }

        .promotional-carousel .swiper-wrapper {
          padding-bottom: 20px;
        }

        .swiper-pagination-bullet-custom {
          width: 8px;
          height: 8px;
          background: #cbd5e1;
          opacity: 1;
          border-radius: 50%;
          transition: all 0.3s;
          cursor: pointer;
          margin: 0 4px;
        }

        .swiper-pagination-bullet-custom:hover {
          background: #94a3b8;
          transform: scale(1.2);
        }

        .swiper-pagination-bullet-active-custom {
          width: 24px;
          border-radius: 4px;
          background: #0d9488;
        }

        @media (min-width: 768px) {
          .swiper-pagination-bullet-custom {
            width: 10px;
            height: 10px;
          }

          .swiper-pagination-bullet-active-custom {
            width: 28px;
          }
        }
      `}</style>
    </div>
  )
}

export default PromoBannerCarousel

