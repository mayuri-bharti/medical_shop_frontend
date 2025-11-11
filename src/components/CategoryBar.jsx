import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const ChevronDownIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.23 7.21a1 1 0 0 1 1.4-.02L10 10.44l3.37-3.25a1 1 0 0 1 1.38 1.44l-4.06 3.91a1 1 0 0 1-1.38 0L5.25 8.63a1 1 0 0 1-.02-1.42z"
      fill="currentColor"
    />
  </svg>
)

const DEFAULT_CATEGORIES = [
  {
    name: 'Prescription Medicines',
    shortName: 'Rx Meds',
    query: 'Prescription Medicines',
    iconUrl: 'data:image/webp;base64,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',
    subcategories: [
      {
        title: 'Common Ailments',
        items: [
          { name: 'Pain Relief', link: '/subcategory/pain-relief' },
          { name: 'Antibiotics', link: '/subcategory/antibiotics' },
          { name: 'Allergy & Cold', link: '/subcategory/allergy-cold' }
        ]
      },
      {
        title: 'Chronic Diseases',
        items: [
          { name: 'Diabetes Care', link: '/subcategory/diabetes-care' },
          { name: 'Cardiology Meds', link: '/subcategory/cardiology-meds' },
          { name: 'Thyroid & Hormones', link: '/subcategory/thyroid-hormones' }
        ]
      }
    ]
  },
  {
    name: 'Over-the-Counter Drugs',
    shortName: 'OTC',
    query: 'Over-the-Counter Drugs',
    iconUrl: 'https://th.bing.com/th/id/OIP.hzf7xk9cLveJbChh40T58gHaH0?w=205&h=216&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    subcategories: [
      {
        title: 'First Aid & Home',
        items: [
          { name: 'Fever & Flu', link: '/subcategory/fever-flu' },
          { name: 'Antiseptics', link: '/subcategory/antiseptics' },
          { name: 'Eye/Ear Drops', link: '/subcategory/eye-ear-drops' }
        ]
      },
      {
        title: 'Digestive Health',
        items: [
          { name: 'Digestion & Acidity', link: '/subcategory/digestion-acidity' },
          { name: 'Laxatives', link: '/subcategory/laxatives' },
          { name: 'Stomach Care', link: '/subcategory/stomach-care' }
        ]
      }
    ]
  },
  {
    name: 'Health Supplements',
    shortName: 'Supplements',
    query: 'Health Supplements',
    iconUrl: 'data:image/webp;base64,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',
    subcategories: [
      {
        title: 'Daily Vitamins',
        items: [
          { name: 'Multivitamins', link: '/subcategory/multivitamins' },
          { name: 'Vitamin D & C', link: '/subcategory/vitamin-d-c' },
          { name: 'Calcium & Iron', link: '/subcategory/calcium-iron' }
        ]
      },
      {
        title: 'Fitness & Body',
        items: [
          { name: 'Protein Powder', link: '/subcategory/protein-powder' },
          { name: 'Weight Management', link: '/subcategory/weight-management' },
          { name: 'Herbal & Organic', link: '/subcategory/herbal-organic' }
        ]
      }
    ]
  },
  {
    name: 'Personal & Beauty Care',
    shortName: 'Beauty',
    query: 'Beauty',
    iconUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&h=120&fit=crop&q=80',
    subcategories: [
      {
        title: 'Skincare Essentials',
        items: [
          { name: 'Moisturizers', link: '/subcategory/moisturizers' },
          { name: 'Serums & Toners', link: '/subcategory/serums-toners' },
          { name: 'Sunscreen', link: '/subcategory/sunscreen' }
        ]
      },
      {
        title: 'Hair & Hygiene',
        items: [
          { name: 'Shampoos & Conditioners', link: '/subcategory/shampoos-conditioners' },
          { name: 'Deodorants & Perfumes', link: '/subcategory/deodorants-perfumes' },
          { name: 'Feminine Hygiene', link: '/subcategory/feminine-hygiene' }
        ]
      }
    ]
  },
  {
    name: 'Baby & Mom Care',
    shortName: 'Baby Care',
    query: 'Baby Care',
    iconUrl: 'https://res.cloudinary.com/dcu2kdrva/image/upload/v1762846267/products/crgbr4s73yslhojk7iym.png',
    subcategories: [
      {
        title: 'For Baby',
        items: [
          { name: 'Diapers & Wipes', link: '/subcategory/diapers-wipes' },
          { name: 'Baby Food', link: '/subcategory/baby-food' },
          { name: 'Bath & Skincare', link: '/subcategory/bath-skincare' }
        ]
      },
      {
        title: 'For Mother',
        items: [
          { name: 'Maternity Care', link: '/subcategory/maternity-care' },
          { name: 'Breastfeeding Aids', link: '/subcategory/breastfeeding-aids' },
          { name: 'Postpartum Support', link: '/subcategory/postpartum-support' }
        ]
      }
    ]
  },
  {
    name: 'Medical Devices',
    shortName: 'Devices',
    query: 'Medical Devices',
    iconUrl: 'https://th.bing.com/th/id/OIP.A8ZOBMtdCGUaI-PrDo1sdwHaE7?w=230&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    subcategories: [
      {
        title: 'Home Monitoring',
        items: [
          { name: 'BP Monitors', link: '/subcategory/bp-monitors' },
          { name: 'Oximeters', link: '/subcategory/oximeters' },
          { name: 'Thermometers', link: '/subcategory/thermometers' }
        ]
      },
      {
        title: 'Mobility & Aids',
        items: [
          { name: 'Wheelchairs', link: '/subcategory/wheelchairs' },
          { name: 'Supports & Braces', link: '/subcategory/supports-braces' },
          { name: 'Physiotherapy', link: '/subcategory/physiotherapy' }
        ]
      }
    ]
  },
  {
    name: 'Elder Care',
    shortName: 'Senior',
    query: 'Elder Care',
    iconUrl: 'https://th.bing.com/th/id/OIP.OtUcT7B20z51IH1yNspZFwHaFR?w=241&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    subcategories: [
      {
        title: 'Daily Essentials',
        items: [
          { name: 'Adult Diapers', link: '/subcategory/adult-diapers' },
          { name: 'Nutritional Drinks', link: '/subcategory/nutritional-drinks' },
          { name: 'Walker & Sticks', link: '/subcategory/walker-sticks' }
        ]
      },
      {
        title: 'Health Support',
        items: [
          { name: 'Heart Care', link: '/subcategory/heart-care' },
          { name: 'Bone & Joint', link: '/subcategory/bone-joint' },
          { name: 'Memory Support', link: '/subcategory/memory-support' }
        ]
      }
    ]
  },
  {
    name: 'Sexual Wellness',
    shortName: 'Wellness',
    query: 'Sexual Wellness',
    iconUrl: 'https://th.bing.com/th/id/OIP.PU5s0DFVTyK_SAZOQ8wcMgHaHa?w=161&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    subcategories: [
      {
        title: 'Men',
        items: [
          { name: 'Condoms', link: '/subcategory/condoms' },
          { name: 'Performance', link: '/subcategory/performance' },
          { name: 'Lubricants', link: '/subcategory/lubricants' }
        ]
      },
      {
        title: 'Women',
        items: [
          { name: 'Intimate Care', link: '/subcategory/intimate-care' },
          { name: 'Pregnancy Tests', link: '/subcategory/pregnancy-tests' },
          { name: 'Wellness Kits', link: '/subcategory/wellness-kits' }
        ]
      }
    ]
  }
]

