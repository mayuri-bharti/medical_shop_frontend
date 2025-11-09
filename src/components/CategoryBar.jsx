import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const categories = [
  {
    name: 'Prescription Medicines',
    shortName: 'Rx Meds',
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
  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <>
      <div className="relative z-30 mt-4 w-full bg-gradient-to-r from-blue-50 to-cyan-50 py-3 shadow-sm">
        <div className="mx-auto grid w-full max-w-full grid-cols-8 items-end gap-2 px-2 sm:max-w-6xl sm:gap-3 sm:px-3 md:gap-4 md:px-0">
            {categories.map((category, idx) => (
              <div
                key={category.name}
              className="group relative flex min-w-0 cursor-pointer flex-col items-center px-1 py-1 text-center transition-all hover:-translate-y-1 hover:z-40 sm:px-2 sm:py-2"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <img
                  src={category.iconUrl}
                  alt={category.name}
                className="mx-auto h-12 w-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14"
                  loading="lazy"
                />
                <p
                className="mt-1 w-full truncate text-xs font-semibold text-gray-900 sm:text-sm"
                  title={category.name}
                >
                  {category.shortName}
                </p>
                {hoveredIdx === idx && (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(26rem,90vw)] -translate-x-1/2 rounded-xl bg-white p-6 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 transition-all duration-200 ease-out">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {category.dropdownSections.map((section) => (
                      <div key={section.title} className="flex flex-col space-y-2">
                        <p className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                          {section.title}
                        </p>
                        {section.links.map((link) => (
                          <button
                            key={link.name}
                            type="button"
                            className="rounded-md px-2 py-1 text-left text-sm text-slate-600 transition duration-150 hover:bg-medical-50 hover:text-medical-700"
                            onClick={() => {
                              if (link.url.startsWith('#')) {
                                const target = document.querySelector(link.url)
                                target?.scrollIntoView({ behavior: 'smooth' })
                              } else {
                                window.location.href = link.url
                              }
                            }}
                          >
                            {link.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500 md:hidden">
        Browse all categories tailored for you.
      </p>
      </>
    
  )
}

export default CategoryBar