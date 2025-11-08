import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Upload, FileText, Trash2, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Helper to get file URL with Cloudinary optimization
const getFileUrl = (fileUrl) => {
  if (!fileUrl) return ''
  
  // If it's already a full URL (Cloudinary), return it
  if (fileUrl.startsWith('http')) {
    // If it's a Cloudinary URL, add optimization parameters
    if (fileUrl.includes('cloudinary.com')) {
      // Add Cloudinary transformations for better performance
      const separator = fileUrl.includes('?') ? '&' : '?'
      return `${fileUrl}${separator}f_auto,q_auto`
    }
    return fileUrl
  }
  
  // Local file - check if it's an API route or static file
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  
  // If it starts with /api/, it's already an API route
  if (fileUrl.startsWith('/api/')) {
    const baseUrl = apiBaseUrl.replace('/api', '')
    return `${baseUrl}${fileUrl}`
  }
  
  // Otherwise, construct full URL
  const baseUrl = apiBaseUrl.replace('/api', '')
  return `${baseUrl}/${fileUrl.replace(/^\//, '')}`
}

const Prescriptions = () => {
  const [uploadFile, setUploadFile] = useState(null)
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: prescriptionsData, isLoading } = useQuery(
    'prescriptions',
    () => api.get('/prescriptions').then(res => res.data)
  )

  // Extract the prescriptions array from the response
  // Backend returns { success: true, data: prescriptions }
  const prescriptions = Array.isArray(prescriptionsData?.data) ? prescriptionsData.data : 
                       Array.isArray(prescriptionsData) ? prescriptionsData : []

  const deletePrescriptionMutation = useMutation(
    (prescriptionId) => api.delete(`/prescriptions/${prescriptionId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prescriptions')
        toast.success('Prescription deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete prescription')
      }
    }
  )

  const uploadPrescriptionMutation = useMutation(
    (formData) => api.post('/prescriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prescriptions')
        toast.success('Prescription uploaded successfully!')
        // Reset form
        setUploadFile(null)
        setDescription('')
        setNotes('')
        // Scroll to prescriptions list
        setTimeout(() => {
          window.scrollTo({ top: document.getElementById('prescriptions-list')?.offsetTop - 100, behavior: 'smooth' })
        }, 100)
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to upload prescription'
        toast.error(message)
      }
    }
  )

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('prescription', uploadFile)
    formData.append('description', description || 'Uploaded prescription')
    if (notes) {
      formData.append('notes', notes)
    }

    try {
      await uploadPrescriptionMutation.mutateAsync(formData)
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePrescription = (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      deletePrescriptionMutation.mutate(prescriptionId)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': {
        icon: Clock,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        message: 'Your prescription is pending verification'
      },
      'Verified': {
        icon: CheckCircle,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        message: 'Your prescription has been verified'
      },
      'Completed': {
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        message: 'Your prescription processing is completed'
      }
    }

    const config = statusConfig[status] || statusConfig['Pending']
    const Icon = config.icon

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
        <Icon size={14} />
        <span className="text-xs font-medium">{status}</span>
      </div>
    )
  }

  const getStatusMessage = (status) => {
    const messages = {
      'Pending': 'Your prescription is being verified',
      'Verified': 'Your prescription has been verified and is ready',
      'Completed': 'Your prescription processing is completed'
    }
    return messages[status] || messages['Pending']
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>

      {/* Upload Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Prescription</h2>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Prescription Image/PDF
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="input-field"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Supported formats: JPG, PNG, PDF (Max size: 10MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly prescription for diabetes"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or instructions..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={uploading || !uploadFile}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            <span>{uploading ? 'Uploading...' : 'Upload Prescription'}</span>
          </button>
        </form>
      </div>

      {/* Prescriptions List */}
      <div id="prescriptions-list" className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Prescriptions</h2>
        
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="text-center py-12 card">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions uploaded</h3>
            <p className="text-gray-600">Upload your prescriptions to get started with easy ordering.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {prescription.fileType === 'application/pdf' || prescription.fileType?.includes('pdf') ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText size={48} className="text-gray-400" />
                      <span className="text-xs text-gray-500">PDF Document</span>
                    </div>
                  ) : (
                    <img
                      src={getFileUrl(prescription.fileUrl)}
                      alt={prescription.description || 'Prescription'}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // Show fallback UI on error
                        const parent = e.target.parentElement
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center space-y-2 p-4">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span class="text-xs text-gray-500 text-center">Image not available</span>
                            <a href="${getFileUrl(prescription.fileUrl)}" target="_blank" rel="noopener noreferrer" class="text-xs text-medical-600 hover:underline mt-1">View file</a>
                          </div>
                        `
                      }}
                    />
                  )}
                </div>
                
                <div className="mb-3">
                  {getStatusBadge(prescription.status || 'Pending')}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">
                  {prescription.description || 'Prescription'}
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  {getStatusMessage(prescription.status || 'Pending')}
                </p>
                
                <p className="text-xs text-gray-500 mb-4">
                  Uploaded on {new Date(prescription.createdAt).toLocaleDateString()}
                </p>

                {prescription.notes && (
                  <p className="text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded">
                    <span className="font-medium">Notes: </span>{prescription.notes}
                  </p>
                )}
                
                <div className="flex space-x-2">
                  <a
                    href={getFileUrl(prescription.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </a>
                  <button
                    onClick={() => handleDeletePrescription(prescription._id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete prescription"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Prescriptions
