import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'
import { api } from '../services/api'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
// Apollo Pharmacy Components
import HeroSection from '../components/home/HeroSection'
import CategoryNav from '../components/home/CategoryNav'
import FeatureCards from '../components/home/FeatureCards'
import HealthConditions from '../components/home/HealthConditions'

const Home = () => {
  const navigate = useNavigate()

  const fallbackFeaturedProducts = useMemo(
    () => [
      {
        id: 'fallback-1',
        name: 'Lipicure Gold 10mg Capsules',
        image: 'https://images.unsplash.com/photo-1582719478250-428daf0c0d4b?w=640&q=80&auto=format&fit=crop',
        price: 92,
        mrp: 110,
        delivery: 'Delivery within 1 day',
        inStock: true
      },
      {
        id: 'fallback-2',
        name: 'Azulix-4MF Forte Tablets',
        image: 'https://images.unsplash.com/photo-1578302758068-22308e6e4daf?w=640&q=80&auto=format&fit=crop',
        price: 189,
        mrp: 210,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-3',
        name: 'Razel-Gold 10mg Capsules',
        image: 'https://images.unsplash.com/photo-1586374579358-93e04d95ccf5?w=640&q=80&auto=format&fit=crop',
        price: 287,
        mrp: 320,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-4',
        name: 'Euclide-M-OD 60mg Tablets',
        image: 'https://images.unsplash.com/photo-1580281658170-3f03f0c5fa1f?w=640&q=80&auto=format&fit=crop',
        price: 170,
        mrp: 195,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-5',
        name: 'Ascoril-Flu Syrup 60ml',
        image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=640&q=80&auto=format&fit=crop',
        price: 98,
        mrp: 115,
        delivery: 'Delivery within 1 day',
        inStock: true
      },
      {
        id: 'fallback-6',
        name: 'Dolo 650 Tablets (15)',
        image: 'https://images.unsplash.com/photo-1612632576808-1e655d60dddf?w=640&q=80&auto=format&fit=crop',
        price: 110,
        mrp: 125,
        delivery: 'Delivery within 1 day',
        inStock: true
      },
      {
        id: 'fallback-7',
        name: 'Shelcal 500 Tablets',
        image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=640&q=80&auto=format&fit=crop',
        price: 180,
        mrp: 215,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-8',
        name: 'Cetzine 10mg Tablets',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b5cdae67?w=640&q=80&auto=format&fit=crop',
        price: 75,
        mrp: 90,
        delivery: 'Delivery within 1 day',
        inStock: true
      }
    ],
    []
  )

  const {
    data: popularProductsData,
    isLoading: isPopularLoading,
    isError: isPopularError
  } = useQuery(
    ['home-popular-products'],
    async () => {
      const response = await api.get('/products', {
        params: {
          page: 1,
          limit: 8,
          sort: 'rating'
        }
      })

      const responseData = response.data

      if (responseData?.success !== undefined) {
        if (responseData.success) {
          return responseData.products || []
        }
        throw new Error(responseData.message || 'Failed to load products')
      }

      if (Array.isArray(responseData)) {
        return responseData
      }

      if (responseData?.products) {
        return responseData.products
      }

      return []
    },
    {
      staleTime: 300000,
      cacheTime: 300000,
      refetchOnWindowFocus: false
    }
  )

  const featuredProducts = useMemo(() => {
    if (popularProductsData && popularProductsData.length > 0) {
      return popularProductsData.map((product) => ({
        id: product._id,
        name: product.name,
        image: product.images?.[0] || product.image || '/placeholder-medicine.jpg',
        price: product.price,
        mrp: product.mrp ?? product.price,
        delivery: product.deliveryInfo || 'Delivery within 2 days',
        inStock: product.stock > 0
      }))
    }
    return fallbackFeaturedProducts
  }, [popularProductsData, fallbackFeaturedProducts])

  return (
    <>
      <div className="min-h-screen bg-[#F4F8F7]">
      {/* Apollo Pharmacy Category Navigation */}
      <CategoryNav />

      {/* Apollo Pharmacy Hero Section */}
      <HeroSection />

      {/* Small Banner Image - now with autoplay slider */}
      <section className="bg-[#F4F8F7] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop
            spaceBetween={16}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 }
            }}
          >
            <SwiperSlide>
              <Link 
                to="/products?brand=Sofy"
                className="block w-72 h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.54KllwoEr_s7xUYhlicD_gHaJQ?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="SOFY AntiBacteria - Women Care"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 1%' }}
                  loading="lazy"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link 
                to="/products?brand=Horlicks"
                className="block w-72 h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src="https://th.bing.com/th/id/R.a2173d0a6e347b4bcf0227962f510733?rik=%2fJXunw6MAnSwoQ&riu=http%3a%2f%2fronnysequeira.com%2fwp-content%2fuploads%2f2018%2f03%2fadvt-21_2.jpg&ehk=dryQeZxZ1%2fN0O%2fP1eFFNfL5o4V9Ygj7lnYZBH3ORPAQ%3d&risl=&pid=ImgRaw&r=0"
                  alt="Horlicks - Nutritional Supplements"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 15%' }}
                  loading="lazy"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link 
                to="/products?brand=Zandu"
                className="block w-72 h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.zbW_3E12MQHzqxD2XsqGlQHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Horlicks - Nutritional Supplements"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 50%' }}
                  loading="lazy"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link 
                to="/products?brand=Happy"
                className="block w-72 h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src="https://i.pinimg.com/736x/41/54/83/4154838ba89dfb6f5993d476433930ae.jpg"
                  alt="Horlicks - Nutritional Supplements"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 30%' }}
                  loading="lazy"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link 
                to="/products?brand=Dog"
                className="block w-72 h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src="https://www.grabon.in/indulge/wp-content/uploads/2022/04/Best-Dog-Food-Brands.jpg"
                  alt="Best Dog Food Brands - Pet Care"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 15%' }}
                  loading="lazy"
                />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link 
                to="/products?category=personal-care&subcategory=face-wash"
                className="block w-72 h-56 overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src="https://denverformen.com/cdn/shop/files/AcneClearcopy_7bf7ea06-bcdc-4674-80bb-0a144f9ee874_800x.jpg?v=1718790397"
                  alt="DENVER Face Wash - Personal Care"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 45%' }}
                  loading="lazy"
                />
              </Link>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Apollo Pharmacy Feature Cards */}
      <FeatureCards />

      {/* Promotional Images (2-up) */}
     

      {/* Apollo Pharmacy Health Conditions */}
      <HealthConditions />

      {/* Himalaya Product Banner */}
      <section className="py-6 bg-[#F4F8F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/products?brand=Himalaya"
            className="block w-full overflow-hidden rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <img
              src="https://asset22.ckassets.com/resources/image/staticpage_images/Brand-Himalaya-Desktop-08-12-2017.jpg"
              alt="Himalaya Products - Ayurvedic Wellness"
              className="w-full h-48 md:h-56 lg:h-64 object-cover"
              loading="lazy"
            />
          </Link>
        </div>
      </section>

      {/* Nivea Soft Product Banner */}
      <section className="py-6 bg-[#F4F8F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/products?brand=Nivea"
            className="block w-full overflow-hidden rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0481/5621/3409/files/Nivea_Soft_Banner__1___1.jpg?v=1664357408"
              alt="Nivea Soft - Personal Care"
              className="w-full h-56 md:h-64 lg:h-72 object-cover"
              style={{ objectPosition: 'center 28%' }}
              loading="lazy"
            />
          </Link>
        </div>
      </section>

      {/* Featured Products - Trending Medicines */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3">
                Trending <span className="text-apollo-700">Medicines</span>
              </h2>
              <p className="text-[#6B7280] mt-2">Most popular and trusted medicines</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center space-x-2 px-6 py-3 border-2 border-apollo-700 text-apollo-700 hover:bg-apollo-50 font-semibold rounded-full transition-all duration-200"
            >
              <span>View All</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        {isPopularError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load featured products. Showing recommendations instead.
          </div>
        )}
        {isPopularLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="ml-auto h-5 w-5 rounded-full bg-slate-200" />
                  <div className="h-32 w-full rounded-lg bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                  <div className="mt-2 flex gap-2">
                    <div className="h-9 flex-1 rounded-full bg-slate-200" />
                    <div className="h-9 w-9 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredProducts.map((product) => {
              const discount = product.mrp && product.mrp !== product.price 
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0
              
              return (
                <div
                  key={product.id ?? product.name}
                  className="medicine-card group cursor-pointer"
                  onClick={() => {
                    if (product.id) {
                      navigate(`/product/${product.id}`)
                    } else {
                      navigate(`/products?search=${encodeURIComponent(product.name)}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (product.id) {
                        navigate(`/product/${product.id}`)
                      } else {
                        navigate(`/products?search=${encodeURIComponent(product.name)}`)
                      }
                    }
                  }}
                >
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="badge badge-error">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  
                  {/* Product Image */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white p-6 flex items-center justify-center min-h-[180px]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-32 w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5 flex flex-1 flex-col">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 min-h-[40px]">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-apollo-700">
                        ₹{Number(product.price ?? 0).toLocaleString()}
                      </span>
                      {product.mrp && product.mrp !== product.price && (
                        <>
                          <span className="text-xs text-gray-500 line-through">
                            ₹{Number(product.mrp ?? 0).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="text-xs text-gray-600">
                        {product.inStock ? product.delivery : 'Out of stock'}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!product.inStock}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                          product.inStock
                            ? 'bg-apollo-700 text-white hover:bg-apollo-800 shadow-md hover:shadow-lg'
                            : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
          {/* View All Link for Mobile */}
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-apollo-700 text-apollo-700 hover:bg-apollo-50 font-semibold rounded-full transition-all duration-200"
            >
              <span>View All Products</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Health Packages Section */}
      <section className="py-16 bg-[#F4F8F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3">
              Health <span className="text-apollo-700">Packages</span>
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Curated wellness packages for your health needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Immunity Booster Pack', price: '₹1,299', originalPrice: '₹1,599', savings: 'Save ₹300', query: 'immunity' },
              { name: 'Diabetes Care Package', price: '₹2,499', originalPrice: '₹2,999', savings: 'Save ₹500', query: 'diabetes' },
              { name: 'Senior Wellness Kit', price: '₹1,999', originalPrice: '₹2,399', savings: 'Save ₹400', query: 'senior wellness' },
            ].map((pkg, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-soft text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-apollo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="text-apollo-700" size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1A1A1A]">{pkg.name}</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-apollo-700">{pkg.price}</span>
                  <span className="text-sm text-[#6B7280] line-through ml-2">{pkg.originalPrice}</span>
                </div>
                <p className="text-sm text-green-600 font-semibold mb-4">{pkg.savings}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/products?search=${encodeURIComponent(pkg.query || pkg.name)}`)}
                  className="w-full text-center bg-apollo-700 hover:bg-apollo-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  View Related Products
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      </div>
    </>
  )
}

export default Home
