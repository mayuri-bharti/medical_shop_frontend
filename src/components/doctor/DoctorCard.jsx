import { MapPin, Star, Stethoscope } from 'lucide-react'

const DoctorCard = ({ doctor, onSelect }) => {
  const primaryLocation = doctor.locations?.[0]
  const languages = doctor.languages?.slice(0, 3)?.join(', ')

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="text-medical-500" size={18} />
            <p className="text-sm font-semibold text-medical-600">{doctor.specialty}</p>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mt-1">{doctor.name}</h3>
          <p className="text-sm text-gray-600">{doctor.qualifications?.join(', ')}</p>
          {languages && (
            <p className="text-xs text-gray-500 mt-1">
              Languages: <span className="font-medium">{languages}</span>
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Star className="text-yellow-400" size={16} />
              {doctor.rating?.toFixed(1) || '4.5'} • {doctor.experienceYears}+ yrs exp
            </span>
            {primaryLocation && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={16} />
                {primaryLocation.city}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ₹{doctor.consultationFee}
            <span className="text-sm text-gray-500 font-normal"> / consultation</span>
          </p>
          <button
            onClick={() => onSelect(doctor)}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-medical-600 px-5 py-2 text-white font-semibold hover:bg-medical-700 transition-colors"
          >
            View Slots
          </button>
        </div>
      </div>

      {doctor.modes?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {doctor.modes.map((mode) => (
            <span key={mode} className="px-3 py-1 text-xs font-medium rounded-full bg-medical-50 text-medical-700">
              {mode}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorCard

