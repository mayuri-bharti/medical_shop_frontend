import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

const categories = [
  { 
    name: 'HealthPlus Products', 
    slug: 'HealthPlus-products', 
    icon: '💊',
    subcategories: [
      {
        title: 'HealthPlus Brands',
        items: [
          { name: 'HealthPlus Pharmacy', link: '/products?category=apollo-pharmacy' },
          { name: 'HealthPlus Health', link: '/products?category=apollo-health' },
          { name: 'HealthPlus Wellness', link: '/products?category=apollo-wellness' }
        ]
      },
      {
        title: 'Product Types',
        items: [
          { name: 'Medicines', link: '/products?category=medicines' },
          { name: 'Health Supplements', link: '/products?category=health-supplements' },
          { name: 'Wellness Products', link: '/products?category=wellness-products' }
        ]
      }
    ]
  },
  { 
    name: 'Baby Care', 
    slug: 'baby-care', 
    icon: '👶',
    subcategories: [
      {
        title: 'Diapering',
        items: [
          { name: 'Diapers', link: '/products?category=diapers' },
          { name: 'Wipes', link: '/products?category=wipes' }
        ]
      },
      {
        title: 'Diaper By Weight',
        items: [
          { name: '0 to 7 Kg', link: '/products?category=diapers-0-7kg' },
          { name: '7 to 14 Kg', link: '/products?category=diapers-7-14kg' },
          { name: '14 to 18 Kg', link: '/products?category=diapers-14-18kg' },
          { name: 'Above 18 Kg', link: '/products?category=diapers-18kg-plus' }
        ]
      },
      {
        title: 'Baby Food',
        items: [
          { name: 'Baby Cereals', link: '/products?category=baby-cereals' },
          { name: 'Formula Milk', link: '/products?category=formula-milk' }
        ]
      },
      {
        title: 'Baby Skin Care',
        items: [
          { name: 'Baby Creams', link: '/products?category=baby-creams' },
          { name: 'Baby Lotions', link: '/products?category=baby-lotions' },
          { name: 'Baby Massage Oils', link: '/products?category=baby-massage-oils' },
          { name: 'Baby Powders', link: '/products?category=baby-powders' },
          { name: 'Rash Creams', link: '/products?category=rash-creams' }
        ]
      },
      {
        title: 'Baby Food By Age',
        items: [
          { name: '0 to 6 Months', link: '/products?category=baby-food-0-6months' },
          { name: '6 to 12 Months', link: '/products?category=baby-food-6-12months' },
          { name: '12 to 18 Months', link: '/products?category=baby-food-12-18months' },
          { name: '18 to 24 Months', link: '/products?category=baby-food-18-24months' },
          { name: 'Above 2 Years', link: '/products?category=baby-food-2years-plus' }
        ]
      },
      {
        title: 'Baby Hair Care',
        items: [
          { name: 'Baby Shampoos', link: '/products?category=baby-shampoos' },
          { name: 'Baby Hair Oils', link: '/products?category=baby-hair-oils' }
        ]
      },
      {
        title: 'Baby Bath',
        items: [
          { name: 'Soaps & Bars', link: '/products?category=baby-soaps' },
          { name: 'Body Wash', link: '/products?category=baby-body-wash' }
        ]
      }
    ]
  },
  { 
    name: 'Supplements', 
    slug: 'supplements', 
    icon: '💊',
    subcategories: [
      {
        title: 'Daily Vitamins',
        items: [
          { name: 'Multivitamins', link: '/products?category=multivitamins' },
          { name: 'Vitamin D & C', link: '/products?category=vitamin-d-c' },
          { name: 'Calcium & Iron', link: '/products?category=calcium-iron' }
        ]
      },
      {
        title: 'Fitness & Body',
        items: [
          { name: 'Protein Powder', link: '/products?category=protein-powder' },
          { name: 'Weight Management', link: '/products?category=weight-management' },
          { name: 'Herbal & Organic', link: '/products?category=herbal-organic' }
        ]
      },
      {
        title: 'Specialty Supplements',
        items: [
          { name: 'Omega-3 & Fish Oil', link: '/products?category=omega-3' },
          { name: 'Probiotics', link: '/products?category=probiotics' },
          { name: 'Antioxidants', link: '/products?category=antioxidants' }
        ]
      }
    ]
  },
  { 
    name: 'Personal Care', 
    slug: 'personal-care', 
    icon: '🧴',
    subcategories: [
      {
        title: 'Skincare Essentials',
        items: [
          { name: 'Moisturizers', link: '/products?category=moisturizers' },
          { name: 'Serums & Toners', link: '/products?category=serums-toners' },
          { name: 'Sunscreen', link: '/products?category=sunscreen' },
          { name: 'Face Wash', link: '/products?category=face-wash' }
        ]
      },
      {
        title: 'Hair & Hygiene',
        items: [
          { name: 'Shampoos & Conditioners', link: '/products?category=shampoos-conditioners' },
          { name: 'Deodorants & Perfumes', link: '/products?category=deodorants-perfumes' },
          { name: 'Soaps & Body Wash', link: '/products?category=soaps-body-wash' }
        ]
      },
      {
        title: 'Oral Care',
        items: [
          { name: 'Toothpaste', link: '/products?category=toothpaste' },
          { name: 'Toothbrushes', link: '/products?category=toothbrushes' },
          { name: 'Mouthwash', link: '/products?category=mouthwash' }
        ]
      }
    ]
  },
  { 
    name: 'Home Essentials', 
    slug: 'home-essentials', 
    icon: '🏠',
    subcategories: [
      {
        title: 'Cleaning Supplies',
        items: [
          { name: 'Disinfectants', link: '/products?category=disinfectants' },
          { name: 'Cleaning Wipes', link: '/products?category=cleaning-wipes' },
          { name: 'Hand Sanitizers', link: '/products?category=hand-sanitizers' }
        ]
      },
      {
        title: 'Health & Safety',
        items: [
          { name: 'First Aid Kits', link: '/products?category=first-aid-kits' },
          { name: 'Thermometers', link: '/products?category=thermometers' },
          { name: 'Masks & Gloves', link: '/products?category=masks-gloves' }
        ]
      }
    ]
  },
  { 
    name: 'Health Devices', 
    slug: 'health-devices', 
    icon: '🩺',
    subcategories: [
      {
        title: 'Monitoring Devices',
        items: [
          { name: 'Blood Pressure Monitors', link: '/products?category=blood-pressure-monitors' },
          { name: 'Glucose Meters', link: '/products?category=glucose-meters' },
          { name: 'Pulse Oximeters', link: '/products?category=pulse-oximeters' }
        ]
      },
      {
        title: 'Fitness Trackers',
        items: [
          { name: 'Smart Watches', link: '/products?category=smart-watches' },
          { name: 'Fitness Bands', link: '/products?category=fitness-bands' },
          { name: 'Pedometers', link: '/products?category=pedometers' }
        ]
      },
      {
        title: 'Therapy Devices',
        items: [
          { name: 'Nebulizers', link: '/products?category=nebulizers' },
          { name: 'CPAP Machines', link: '/products?category=cpap-machines' },
          { name: 'Massagers', link: '/products?category=massagers' }
        ]
      }
    ]
  },
  { 
    name: 'Ayurveda', 
    slug: 'ayurveda', 
    icon: '🌿',
    subcategories: [
      {
        title: 'Ayurvedic Medicines',
        items: [
          { name: 'Digestive Health', link: '/products?category=ayurvedic-digestive' },
          { name: 'Immunity Boosters', link: '/products?category=ayurvedic-immunity' },
          { name: 'Respiratory Care', link: '/products?category=ayurvedic-respiratory' }
        ]
      },
      {
        title: 'Herbal Products',
        items: [
          { name: 'Herbal Teas', link: '/products?category=herbal-teas' },
          { name: 'Ayurvedic Oils', link: '/products?category=ayurvedic-oils' },
          { name: 'Chyawanprash', link: '/products?category=chyawanprash' }
        ]
      }
    ]
  },
  { 
    name: 'Women Care', 
    slug: 'women-care', 
    icon: '👩',
    subcategories: [
      {
        title: 'Feminine Hygiene',
        items: [
          { name: 'Sanitary Pads', link: '/products?category=sanitary-pads' },
          { name: 'Tampons', link: '/products?category=tampons' },
          { name: 'Intimate Wash', link: '/products?category=intimate-wash' }
        ]
      },
      {
        title: 'Pregnancy & Nursing',
        items: [
          { name: 'Pregnancy Tests', link: '/products?category=pregnancy-tests' },
          { name: 'Prenatal Vitamins', link: '/products?category=prenatal-vitamins' },
          { name: 'Nursing Essentials', link: '/products?category=nursing-essentials' }
        ]
      },
      {
        title: 'Women\'s Health',
        items: [
          { name: 'Hormonal Care', link: '/products?category=hormonal-care' },
          { name: 'Menopause Support', link: '/products?category=menopause-support' },
          { name: 'PCOS Care', link: '/products?category=pcos-care' }
        ]
      }
    ]
  },
  { 
    name: 'Health Conditions', 
    slug: 'health-conditions', 
    icon: '❤️',
    subcategories: [
      {
        title: 'Chronic Conditions',
        items: [
          { name: 'Diabetes Care', link: '/products?category=diabetes-care' },
          { name: 'Cardiac Care', link: '/products?category=cardiac-care' },
          { name: 'Hypertension', link: '/products?category=hypertension' }
        ]
      },
      {
        title: 'Common Ailments',
        items: [
          { name: 'Pain Relief', link: '/products?category=pain-relief' },
          { name: 'Stomach Care', link: '/products?category=stomach-care' },
          { name: 'Cold & Cough', link: '/products?category=cold-cough' },
          { name: 'Fever & Flu', link: '/products?category=fever-flu' }
        ]
      },
      {
        title: 'Specialty Care',
        items: [
          { name: 'Skin Conditions', link: '/products?category=skin-conditions' },
          { name: 'Eye Care', link: '/products?category=eye-care' },
          { name: 'Bone & Joint', link: '/products?category=bone-joint' }
        ]
      }
    ]
  },
]