const CATEGORY_API_ENABLED = import.meta.env.VITE_CATEGORY_API_ENABLED === 'true'
const CATEGORY_API_ENDPOINT = import.meta.env.VITE_CATEGORY_API_ENDPOINT || '/api/categories'

const CategoryBar = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeDesktopIdx, setActiveDesktopIdx] = useState(null)
  const [activeMobileIdx, setActiveMobileIdx] = useState(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isFallbackData, setIsFallbackData] = useState(false)
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
    closeTimerRef.current = setTimeout(() => setActiveDesktopIdx(null), 150)
  }, [clearCloseTimer])

  const slugify = useCallback((value) => {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [])

  const normalizeCategories = useCallback((data) => {
    const rawList = Array.isArray(data) ? data : data?.categories
    if (!Array.isArray(rawList)) return []

    return rawList.map((category) => {
      const sourceSubcategories = Array.isArray(category?.subcategories)
        ? category.subcategories
        : Array.isArray(category?.dropdownSections)
          ? category.dropdownSections
          : []

      const normalizedSubcategories = sourceSubcategories.map((section) => {
        const itemsSource = Array.isArray(section?.items)
          ? section.items
          : Array.isArray(section?.links)
            ? section.links
            : []

        return {
          title: section?.title ?? '',
          items: itemsSource.map((item) => {
            const rawLink = item?.link ?? item?.url ?? (item?.slug ? `/subcategory/${item.slug}` : null)
            let link = rawLink

            if (typeof link === 'string') {
              if (link.startsWith('#')) {
                link = `/subcategory/${slugify(link.slice(1))}`
              } else if (!link.startsWith('/') && !/^https?:\/\//i.test(link)) {
                link = `/subcategory/${slugify(link)}`
              }
            } else if (item?.name) {
              link = `/subcategory/${slugify(item.name)}`
            } else {
              link = '#'
            }

            return {
              name: item?.name ?? item?.title ?? '',
              link: link || '#'
            }
          })
        }
      })

      return {
        name: category?.name ?? '',
        shortName: category?.shortName ?? category?.name ?? '',
        iconUrl: category?.iconUrl ?? '',
        query: category?.query ?? category?.name ?? '',
        subcategories: normalizedSubcategories
      }
    })
  }, [slugify])

  useEffect(() => {
    const controller = new AbortController()

    if (!CATEGORY_API_ENABLED) {
      setCategories(DEFAULT_CATEGORIES)
      setIsFallbackData(true)
      setError(null)
      setLoading(false)
      return () => {}
    }

    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(CATEGORY_API_ENDPOINT, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load categories (${response.status})`)
        }

        const data = await response.json()
        const normalized = normalizeCategories(data)
        if (normalized.length === 0) {
          setCategories(DEFAULT_CATEGORIES)
          setIsFallbackData(true)
          setError('No categories returned from server. Showing default categories.')
        } else {
          setCategories(normalized)
          setIsFallbackData(false)
          setError(null)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch categories', err)
        setError(`${err.message || 'Unable to load categories.'} Showing default categories.`)
        setCategories(DEFAULT_CATEGORIES)
        setIsFallbackData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()

    return () => controller.abort()
  }, [normalizeCategories])

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
    if (isDesktop) {
      setActiveMobileIdx(null)
    } else {
      setActiveDesktopIdx(null)
      clearCloseTimer()
    }
  }, [clearCloseTimer, isDesktop])

  const handleCategoryOpen = useCallback((idx) => {
    clearCloseTimer()
    setActiveDesktopIdx(idx)
  }, [clearCloseTimer])

  const handleDesktopCategoryToggle = useCallback((idx) => {
    setActiveDesktopIdx((prev) => (prev === idx ? null : idx))
  }, [])

  const handleMobileCategoryToggle = useCallback((idx) => {
    setActiveMobileIdx((prev) => (prev === idx ? null : idx))
  }, [])

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

  const handleSubcategoryLinkClick = useCallback(() => {
    setActiveDesktopIdx(null)
    setActiveMobileIdx(null)
  }, [])

  const hasCategories = categories.length > 0
  const showNoCategories = !loading && !hasCategories
  const mobileActiveCategory =
    activeMobileIdx !== null && activeMobileIdx >= 0 && activeMobileIdx < categories.length
      ? categories[activeMobileIdx]
      : null
  const mobileSubcategories = mobileActiveCategory?.subcategories ?? []

  return (
    <>
      <div className="relative z-30 mt-1 w-full py-2">
        <div className="mx-auto flex w-full max-w-full gap-3 overflow-x-auto px-3 pb-3 md:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {loading && (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`mobile-skeleton-${index}`}
                className="flex min-w-[5.75rem] flex-col items-center gap-2 rounded-xl bg-white px-2 py-3 text-center shadow-sm"
              >
                <div className="h-14 w-14 rounded-full bg-slate-200" />
                <div className="h-2 w-16 rounded-full bg-slate-200" />
              </div>
            ))
          )}

          {!loading && showNoCategories && (
            <div className="flex w-full items-center justify-center py-2">
              <p className="text-sm text-slate-500">No categories available.</p>
            </div>
          )}

          {!loading && hasCategories && (
            categories.map((category, idx) => {
              const hasSubsections = category.subcategories?.some((section) => section.items?.length) ?? false
              const isActive = activeMobileIdx === idx

              return (
                <button
                  key={category.name || idx}
                  type="button"
                  onClick={() => {
                    if (hasSubsections) {
                      handleMobileCategoryToggle(idx)
                    } else {
                      handleCategoryNavigate(category.query || category.shortName || category.name)
                    }
                  }}
                  className={`flex min-w-[5.75rem] flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-center shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${isActive ? 'ring-2 ring-medical-400' : ''}`}
                >
                  <img
                    src={category.iconUrl}
                    alt={category.name}
                    className="h-14 w-14 rounded-full object-cover shadow-sm"
                    loading="lazy"
                  />
                  <div className="flex items-center gap-1">
                    <span className="truncate text-[11px] font-semibold text-slate-700">
                      {category.shortName}
                    </span>
                    {hasSubsections && (
                      <ChevronDownIcon
                        className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isActive ? 'rotate-180 text-medical-600' : ''}`}
                      />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {mobileActiveCategory && (
          <div className="mx-3 mb-3 mt-1 rounded-xl bg-white p-4 shadow-lg transition-opacity duration-200 ease-out md:hidden">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{mobileActiveCategory.name}</p>
              <button
                type="button"
                className="text-xs font-medium text-slate-500"
                onClick={() => setActiveMobileIdx(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-4">
              {mobileSubcategories.some((section) => section.items?.length) ? (
                mobileSubcategories.map((section) => (
                  <div key={section.title || 'mobile-section'} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section.title}</p>
                    <div className="flex flex-col gap-2">
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.link || '#'}
                          className="rounded-md px-2 py-1 text-left text-sm text-slate-600 transition duration-150 hover:bg-medical-50 hover:text-medical-700"
                          onClick={(event) => {
                            if (!item.link || item.link === '#') {
                              event.preventDefault()
                              return
                            }
                            handleSubcategoryLinkClick()
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No subcategories found.</p>
              )}
            </div>
          </div>
        )}

        {error && !loading && (
          <p
            className={`mx-3 mb-2 text-xs md:mx-auto md:text-center ${
              isFallbackData ? 'text-amber-600' : 'text-rose-500'
            }`}
          >
            {error}
          </p>
        )}

        <div className="mx-auto hidden w-full max-w-full grid-cols-4 items-end gap-5 px-1 sm:max-w-6xl sm:grid-cols-6 sm:gap-3 sm:px-3 md:grid md:grid-cols-8 md:gap-4 md:px-0">
          {loading && (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`desktop-skeleton-${index}`} className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
                <div className="h-2 w-12 animate-pulse rounded bg-slate-200" />
              </div>
            ))
          )}

          {!loading && showNoCategories && (
            <div className="col-span-full flex justify-center">
              <p className="text-sm text-slate-500">No categories available.</p>
            </div>
          )}

          {!loading && hasCategories && (
            categories.map((category, idx) => {
              const isActive = activeDesktopIdx === idx
              const hasSubsections = category.subcategories?.some((section) => section.items?.length) ?? false

              return (
                <div
                  key={category.name || idx}
                  className="relative flex min-w-0 flex-col items-center text-center"
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className={`group flex w-full flex-col items-center rounded-lg px-1 py-1 transition-all duration-200 hover:-translate-y-1 hover:bg-white/60 hover:shadow-sm hover:ring-1 hover:ring-white/70 sm:px-2 sm:py-1.5 ${isActive ? 'bg-white/70 shadow-sm ring-1 ring-white/80' : ''}`}
                    onClick={() => {
                      if (hasSubsections) {
                        handleDesktopCategoryToggle(idx)
                      } else {
                        handleCategoryNavigate(category.query || category.shortName || category.name)
                      }
                    }}
                    onTouchStart={(event) => {
                      if (!isDesktop) return
                      event.preventDefault()
                      handleDesktopCategoryToggle(idx)
                    }}
                    onFocus={() => handleMouseEnter(idx)}
                    onBlur={handleMouseLeave}
                    aria-expanded={isActive}
                    aria-haspopup={hasSubsections}
                  >
                    <div className="flex flex-col items-center justify-center rounded-lg p-2 transition-colors duration-150 group-hover:bg-gray-50">
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="h-12 w-20 object-contain"
                        loading="lazy"
                      />
                      <div className="mt-2 flex items-center gap-1">
                        <p className="truncate text-xs font-medium text-gray-900">{category.shortName}</p>
                        {hasSubsections && (
                          <ChevronDownIcon
                            className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isActive ? 'translate-y-[1px] rotate-180 text-medical-600' : ''}`}
                          />
                        )}
                      </div>
                    </div>
                  </button>

                  <div
                    className={`pointer-events-auto absolute left-1/2 top-full mt-3 hidden w-[min(26rem,90vw)] -translate-x-1/2 rounded-xl bg-white p-5 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 transition-all duration-200 ease-out sm:w-[min(30rem,90vw)] md:block md:p-6 ${isActive ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
                    onMouseEnter={() => handleMouseEnter(idx)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {hasSubsections ? (
                        category.subcategories.map((section) => (
                          <div key={section.title || 'desktop-section'} className="flex flex-col space-y-2 text-left">
                            <p className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                              {section.title}
                            </p>
                            {section.items.map((item) => (
                              <Link
                                key={item.name}
                                to={item.link || '#'}
                                className="rounded-md px-2 py-1 text-left text-sm text-slate-600 transition duration-150 hover:bg-medical-50 hover:text-medical-700"
                                onClick={(event) => {
                                  if (!item.link || item.link === '#') {
                                    event.preventDefault()
                                    return
                                  }
                                  handleSubcategoryLinkClick()
                                }}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        ))
                      ) : (
                        <p className="col-span-full text-sm text-slate-500">No subcategories found.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500 md:hidden">
        Browse all categories tailored for you.
      </p>
    </>
  )
}

export default CategoryBar