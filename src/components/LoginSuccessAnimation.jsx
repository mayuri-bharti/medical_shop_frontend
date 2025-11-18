import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LoginSuccessAnimation = ({ show = false, onClose = () => {} }) => {
  const confetti = useMemo(() => {
    const colors = ['#22c55e', '#34d399', '#86efac', '#10b981', '#a7f3d0', '#d1fae5', '#fbbf24', '#f59e0b', '#ef4444', '#ec4899']
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: Math.floor(Math.random() * 8) + 5,
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 100 + 50,
      dx: (Math.random() - 0.5) * 200,
      dy: (Math.random() - 0.5) * 200,
      delay: Math.random() * 0.2
    }))
  }, [])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, 3000)

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
              className="relative mx-auto flex flex-col items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl"
                style={{ width: 120, height: 120, boxShadow: '0 20px 60px rgba(16, 185, 129, 0.5)' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.8, 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  rotate: { duration: 0.6, delay: 0.2 }
                }}
              >
                <motion.svg 
                  width="66" 
                  height="66" 
                  viewBox="0 0 66 66" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10"
                >
                  <motion.path
                    d="M18 34 L28 44 L48 22"
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.4 }}
                  />
                </motion.svg>
              </motion.div>
              
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.h2
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  Login Successful!
                </motion.h2>
                <motion.p
                  className="text-white/90 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  Welcome back! 🎉
                </motion.p>
              </motion.div>
            </motion.div>

            {confetti.map((p) => {
              const startX = Math.cos(p.angle) * p.distance
              const startY = Math.sin(p.angle) * p.distance
              return (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    left: '50%',
                    top: '50%',
                    translateX: startX,
                    translateY: startY
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    x: p.dx, 
                    y: p.dy, 
                    rotate: [0, 360, 720],
                    scale: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    ease: 'easeOut', 
                    delay: 0.3 + p.delay,
                    rotate: { duration: 1.5, ease: 'linear' }
                  }}
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




