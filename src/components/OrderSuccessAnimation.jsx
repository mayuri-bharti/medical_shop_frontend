import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const OrderSuccessAnimation = ({ show = false, onClose = () => {} }) => {
  const confetti = useMemo(() => {
    const colors = ['#38bdf8', '#60a5fa', '#34d399', '#fbbf24', '#f472b6']
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: Math.floor(Math.random() * 7) + 5,
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 90 + 50,
      dx: (Math.random() - 0.5) * 140,
      dy: (Math.random() - 0.5) * 140,
      delay: Math.random() * 0.2
    }))
  }, [])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-label="Order success"
        >
          <div className="relative">
            {/* Pulse glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ filter: 'blur(12px)', backgroundColor: '#3b82f6' }}
              initial={{ opacity: 0.25, scale: 0.8 }}
              animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 1.2, repeat: 1, ease: 'easeInOut' }}
            />

            {/* Blue circular badge */}
            <motion.div
              className="relative mx-auto flex items-center justify-center rounded-full bg-blue-500 shadow-lg"
              style={{ width: 120, height: 120, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.45)' }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 18 }}
            >
              {/* Checkmark box icon */}
              <motion.svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="16" width="48" height="40" rx="6" stroke="#fff" strokeWidth="4" />
                <motion.path
                  d="M24 36 L34 46 L52 28"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.25 }}
                />
              </motion.svg>
            </motion.div>

            {/* Confetti */}
            {confetti.map((p) => {
              const startX = Math.cos(p.angle) * p.distance
              const startY = Math.sin(p.angle) * p.distance
              return (
                <motion.div
                  key={p.id}
                  className="absolute rounded"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    left: 60,
                    top: 60,
                    translateX: startX,
                    translateY: startY
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 0], x: p.dx, y: p.dy, rotate: Math.random() * 360 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.25 + p.delay }}
                />
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OrderSuccessAnimation




















