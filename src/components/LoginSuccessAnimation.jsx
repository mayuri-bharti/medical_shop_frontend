import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LoginSuccessAnimation = ({ show = false, onClose = () => {} }) => {
  const confetti = useMemo(() => {
    const colors = ['#22c55e', '#34d399', '#86efac', '#10b981', '#a7f3d0', '#d1fae5']
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: Math.floor(Math.random() * 6) + 4,
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 80 + 40,
      dx: (Math.random() - 0.5) * 120,
      dy: (Math.random() - 0.5) * 120,
      delay: Math.random() * 0.15
    }))
  }, [])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, 2000)

    const handleKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', handleKey)
    }
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
          aria-label="Login success"
          onClick={onClose}
        >
          <div
            className="relative"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ filter: 'blur(12px)', backgroundColor: '#22c55e' }}
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 1.2, repeat: 1, ease: 'easeInOut' }}
            />

            <motion.div
              className="relative mx-auto flex items-center justify-center rounded-full bg-green-500 shadow-lg"
              style={{ width: 120, height: 120, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.45)' }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <motion.svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                  d="M18 34 L28 44 L48 22"
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

export default LoginSuccessAnimation




