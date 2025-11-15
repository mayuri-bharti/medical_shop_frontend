import { useState, useEffect } from 'react'
import { getAccessToken, getAdminToken } from '../lib/api'

/**
 * Component to display images that require authentication
 * Fetches the image with auth token and displays it as a blob URL
 */
const AuthenticatedImage = ({ src, alt, className, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!src) {
      setError(true)
      setLoading(false)
      return
    }

    // If it's already a full URL (Cloudinary), use it directly
    if (src.startsWith('http')) {
      setImageSrc(src)
      setLoading(false)
      return
    }

    // For local files, fetch with authentication
    const fetchImage = async () => {
      try {
        const token = getAdminToken() || getAccessToken()
        if (!token) {
          setError(true)
          setLoading(false)
          if (onError) onError(new Error('No authentication token'))
          return
        }

        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`)
        }

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        setImageSrc(blobUrl)
        setError(false)
      } catch (err) {
        console.error('Error loading authenticated image:', err)
        setError(true)
        if (onError) onError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()

    // Cleanup blob URL on unmount
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [src])

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !imageSrc) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        setError(true)
        if (onError) onError(e)
      }}
      {...props}
    />
  )
}

export default AuthenticatedImage

