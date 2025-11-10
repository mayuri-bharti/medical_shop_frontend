import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const categories = [
  {
    name: 'Prescription Medicines',
    shortName: 'Rx Meds',
    query: 'Prescription Medicines',
    iconUrl: 'https://images.unsplash.com/photo-1582719478181-2cf4e1baedb5?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'Common Ailments',
        links: [
          { name: 'Pain Relief', url: '#pain' },
          { name: 'Antibiotics', url: '#antibiotics' },
          { name: 'Allergy & Cold', url: '#allergy' }
        ]
      },
      {
        title: 'Chronic Diseases',
        links: [
          { name: 'Diabetes Care', url: '#diabetes' },
          { name: 'Cardiology Meds', url: '#cardio' },
          { name: 'Thyroid & Hormones', url: '#thyroid' }
        ]
      }
    ]
  },
  {
    name: 'Over-the-Counter Drugs',
    shortName: 'OTC',
    query: 'Over-the-Counter Drugs',
    iconUrl: 'https://images.unsplash.com/photo-1580281780460-82d277b0e3a3?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'First Aid & Home',
        links: [
          { name: 'Fever & Flu', url: '#flu' },
          { name: 'Antiseptics', url: '#antiseptics' },
          { name: 'Eye/Ear Drops', url: '#eyedrops' }
        ]
      },
      {
        title: 'Digestive Health',
        links: [
          { name: 'Digestion & Acidity', url: '#digestive' },
          { name: 'Laxatives', url: '#laxatives' },
          { name: 'Stomach Care', url: '#stomach' }
        ]
      }
    ]
  },
  {
    name: 'Health Supplements',
    shortName: 'Supplements',
    query: 'Health Supplements',
    iconUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'Daily Vitamins',
        links: [
          { name: 'Multivitamins', url: '#multi' },
          { name: 'Vitamin D & C', url: '#vitd' },
          { name: 'Calcium & Iron', url: '#calcium' }
        ]
      },
      {
        title: 'Fitness & Body',
        links: [
          { name: 'Protein Powder', url: '#protein' },
          { name: 'Weight Management', url: '#weight' },
          { name: 'Herbal & Organic', url: '#herbal' }
        ]
      }
    ]
  },
  {
    name: 'Personal & Beauty Care',
    shortName: 'Beauty',
    query: 'Beauty',
    iconUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'Skincare Essentials',
        links: [
          { name: 'Moisturizers', url: '#skin' },
          { name: 'Serums & Toners', url: '#serums' },
          { name: 'Sunscreen', url: '#sunscreen' }
        ]
      },
      {
        title: 'Hair & Hygiene',
        links: [
          { name: 'Shampoos & Conditioners', url: '#shampoo' },
          { name: 'Deodorants & Perfumes', url: '#deo' },
          { name: 'Feminine Hygiene', url: '#feminine' }
        ]
      }
    ]
  },
  {
    name: 'Baby & Mom Care',
    shortName: 'Baby Care',
    query: 'Baby Care',
    iconUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'For Baby',
        links: [
          { name: 'Diapers & Wipes', url: '#diapers' },
          { name: 'Baby Food', url: '#babyfood' },
          { name: 'Bath & Skincare', url: '#lotion' }
        ]
      },
      {
        title: 'For Mother',
        links: [
          { name: 'Maternity Care', url: '#maternity' },
          { name: 'Breastfeeding Aids', url: '#breastfeed' },
          { name: 'Postpartum Support', url: '#postpartum' }
        ]
      }
    ]
  },
  {
    name: 'Medical Devices',
    shortName: 'Devices',
    query: 'Medical Devices',
    iconUrl: 'https://images.unsplash.com/photo-1582719478250-428daf0c0d4b?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'Home Monitoring',
        links: [
          { name: 'BP Monitors', url: '#bp' },
          { name: 'Oximeters', url: '#oximeter' },
          { name: 'Thermometers', url: '#thermometer' }
        ]
      },
      {
        title: 'Mobility & Aids',
        links: [
          { name: 'Wheelchairs', url: '#wheelchair' },
          { name: 'Supports & Braces', url: '#supports' },
          { name: 'Physiotherapy', url: '#physio' }
        ]
      }
    ]
  },
  {
    name: 'Elder Care',
    shortName: 'Senior',
    query: 'Elder Care',
    iconUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'Daily Essentials',
        links: [
          { name: 'Adult Diapers', url: '#adult-diapers' },
          { name: 'Nutritional Drinks', url: '#nutri-drinks' },
          { name: 'Walker & Sticks', url: '#walker' }
        ]
      },
      {
        title: 'Health Support',
        links: [
          { name: 'Heart Care', url: '#heart-care' },
          { name: 'Bone & Joint', url: '#bone' },
          { name: 'Memory Support', url: '#memory' }
        ]
      }
    ]
  },
  {
    name: 'Sexual Wellness',
    shortName: 'Wellness',
    query: 'Sexual Wellness',
    iconUrl: 'https://images.unsplash.com/photo-1516826431361-749a0e5dde43?w=120&h=120&fit=crop&q=80',
    dropdownSections: [
      {
        title: 'Men',
        links: [
          { name: 'Condoms', url: '#condoms' },
          { name: 'Performance', url: '#performance' },
          { name: 'Lubricants', url: '#lubricants' }
        ]
      },
      {
        title: 'Women',
        links: [
          { name: 'Intimate Care', url: '#intimate' },
          { name: 'Pregnancy Tests', url: '#pregnancy' },
          { name: 'Wellness Kits', url: '#wellness-kits' }
        ]
      }
    ]
  }
]

const CategoryBar = () => {
  const [activeIdx, setActiveIdx] = useState(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const closeTimerRef = useRef(null)
  const navigate = useNavigate()

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => setActiveIdx(null), 150)
  }, [clearCloseTimer])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleChange = (event) => setIsDesktop(event.matches)

    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      clearCloseTimer()
    }
  }, [clearCloseTimer])

  useEffect(() => {
    if (!isDesktop) {
      setActiveIdx(null)
    }
  }, [isDesktop])

  const handleCategoryOpen = useCallback((idx) => {
    clearCloseTimer()
    setActiveIdx(idx)
  }, [clearCloseTimer])

  const handleCategoryToggle = useCallback((idx) => {
    setActiveIdx((prev) => (prev === idx ? null : idx))
  }, [])

  const handleLinkClick = useCallback((label) => {
    setActiveIdx(null)
    navigate(`/products?category=${encodeURIComponent(label)}`)
  }, [navigate])

  const handleCategoryNavigate = useCallback((label) => {
    navigate(`/products?category=${encodeURIComponent(label)}`)
  }, [navigate])

  const handleMouseEnter = useCallback((idx) => {
    if (!isDesktop) return
    handleCategoryOpen(idx)
  }, [handleCategoryOpen, isDesktop])

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop) return
    scheduleClose()
  }, [isDesktop, scheduleClose])

  return (
    <>
      <div className="relative z-30 mt-1 w-full bg-gradient-to-r from-blue-50 to-cyan-50 py-2 shadow-sm">
        {/* Mobile: horizontal scroll row */}
        <div className="mx-auto flex w-full max-w-full gap-3 overflow-x-auto px-3 pb-3 md:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => handleCategoryNavigate(category.query || category.shortName || category.name)}
              className="flex min-w-[5.75rem] flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-center shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                src={category.iconUrl}
                alt={category.name}
                className="h-14 w-14 rounded-full object-cover shadow-sm"
                loading="lazy"
              />
              <span className="w-full truncate text-[11px] font-semibold text-slate-700">
                {category.shortName}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop: interactive dropdowns */}
        <div className="mx-auto hidden w-full max-w-full grid-cols-4 items-end gap-2 px-2 sm:max-w-6xl sm:grid-cols-6 sm:gap-3 sm:px-3 md:grid md:grid-cols-8 md:gap-4 md:px-0">
          {categories.map((category, idx) => {
            const isActive = activeIdx === idx

            return (
              <div
                key={category.name}
                className="relative flex min-w-0 flex-col items-center text-center"
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`group flex w-full flex-col items-center rounded-lg px-1 py-1 transition-all duration-200 hover:-translate-y-1 hover:bg-white/60 hover:shadow-sm hover:ring-1 hover:ring-white/70 sm:px-2 sm:py-1.5 ${isActive ? 'bg-white/70 shadow-sm ring-1 ring-white/80' : ''}`}
                  onClick={() => handleCategoryToggle(idx)}
                  onTouchStart={(event) => {
                    if (!isDesktop) return
                    event.preventDefault()
                    handleCategoryToggle(idx)
                  }}
                  onFocus={() => handleMouseEnter(idx)}
                  onBlur={handleMouseLeave}
                  aria-expanded={isActive}
                  aria-haspopup="true"
                >
                  <img
                    src={category.iconUrl}
                    alt={category.name}
                    className="mx-auto h-10 w-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12"
                    loading="lazy"
                  />
                  <p
                    className="mt-1 w-full truncate text-xs font-semibold text-gray-900 sm:text-sm"
                    title={category.name}
                  >
                    {category.shortName}
                  </p>
                </button>

                <div
                  className={`pointer-events-auto absolute left-1/2 top-full mt-3 w-[min(26rem,90vw)] -translate-x-1/2 rounded-xl bg-white p-5 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 transition-all duration-200 ease-out sm:w-[min(30rem,90vw)] md:p-6 ${isActive ? 'translate-y-0 opacity-100 visible' : 'pointer-events-none -translate-y-2 opacity-0 invisible'} hidden md:block`}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {category.dropdownSections.map((section) => (
                      <div key={section.title} className="flex flex-col space-y-2 text-left">
                        <p className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                          {section.title}
                        </p>
                        {section.links.map((link) => (
                          <button
                            key={link.name}
                            type="button"
                            className="rounded-md px-2 py-1 text-left text-sm text-slate-600 transition duration-150 hover:bg-medical-50 hover:text-medical-700"
                            onClick={() => handleLinkClick(link.name)}
                          >
                            {link.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500 md:hidden">
        Browse all categories tailored for you.
      </p>
    </>
  )
}

export default CategoryBar