import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Brain, Circle, Pill, Droplet, Smile, Wind, User, Thermometer } from 'lucide-react'

const getConditions = (t) => [
  { name: t('healthConditions.diabetes'), slug: 'diabetes', targetSlug: 'diabetes-care', icon: Droplet, color: 'text-red-600', bgColor: 'bg-red-50' },
  { name: t('healthConditions.cardiac'), slug: 'cardiac', targetSlug: 'cardiology-meds', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
  { name: t('healthConditions.stomach'), slug: 'stomach', targetSlug: 'stomach-care', icon: Circle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: t('healthConditions.painRelief'), slug: 'pain-relief', targetSlug: 'pain-relief', icon: Pill, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: t('healthConditions.liver'), slug: 'liver', targetSlug: 'liver-support', icon: Droplet, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { name: t('healthConditions.oralCare'), slug: 'oral-care', targetSlug: 'oral-care', icon: Smile, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { name: t('healthConditions.respiratory'), slug: 'respiratory', targetSlug: 'respiratory-care', icon: Wind, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { name: t('healthConditions.elderlyCare'), slug: 'elderly-care', targetSlug: 'elderly-care', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: t('healthConditions.coldImmunity'), slug: 'cold-immunity', targetSlug: 'cold-immunity', icon: Thermometer, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
]

const HealthConditions = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const conditions = getConditions(t)

  const handleConditionClick = (condition) => {
    const destination = condition.targetSlug || condition.slug
    navigate(`/subcategory/${encodeURIComponent(destination)}`)
  }

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
            {t('healthConditions.title')}
          </h2>
          <p className="text-base text-[#6B7280] max-w-2xl mx-auto">
            {t('healthConditions.description')}
          </p>
        </div>

        {/* Conditions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {conditions.map((condition, index) => {
            const Icon = condition.icon
            return (
              <button
                key={index}
                onClick={() => handleConditionClick(condition)}
                className="group bg-white rounded-xl p-4 shadow-soft hover:shadow-lg border border-gray-100 hover:border-apollo-200 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${condition.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={condition.color} size={22} />
                </div>
                
                {/* Label */}
                <h3 className="text-xs font-semibold text-[#1A1A1A] text-center group-hover:text-apollo-700 transition-colors duration-300">
                  {condition.name}
                </h3>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HealthConditions

