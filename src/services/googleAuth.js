/**
 * Google OAuth Authentication Service
 * 
 * Handles Google Sign-In using Google Identity Services (GIS)
 * Works with both localhost and production domains
 */

/**
 * Initialize Google Identity Services
 * @param {string} clientId - Google OAuth Client ID
 * @param {Function} callback - Callback function to handle the credential response
 * @returns {Promise<void>}
 */
export const initializeGoogleAuth = (clientId, callback) => {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error('Google Client ID is required'))
      return
    }

    // Check if Google Identity Services is already loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false // Disable to avoid 403 errors
        })
        resolve()
      } catch (error) {
        reject(error)
      }
      return
    }

    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'))
    }
    
    document.body.appendChild(script)
  })
}

/**
 * Render Google Sign-In button
 * @param {HTMLElement} container - Container element to render button in
 * @param {Object} options - Button rendering options
 * @returns {Promise<void>}
 */
export const renderGoogleButton = (container, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      reject(new Error('Google Identity Services not initialized'))
      return
    }

    if (!container) {
      reject(new Error('Container element is required'))
      return
    }

    try {
      // Clear container
      container.innerHTML = ''
      
      // Default button options
      const buttonOptions = {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        locale: 'en',
        width: 300,
        ...options
      }

      window.google.accounts.id.renderButton(container, buttonOptions)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Prompt Google Sign-In (One Tap)
 * @param {Function} notificationCallback - Callback for notification events
 * @returns {void}
 */
export const promptGoogleSignIn = (notificationCallback) => {
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    console.error('Google Identity Services not initialized')
    return
  }

  try {
    window.google.accounts.id.prompt((notification) => {
      if (notificationCallback) {
        notificationCallback(notification)
      }
    })
  } catch (error) {
    console.error('Error prompting Google Sign-In:', error)
  }
}

/**
 * Cancel any active Google Sign-In prompts
 * @returns {void}
 */
export const cancelGoogleSignIn = () => {
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.cancel()
    } catch (error) {
      console.error('Error canceling Google Sign-In:', error)
    }
  }
}

/**
 * Validate Google credential token format
 * @param {string} credential - Google credential token
 * @returns {boolean}
 */
export const validateCredential = (credential) => {
  if (!credential || typeof credential !== 'string') {
    return false
  }
  
  // JWT format: three parts separated by dots
  const parts = credential.split('.')
  return parts.length === 3
}

/**
 * Get current origin for debugging
 * @returns {string}
 */
export const getCurrentOrigin = () => {
  return window.location.origin
}