const CategoryNav = () => {
  const [activeCategory, setActiveCategory] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [clickedCategory, setClickedCategory] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0 })
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef(null)
  const categoryRefs = useRef({})
  const hoverTimeoutRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCategoryClick = (slug, hasSubcategories, index) => {
    if (isMobile && hasSubcategories) {
      // On mobile, toggle dropdown on click
      setClickedCategory(clickedCategory === index ? null : index)
      setHoveredCategory(null)
    } else if (!hasSubcategories) {
      setActiveCategory(slug)
      navigate(`/products?category=${encodeURIComponent(slug)}`)
      setClickedCategory(null)
    }
  }

  const handleMouseEnter = (index) => {
    // Only handle hover on desktop
    if (isMobile) return
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    // Calculate position of the category button using viewport coordinates
    const categoryElement = categoryRefs.current[index]
    if (categoryElement) {
      const rect = categoryElement.getBoundingClientRect()
      
      // Use viewport coordinates for fixed positioning
      const centerX = rect.left + (rect.width / 2)
      const top = rect.bottom
      
      setDropdownPosition({
        left: centerX,
        top: top,
        width: rect.width
      })
    }
    
    setHoveredCategory(index)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 200)
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      // Check initial state after a small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        checkScrollButtons()
      }, 100)
      
      checkScrollButtons()
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        clearTimeout(timeoutId)
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [checkScrollButtons])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    if (!isMobile || clickedCategory === null) return

    const handleClickOutside = (event) => {
      const target = event.target
      const isClickInsideCategoryNav = 
        scrollContainerRef.current?.contains(target) ||
        event.target.closest('.mobile-dropdown-menu')
      
      if (!isClickInsideCategoryNav) {
        setClickedCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMobile, clickedCategory])

  // Update dropdown position on scroll when a category is hovered (desktop only)
  useEffect(() => {
    if (hoveredCategory !== null && !isMobile) {
      const updatePosition = () => {
        const categoryElement = categoryRefs.current[hoveredCategory]
        if (categoryElement) {
          const rect = categoryElement.getBoundingClientRect()
          const centerX = rect.left + (rect.width / 2)
          const top = rect.bottom
          
          setDropdownPosition({
            left: centerX,
            top: top,
            width: rect.width
          })
        }
      }

      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [hoveredCategory, isMobile])

  const activeCategoryData = isMobile 
    ? (clickedCategory !== null ? categories[clickedCategory] : null)
    : (hoveredCategory !== null ? categories[hoveredCategory] : null)

  return (
    <div className="relative z-50">
      <section className="bg-white py-1 md:py-2 border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
        <div className="relative">
          {/* Left Arrow - Hidden on mobile */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-apollo-700 hover:bg-apollo-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Scrollable Categories */}
          <div
            ref={scrollContainerRef}
              className={`relative flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide ${
              showLeftArrow ? 'md:pl-8 pl-1' : 'pl-1'
            } ${showRightArrow ? 'md:pr-8 pr-1' : 'pr-1'}`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((category, index) => {
              const hasSubcategories = category.subcategories && category.subcategories.length > 0
              const isHovered = hoveredCategory === index
              const isClicked = clickedCategory === index
              const isActive = activeCategory === category.slug
              const showDropdown = isMobile ? isClicked : isHovered

              return (
                <div
                  key={category.slug}
                  ref={(el) => {
                    if (el) categoryRefs.current[index] = el
                  }}
                  className="relative z-40"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
              <button
                    type="button"
                    onClick={() => handleCategoryClick(category.slug, hasSubcategories, index)}
                    className={`flex flex-col items-center gap-0.5 md:gap-1 min-w-[70px] md:min-w-[88px] py-1.5 md:py-2 px-2 md:px-3 rounded-lg transition-all duration-300 whitespace-nowrap group relative ${
                      isActive
                    ? 'bg-apollo-50 text-apollo-700'
                    : 'text-gray-700 md:hover:bg-gray-50'
                }`}
              >
                <div className={`text-xl md:text-2xl transition-transform md:group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                  {category.icon}
                </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                <span className={`text-xs md:text-sm font-semibold ${
                        isActive ? 'text-apollo-700' : 'text-gray-700'
                }`}>
                  {category.name}
                </span>
                      {hasSubcategories && (
                        <ChevronDown 
                          size={12}
                          className={`hidden md:block transition-transform duration-200 ${
                            isHovered ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                      {hasSubcategories && isMobile && (
                        <ChevronDown 
                          size={10}
                          className={`md:hidden transition-transform duration-200 ${
                            isClicked ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                {/* Active Underline */}
                    {isActive && (
                  <div className="w-full h-0.5 md:h-1 bg-apollo-700 rounded-full mt-0.5 animate-pulse" />
                )}
              </button>
                </div>
              )
            })}

            {/* Desktop Subcategory Dropdown Menu - Fixed positioning */}
            {activeCategoryData && !isMobile && activeCategoryData.subcategories && activeCategoryData.subcategories.length > 0 && (
              <div
                className="hidden md:block fixed bg-white shadow-2xl border-t border-gray-200 rounded-b-lg"
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current)
                    hoverTimeoutRef.current = null
                  }
                }}
                onMouseLeave={handleMouseLeave}
                style={{
                  left: `${dropdownPosition.left}px`,
                  top: `${dropdownPosition.top}px`,
                  minWidth: '400px',
                  maxWidth: '600px',
                  width: 'auto',
                  animation: 'slideDown 0.2s ease-out',
                  transform: 'translateX(-50%)',
                  zIndex: 9999,
                  position: 'fixed'
                }}
              >
                <div className="px-6 py-6">
                  <div className="grid grid-cols-2 gap-6">
                    {activeCategoryData.subcategories.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="flex flex-col">
                        <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                          {section.title}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          {section.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              to={item.link || '#'}
                              className="text-sm text-gray-600 hover:text-apollo-700 py-1.5 transition-colors duration-150"
                              onClick={() => {
                                setHoveredCategory(null)
                                setClickedCategory(null)
                              }}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Subcategory Dropdown Menu - Full width below categories */}
          {activeCategoryData && isMobile && activeCategoryData.subcategories && activeCategoryData.subcategories.length > 0 && (
            <div className="mobile-dropdown-menu md:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">{activeCategoryData.name}</h2>
                <button
                  onClick={() => setClickedCategory(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  aria-label="Close menu"
                >
                  Close
                </button>
              </div>
              <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {activeCategoryData.subcategories.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="flex flex-col">
                      <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
                        {section.title}
                      </h3>
                      <div className="flex flex-col gap-1">
                        {section.items.map((item, itemIndex) => (
                          <Link
                            key={itemIndex}
                            to={item.link || '#'}
                            className="text-sm text-gray-600 py-2 px-2 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
                            onClick={() => {
                              setClickedCategory(null)
                              setHoveredCategory(null)
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Arrow - Hidden on mobile */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-apollo-700 hover:bg-apollo-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CategoryNav

