import HeroSection from '../components/home/HeroSection'
import CategoryNav from '../components/home/CategoryNav'
import FeatureCards from '../components/home/FeatureCards'
import HealthConditions from '../components/home/HealthConditions'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F4F8F7]">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Navigation */}
      <CategoryNav />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Health Conditions */}
      <HealthConditions />
    </div>
  )
}

export default HomePage











































