import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertCircle, LogOut, Shield } from 'lucide-react'
import { uploadPrescription, logout } from '../lib/api'
import toast from 'react-hot-toast'

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload a PDF, JPG, or PNG file')
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setUploaded(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('prescription', file)

      const response = await uploadPrescription(formData)

      if (response.success) {
        toast.success('Prescription uploaded successfully!')
        setUploaded(true)
        setUploadedFile(file)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload prescription')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-blue-50 to-medical-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-medical-600 to-medical-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">MediShop</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success State */}
          {uploaded && uploadedFile ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your prescription <span className="font-medium">{uploadedFile.name}</span> has been uploaded successfully.
              </p>
              <button
                onClick={() => {
                  setUploaded(false)
                  setUploadedFile(null)
                }}
                className="px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors font-medium"
              >
                Upload Another Prescription
              </button>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-8 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Upload Prescription</h2>
                    <p className="text-medical-100 mt-1">Share your prescription with us</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-6">
                  {/* File Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Prescription File
                    </label>
                    
                    {/* File Drop Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-medical-500 transition-colors cursor-pointer bg-gray-50 hover:bg-medical-50"
                    >
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />

                    {file && (
                      <div className="mt-4 flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                        <FileText className="text-blue-600" size={24} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className="w-full py-4 bg-medical-600 text-white rounded-lg font-semibold hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload Prescription</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Info */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">What happens next?</p>
                      <p className="text-blue-700">
                        Our team will review your prescription and prepare your medicines. You'll receive a notification once your order is ready for pickup or delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrescriptionUpload

