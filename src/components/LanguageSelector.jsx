import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'

const LanguageSelector = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
  ]

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setIsOpen(false)
    setIsClicked(false)
    // Save to localStorage
    localStorage.setItem('i18nextLng', lng)
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  // Handle click - toggle dropdown
  const handleClick = () => {
    setIsClicked(true)
    setIsOpen(!isOpen)
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  // Handle hover enter (only if not clicked)
  const handleMouseEnter = () => {
    if (isClicked) return // Don't handle hover if clicked
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  // Handle hover leave with delay (only if not clicked)
  const handleMouseLeave = () => {
    if (isClicked) return // Don't close on hover leave if clicked
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200) // Small delay to allow moving to dropdown
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Calculate dropdown position for portal
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right
        })
      }
    }

    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsClicked(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        onClick={handleClick}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg sm:rounded-xl transition-all duration-200 group"
        aria-label="Select language"
      >
        <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:block text-sm font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{ 
            zIndex: 99999,
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  i18n.language === lang.code ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default LanguageSelector

