import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../services/api'
import { Upload, FileText, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const Prescriptions = () => {
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: prescriptions, isLoading } = useQuery(
    'prescriptions',
    () => api.get('/prescriptions').then(res => res.data)
  )

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

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('prescription', uploadFile)
    formData.append('description', 'Uploaded prescription')

    try {
      await api.post('/prescriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      queryClient.invalidateQueries('prescriptions')
      toast.success('Prescription uploaded successfully')
      setUploadFile(null)
      e.target.reset()
    } catch (error) {
      toast.error('Failed to upload prescription')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePrescription = (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      deletePrescriptionMutation.mutate(prescriptionId)
    }
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
              Select Prescription Image
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
          
          <button
            type="submit"
            disabled={uploading || !uploadFile}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload size={16} />
            <span>{uploading ? 'Uploading...' : 'Upload Prescription'}</span>
          </button>
        </form>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Prescriptions</h2>
        
        {!prescriptions || prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions uploaded</h3>
            <p className="text-gray-600">Upload your prescriptions to get started with easy ordering.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="card p-6">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {prescription.fileType === 'pdf' ? (
                    <FileText size={48} className="text-gray-400" />
                  ) : (
                    <img
                      src={prescription.fileUrl}
                      alt="Prescription"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  {prescription.description || 'Prescription'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Uploaded on {new Date(prescription.createdAt).toLocaleDateString()}
                </p>
                
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary flex items-center justify-center space-x-2">
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDeletePrescription(prescription._id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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




