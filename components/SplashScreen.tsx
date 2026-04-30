'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #0d1424 0%, #111827 50%, #0f1520 100%)',
          }}
        >
          {/* glow */}
          <div style={{
            position: 'absolute',
            top: '30%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400, height: 400,
            background: 'radial-gradient(ellipse, rgba(108,114,255,0.2) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', textAlign: 'center' }}
          >
            <div style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #ffffff 0%, #a0aaff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}>
              Feed.
            </div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#7b88aa',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginTop: 14,
              }}
            >
              Pilotage opérationnel
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
