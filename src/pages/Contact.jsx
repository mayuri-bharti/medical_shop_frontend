import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Shield } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

const contactChannels = [
  {
    icon: Phone,
    title: '24x7 Care Line',
    detail: '1800-123-9876',
    description: 'Talk to our pharmacists for order support, dosage clarifications, or emergency refills.'
  },
  {
    icon: Mail,
    title: 'Email Support',
    detail: 'care@healthplus.in',
    description: 'We respond within 6 working hours for prescription uploads, invoices, and insurance queries.'
  },
  {
    icon: MapPin,
    title: 'Corporate Office',
    detail: 'HealthPlus Park, Koramangala, Bengaluru – 560029',
    description: 'Walk in for partnerships, B2B pharmacy alliances, and media requests.'
  },
  {
    icon: Clock,
    title: 'Service Hours',
    detail: 'Always-on for online orders',
    description: 'Pharmacy counters: 7:00 am to 11:00 pm | Diagnostics concierge: 6:00 am to 9:00 pm'
  }
]

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim()
      })
      toast.success('Thanks! Our care concierge will reach out shortly.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to send message right now. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">
          <p className="text-medical-500 font-semibold uppercase text-sm tracking-wide mb-2">Contact HealthPlus</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Let’s talk about your health</h1>
          <p className="text-lg text-gray-600">
            Whether you need help with repeat prescriptions, corporate wellness drives, or you simply want to share feedback,
            we’re always listening. Reach us through any of the channels below or drop a note using the form.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {contactChannels.map((channel) => (
            <div key={channel.title} className="bg-white rounded-2xl shadow-md p-6 flex gap-4">
              <div className="p-3 rounded-full bg-medical-50 text-medical-600 h-fit">
                <channel.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{channel.title}</h3>
                <p className="text-medical-600 font-medium mt-1">{channel.detail}</p>
                <p className="text-gray-600 mt-2 leading-relaxed">{channel.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle size={24} className="text-medical-600" />
              Send us a message
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="name@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="Share details about your request..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-medical-600 text-white font-semibold hover:bg-medical-700 transition disabled:opacity-50"
              >
                {submitting ? 'Sending...' : (
                  <>
                    <Send size={18} className="mr-2" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-medical-600 rounded-2xl shadow-lg p-6 md:p-10 text-white space-y-5">
            <div className="flex items-center gap-3">
              <Shield size={28} />
              <h2 className="text-2xl font-semibold">Your data stays secure</h2>
            </div>
            <p className="text-medical-50/90 leading-loose">
              All communications are encrypted and comply with HIPAA-grade privacy practices. We use your information only to
              respond to your request. If you need urgent medical support, please contact our care line instead of this form.
            </p>
            <div className="space-y-3">
              <p className="uppercase text-xs tracking-wider text-medical-50/70">Choose your channel</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">WhatsApp Care</span>
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">Corporate Sales</span>
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">Diagnostics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

