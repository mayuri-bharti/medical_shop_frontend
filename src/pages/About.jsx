import { Shield, Stethoscope, Truck, Heart } from 'lucide-react'

const stats = [
  { label: 'Clinics & Partner Doctors', value: '1,200+' },
  { label: 'Pharmacy Locations', value: '750+' },
  { label: 'Products In Stock', value: '70,000+' },
  { label: 'Cities We Serve', value: '600+' }
]

const values = [
  {
    icon: Shield,
    title: 'Trusted Quality',
    description: 'Each product goes through multi-point quality checks and is sourced directly from verified manufacturers.'
  },
  {
    icon: Stethoscope,
    title: 'Care Experts',
    description: 'Our licensed pharmacists and tele-health doctors are available every day to guide you through treatments.'
  },
  {
    icon: Truck,
    title: 'Pan-India Delivery',
    description: 'Fast, temperature-safe delivery reaches more than 95% of Indian pin-codes with real-time order tracking.'
  },
  {
    icon: Heart,
    title: 'Patient First',
    description: 'From chronic care reminders to preventive health camps, every initiative is built to keep families healthy.'
  }
]

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 mb-8">
          <p className="text-medical-500 font-semibold uppercase text-sm tracking-wide mb-2">About HealthPlus</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">More than a pharmacy</h1>
          <p className="text-lg text-gray-600">
            HealthPlus began with a simple promise: make genuine medicines and expert care accessible to every Indian home.
            Today we operate India’s fastest-growing omni-channel health network that blends compassionate pharmacists,
            certified doctors, and technology-led logistics to deliver care that feels personal.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-10">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6 md:p-10 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Our Story</h2>
              <p className="text-gray-600 leading-relaxed">
                From neighbourhood counters to nationwide fulfilment centres, our journey spans two decades of relentless
                innovation. We introduced 24x7 digital prescriptions, doorstep pharmacist counselling, and subscription
                programs that ensure chronic patients never miss a dose. Every HealthPlus outlet is ISO-certified and audited
                for cold-chain compliance so vaccines, biologics, and sensitive medicines remain potent when they reach you.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Behind the scenes, a dedicated clinical operations team collaborates with more than 400 partner hospitals.
                Together we host health awareness drives, organise home sample collections, and extend emergency deliveries
                during natural calamities. The result is an ecosystem you can rely on—day or night.
              </p>
            </div>
            <div className="relative min-h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                alt="HealthPlus team"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-medical-600/10 mix-blend-multiply"></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-10">
          {values.map((value, index) => (
            <div key={value.title} className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-4">
              <div className="p-3 rounded-full bg-medical-50 text-medical-600">
                <value.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="text-gray-600 mt-1 leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Impact at a glance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center border border-gray-100 rounded-xl py-6 px-4">
                <p className="text-3xl font-bold text-medical-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-medical-600 rounded-2xl p-6 md:p-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your health partner, every step of the way</h2>
            <p className="text-medical-50/90">
              Need help with repeat prescriptions, wellness plans, or corporate vaccination drives? Talk to our care concierge team
              and experience healthcare that revolves around you.
            </p>
          </div>
          <button
            onClick={() => window.open('mailto:care@healthplus.in', '_blank')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-medical-600 font-semibold hover:bg-medical-50 transition-colors"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}

export default About









