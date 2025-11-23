import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Upload, Stethoscope, Shield, TestTube, ArrowRight } from 'lucide-react'

const getFeatures = (t) => [
  {
    title: t('features.pharmacyNearMe'),
    subtitle: t('features.findNearestStore'),
    icon: MapPin,
    link: '/near-me',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: t('features.get20Off'),
    subtitle: t('features.uploadPrescription'),
    icon: Upload,
    link: '/prescriptions',
    gradient: 'from-apollo-500 to-apollo-600',
    bgColor: 'bg-apollo-50',
    iconColor: 'text-apollo-600',
  },
  {
    title: t('features.healthInsurance'),
    subtitle: t('features.comparePlans'),
    icon: Shield,
    link: '/health-insurance',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: t('features.doctorAppointment'),
    subtitle: t('features.bookConsultation'),
    icon: Stethoscope,
    link: '/doctor-appointment',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    title: t('features.labTests'),
    subtitle: t('features.bookTestOnline'),
    icon: TestTube,
    link: '/lab-tests',
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
]

const FeatureCards = () => {
  const { t } = useTranslation()
  const features = getFeatures(t)
  return (
    <section className="bg-[#F4F8F7] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link
                key={index}
                to={feature.link}
                className="group relative bg-white rounded-xl px-6 py-8 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className={`w-9 h-9 ${feature.bgColor} group-hover:bg-white rounded-xl flex items-center justify-center transition-colors duration-300`}>
                    <Icon className={`${feature.iconColor} group-hover:text-white transition-colors duration-300`} size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] leading-tight group-hover:text-white transition-colors duration-300 truncate">
                      {feature.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wide text-[#6B7280] group-hover:text-white/90 transition-colors duration-300 truncate">
                      {feature.subtitle}
                    </p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-apollo-700 group-hover:text-white transition-colors group-hover:translate-x-0.5 duration-300" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureCards



