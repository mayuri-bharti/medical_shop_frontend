import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getSubcategoryData, getSubcategoryList } from '../data/subcategoryProducts'
import ProductCard from '../components/ProductCard'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

const Subcategory = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const subcategory = useMemo(() => getSubcategoryData(slug), [slug])

  useEffect(() => {
    if (subcategory) {
      document.title = `${subcategory.title} | HealthPlus`
    } else {
      document.title = 'Subcategory | HealthPlus'
    }

    return () => {
      document.title = 'HealthPlus'
    }
  }, [subcategory])

  if (!subcategory) {
    const availableSubcategories = getSubcategoryList()

    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Subcategory coming soon</h1>
            <p className="text-gray-600 mb-6">
              We&apos;re still curating products for this section. In the meantime, explore our other popular selections.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {availableSubcategories.map((item) => (
                <Link
                  key={item.slug}
                  to={`/subcategory/${item.slug}`}
                  className="group rounded-xl border border-gray-200 bg-gray-50 hover:border-medical-400 hover:bg-white transition-all duration-200 p-4 text-left"
                >
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-medical-700 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3">{item.description}</p>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-medical-700 border border-medical-200 rounded-lg hover:bg-medical-50 transition-colors"
            >
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { title, description, bannerImage, products, relatedCategory } = subcategory

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="relative overflow-hidden bg-gradient-to-r from-medical-50 via-white to-medical-50">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-medium text-medical-700 shadow-sm ring-1 ring-medical-100 backdrop-blur hover:bg-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-medical-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-medical-700">
              <ShoppingBag size={14} /> {relatedCategory}
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900">{title}</h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
          <Link
            to={`/products?category=${encodeURIComponent(relatedCategory)}`}
            className="text-sm font-medium text-medical-600 hover:text-medical-700"
          >
            View all {relatedCategory}
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-500">Products will be added soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Subcategory


