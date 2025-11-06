import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

/**
 * PageCarousel Component
 * A responsive, reusable carousel component with auto-slide and manual navigation
 * 
 * @param {Array} images - Array of image URLs or objects with {src, alt, title, description}
 * @param {boolean} autoSlide - Enable/disable auto-sliding
 * @param {number} interval - Auto-slide interval in milliseconds
 * @param {boolean} showDots - Show navigation dots
 * @param {boolean} showArrows - Show navigation arrows
 * @param {string} height - Height class (default: h-64 md:h-96)
 */
const PageCarousel = ({ 
  images = [], 
  autoSlide = true, 
  interval = 4000,
  showDots = true,
  showArrows = true,
  showPlayPause = false,
  height = 'h-48 md:h-64 lg:h-80'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoSlide)

  // Normalize images array to handle both string URLs and objects
  const slides = images.map(img => 
    typeof img === 'string' 
      ? { src: img, alt: 'Slide image', title: '', description: '' }
      : img
  )

  // Navigate to next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    )
  }, [slides.length])

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    )
  }

  // Navigate to specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || isHovered || slides.length <= 1) return

    const timer = setInterval(() => {
      nextSlide()
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, interval, isHovered, nextSlide, slides.length])

  if (!slides.length) {
    return (
      <div className={`w-full ${height} bg-gray-200 rounded-xl flex items-center justify-center`}>
        <p className="text-gray-500">No images to display</p>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className={`relative ${height} overflow-hidden rounded-xl shadow-lg`}>
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              index === currentIndex
                ? 'translate-x-0 opacity-100'
                : index < currentIndex
                ? '-translate-x-full opacity-0'
                : 'translate-x-full opacity-0'
            }`}
          >
            {/* Image */}
            <img
              src={slide.src}
              alt={slide.alt || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            
            {/* Overlay Gradient */}
            {(slide.title || slide.description) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}
            
            {/* Text Content */}
            {(slide.title || slide.description) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                {slide.title && (
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 drop-shadow-lg animate-fade-in">
                    {slide.title}
                  </h2>
                )}
                {slide.description && (
                  <p className="text-sm md:text-lg lg:text-xl max-w-2xl drop-shadow-md animate-fade-in-delay">
                    {slide.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator for first slide */}
        <div className="absolute inset-0 bg-gray-200 animate-pulse" 
             style={{ zIndex: -1 }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                index === currentIndex
                  ? 'w-8 md:w-10 h-2 md:h-2.5 bg-white'
                  : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
          {currentIndex + 1} / {slides.length}
        </div>
      )}

      {/* Play/Pause Button */}
      {showPlayPause && slides.length > 1 && (
        <button
          onClick={togglePlayPause}
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Play className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
      )}
    </div>
  )
}

export default PageCarousel

